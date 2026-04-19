# Requires: Python>=3.10, pydantic>=2.5,<3, anthropic>=0.39,<1.0

from __future__ import annotations

import json
import os
import time
from typing import List, Type, Literal

from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError

load_dotenv()

try:
    import anthropic
    from anthropic import Anthropic
except ImportError:
    raise SystemExit("anthropic package required. Install with: pip install anthropic")

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

MODEL_EXECUTOR = os.getenv("MODEL_EXECUTOR")
MODEL_PLANNER = os.getenv("MODEL_PLANNER")   # reserved for future orchestration
MODEL_CRITIC = os.getenv("MODEL_CRITIC")     # reserved for future critique pass
API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not all([MODEL_EXECUTOR, API_KEY]):
    raise SystemExit("Missing required env vars: MODEL_EXECUTOR, ANTHROPIC_API_KEY")

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

def _build_json_prompt(task_prompt: str, schema: Type[BaseModel]) -> str:
    schema_str = json.dumps(schema.model_json_schema(), indent=2)
    return (
        f"{task_prompt}\n\n"
        f"Respond with raw JSON only — no markdown, no explanation.\n"
        f"JSON must conform to this schema:\n{schema_str}"
    )


def call_llm_json(client, model: str, prompt: str, schema: Type[BaseModel]):
    json_prompt = _build_json_prompt(prompt, schema)
    last_error = None

    # Transient retry (network/rate-limit) — up to 3 attempts with backoff
    for attempt in range(3):
        try:
            resp = client.messages.create(
                model=model,
                max_tokens=2000,
                messages=[{"role": "user", "content": json_prompt}],
            )
            raw = "".join(b.text for b in resp.content if b.type == "text")
            break
        except TRANSIENT as e:
            last_error = e
            if attempt == 2:
                raise RuntimeError(f"Transient error after 3 attempts: {e}") from e
            time.sleep(2 ** attempt)
    else:
        raise RuntimeError(last_error)

    # Validation retry — keep original prompt context, only append error
    for fix_attempt in range(3):
        try:
            return schema.model_validate_json(raw)
        except (ValidationError, json.JSONDecodeError) as e:
            if fix_attempt == 2:
                raise RuntimeError(f"JSON validation failed after 3 fix attempts: {e}") from e
            fix_prompt = (
                f"{json_prompt}\n\n"
                f"Your previous response was invalid. Error: {e}\n"
                f"Return corrected raw JSON only."
            )
            resp = client.messages.create(
                model=model,
                max_tokens=2000,
                messages=[{"role": "user", "content": fix_prompt}],
            )
            raw = "".join(b.text for b in resp.content if b.type == "text")

    raise RuntimeError("Unreachable")


# =====================
# PIPELINE
# =====================

def run_pipeline(brief: str):
    client = Anthropic(api_key=API_KEY)

    icp = call_llm_json(
        client, MODEL_EXECUTOR,
        f"Brief: {brief}\n\nGenerate the Ideal Customer Profile (ICP).",
        ICPResult,
    )

    usecases = call_llm_json(
        client, MODEL_EXECUTOR,
        f"ICP: {json.dumps(icp.model_dump())}\n\nGenerate AI use cases for this ICP.",
        UseCaseSet,
    )

    roi = call_llm_json(
        client, MODEL_EXECUTOR,
        f"Use cases: {json.dumps(usecases.model_dump())}\n\nEstimate ROI for each use case.",
        ROISet,
    )

    risks = call_llm_json(
        client, MODEL_EXECUTOR,
        f"Use cases: {json.dumps(usecases.model_dump())}\n\nList implementation risks for each use case.",
        RiskRegister,
    )

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
# TESTS
# =====================

def _test_schema():
    # Field presence and type validation
    icp = ICPResult(segment="x", pains=["a"], current_workflows=["b"], buying_motives=["c"])
    assert icp.segment == "x"
    assert icp.pains == ["a"]

    # Empty lists are valid (schema allows it)
    empty = ICPResult(segment="s", pains=[], current_workflows=[], buying_motives=[])
    assert empty.pains == []

    # Missing required field must raise
    try:
        ICPResult(pains=["a"], current_workflows=["b"], buying_motives=["c"])  # no segment
        raise AssertionError("Should have raised ValidationError")
    except ValidationError:
        pass

    # JSON round-trip
    uc = UseCase(name="n", workflow="w", problem="p", proposed_ai_solution="s", expected_value="v")
    assert UseCase.model_validate_json(uc.model_dump_json()) == uc


# =====================
# CLI
# =====================

if __name__ == "__main__":
    _test_schema()

    brief = "AI opportunity analysis for media company"
    result = run_pipeline(brief)
    print(render(result))
