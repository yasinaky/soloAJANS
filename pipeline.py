# Requires: Python>=3.10, pydantic>=2.5,<3, anthropic>=0.39,<1.0

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Type, Literal

from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError

load_dotenv()

# =====================
# IMPORT (REAL MODE ONLY)
# =====================

try:
    import anthropic
    from anthropic import Anthropic
except ImportError:
    raise SystemExit("anthropic package required for REAL mode. Install with: pip install anthropic")

# =====================
# TRANSIENT SAFE GUARD
# =====================

_transient_names = (
    "APITimeoutError",
    "RateLimitError",
    "InternalServerError",
    "APIConnectionError",
)

TRANSIENT = tuple(
    cls for name in _transient_names
    if (cls := getattr(anthropic, name, None))
) or (Exception,)

# =====================
# CONFIG
# =====================

MODEL_PLANNER = os.getenv("MODEL_PLANNER")
MODEL_EXECUTOR = os.getenv("MODEL_EXECUTOR")
MODEL_CRITIC = os.getenv("MODEL_CRITIC")

API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not all([MODEL_PLANNER, MODEL_EXECUTOR, MODEL_CRITIC, API_KEY]):
    raise SystemExit("Missing required env vars")

# =====================
# SCHEMAS
# =====================

class Task(BaseModel):
    id: str
    role: Literal["icp_synthesis", "use_case_generation", "roi_estimation", "risk_mapping"]
    deps: List[str] = Field(default_factory=list)
    instructions: str


class Plan(BaseModel):
    objective: str
    tasks: List[Task]


class ICPResult(BaseModel):
    segment: str
    pains: List[str]
    current_workflows: List[str]
    buying_motives: List[str]


class UseCase(BaseModel):
    name: str
    workflow: str
    problem: str
    proposed_ai_solution: str
    expected_value: str


class UseCaseSet(BaseModel):
    use_cases: List[UseCase]


class ROIResult(BaseModel):
    use_case_name: str
    assumptions: List[str]
    estimated_savings_usd_yearly: str
    estimated_time_to_value: str


class ROISet(BaseModel):
    rois: List[ROIResult]


class RiskItem(BaseModel):
    risk: str
    mitigation: str
    owner: str


class RiskRegister(BaseModel):
    risks: List[RiskItem]


# =====================
# LLM CALL
# =====================


def call_llm_json(client, model: str, prompt: str, schema: Type[BaseModel]):
    last_error = None

    for i in range(3):
        try:
            resp = client.messages.create(
                model=model,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )

            raw = "".join(b.text for b in resp.content if b.type == "text")
            return schema.model_validate_json(raw)

        except (ValidationError, json.JSONDecodeError) as e:
            last_error = e
            prompt = f"Fix JSON:\n{e}\n\n{prompt}"

        except TRANSIENT as e:
            last_error = e
            time.sleep(2 ** i)

    raise RuntimeError(last_error)


# =====================
# PIPELINE
# =====================


def run_pipeline(brief: str):
    client = Anthropic(api_key=API_KEY)

    # ICP
    icp = call_llm_json(client, MODEL_EXECUTOR, brief + "\nGenerate ICP", ICPResult)

    # Use cases
    usecases = call_llm_json(client, MODEL_EXECUTOR, json.dumps(icp.model_dump()) + "\nGenerate use cases", UseCaseSet)

    # ROI
    roi = call_llm_json(client, MODEL_EXECUTOR, json.dumps(usecases.model_dump()) + "\nEstimate ROI", ROISet)

    # Risk
    risks = call_llm_json(client, MODEL_EXECUTOR, json.dumps(usecases.model_dump()) + "\nList risks", RiskRegister)

    return {
        "icp": icp.model_dump(),
        "usecases": usecases.model_dump(),
        "roi": roi.model_dump(),
        "risks": risks.model_dump(),
    }


# =====================
# RENDER
# =====================


def render(bundle: dict) -> str:
    md = ["# AI Opportunity Map\n"]

    md.append("## ICP")
    md.append(bundle["icp"]["segment"])

    md.append("\n## Use Cases")
    for uc in bundle["usecases"]["use_cases"]:
        md.append(f"- {uc['name']} ({uc['workflow']})")

    md.append("\n## ROI")
    for r in bundle["roi"]["rois"]:
        md.append(f"- {r['use_case_name']} -> {r['estimated_savings_usd_yearly']}")

    md.append("\n## Risks")
    for r in bundle["risks"]["risks"]:
        md.append(f"- {r['risk']} ({r['owner']})")

    return "\n".join(md)


# =====================
# TEST
# =====================


def _test_schema():
    assert ICPResult(segment="x", pains=["a"], current_workflows=["b"], buying_motives=["c"])


# =====================
# CLI
# =====================

if __name__ == "__main__":
    _test_schema()

    brief = "AI opportunity analysis for media company"
    result = run_pipeline(brief)
    print(render(result))
