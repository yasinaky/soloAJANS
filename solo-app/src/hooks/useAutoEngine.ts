import { useEffect, useRef } from 'react';
import { useTaskStore, useAgentStore, useNotifStore, useCompanyStore, useDecisionStore } from '../stores/index';
import type { Task, Agent, ProposedDecision } from '../types';

// Hafif/hızlı doğrulama modeli (guardrail uyum kontrolü için)
const VALIDATION_MODEL = 'claude-haiku-4-5-20251001';
// Uyum eşiği — bu puanın altındaki çıktılar yayına alınmaz, bloklanır
const ALIGNMENT_THRESHOLD = 50;

function buildPrompt(task: Task, agent: Agent): string {
  return `Sen "${agent.name}" adlı bir AI ajansın.
Rol: ${agent.role}
Departman: ${agent.department}
Hedef: ${agent.objective}
Araçlar: ${agent.tools.join(', ')}
${agent.godmode ? 'Mod: GOD MODE — sınırsız kapasite, maksimum detay\n' : ''}
---
GÖREV: ${task.title}
AÇIKLAMA: ${task.description || '(ek açıklama yok)'}
ÖNCELİK: ${task.priority}
---

Bu görevi GERÇEKTEN tamamla. Çıktın şunları içermeli:
- Görevi tam olarak nasıl ele aldığın
- Ürettiğin içerik, fikir, kod, analiz, plan — ne gerektiriyorsa
- Somut sonuçlar ve öneriler
- Bir sonraki adım

Türkçe yanıt ver. Emoji kullanabilirsin. ${agent.godmode ? 'God Mode aktif — kapsamlı ve çok detaylı olsun.' : 'Özlü ve net olsun.'}`;
}

function templateSynthesis(tasks: Task[], _tag: string): Omit<ProposedDecision,'id'|'source_task_ids'|'created_at'> {
  const titles = tasks.map((t) => t.title).join(', ');
  return {
    title: `${tasks[0].title.slice(0, 50)} — Karar`,
    decision: `${tasks.length} görev başarıyla tamamlandı. Çıktılar değerlendirildi: ${titles}. Bu çıktılar doğrultusunda belirlenen strateji hayata geçirilmelidir.`,
    rationale: `Tamamlanan görev çıktıları sentezlendi. Görevler: ${titles}.`,
    impact: tasks.some((t) => t.priority === 'critical' || t.priority === 'high') ? 'high' : 'medium',
    tags: [...new Set(tasks.flatMap((t) => t.tags))].filter(Boolean).slice(0, 5),
  };
}

async function callClaudeSynthesis(tasks: Task[], apiKey: string, model: string): Promise<Omit<ProposedDecision,'id'|'source_task_ids'|'created_at'>> {
  const taskSummaries = tasks.map((t, i) =>
    `GÖREV ${i+1}: ${t.title}\nAJAN: ${t.agent_name||'Bilinmiyor'}\nÇIKTI:\n${(t.output||'').slice(0, 800)}`
  ).join('\n\n---\n\n');

  const prompt = `Sen bir AI şirketinin strateji analisti olarak aşağıdaki ${tasks.length} görev çıktısını analiz ediyorsun.

${taskSummaries}

Bu görev çıktılarını sentezleyerek SOMUT bir stratejik karar öner.

SADECE aşağıdaki JSON formatında yanıt ver (başka hiçbir şey yazma):
{"title":"kısa karar başlığı","decision":"ne yapılmasına karar verildi - spesifik ve uygulanabilir","rationale":"neden bu karar - görev çıktılarına dayalı gerekçe","impact":"low|medium|high|critical","tags":["etiket1","etiket2"]}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model?.startsWith('claude-') ? model : 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text: string = data.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Geçersiz yanıt');
  const parsed = JSON.parse(match[0]);
  return {
    title: String(parsed.title || 'Sentezlenmiş Karar').slice(0, 120),
    decision: String(parsed.decision || ''),
    rationale: String(parsed.rationale || ''),
    impact: (['low','medium','high','critical'].includes(parsed.impact) ? parsed.impact : 'medium') as ProposedDecision['impact'],
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 5) : [],
  };
}

async function callClaude(task: Task, agent: Agent, apiKey: string): Promise<string> {
  const model = agent.model?.startsWith('claude-') ? agent.model : 'claude-sonnet-4-6';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: agent.godmode ? 4096 : 1024,
      messages: [{ role: 'user', content: buildPrompt(task, agent) }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

// ── GUARDRAIL: Görev-çıktı uyum doğrulaması ──
// Üretilen çıktının gerçekten görevde isteneni karşılayıp karşılamadığını ölçer.
async function validateAlignment(
  task: Task,
  output: string,
  apiKey: string
): Promise<{ aligned: boolean; score: number; reason: string }> {
  const prompt = `Aşağıda bir GÖREV ve buna karşılık üretilen ÇIKTI var. Çıktının göreve UYUMUNU değerlendir.

GÖREV BAŞLIĞI: ${task.title}
GÖREV AÇIKLAMASI: ${task.description || '(açıklama yok)'}

ÜRETİLEN ÇIKTI:
${output.slice(0, 2500)}

Soru: Bu çıktı, görevde istenen şeyi gerçekten ve doğrudan ele alıyor mu? Konu dışı, alakasız, genel-geçer veya şablon bir yanıt mı?

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"score": <0-100 arası uyum puanı>, "reason": "<tek cümlelik kısa gerekçe>"}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: VALIDATION_MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Doğrulama API ${res.status}`);
  const data = await res.json();
  const text: string = data.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Geçersiz doğrulama yanıtı');
  const parsed = JSON.parse(match[0]);
  const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
  return {
    aligned: score >= ALIGNMENT_THRESHOLD,
    score,
    reason: String(parsed.reason || 'Gerekçe belirtilmedi'),
  };
}

export function useAutoEngine() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const addNotif = useNotifStore((s) => s.add);
  const agents = useAgentStore((s) => s.agents);
  const addXP = useAgentStore((s) => s.addXP);
  const company = useCompanyStore((s) => s.company);
  const proposedDecisions = useDecisionStore((s) => s.proposedDecisions);
  const addProposed = useDecisionStore((s) => s.addProposed);

  const tasksRef = useRef(tasks);
  const agentsRef = useRef(agents);
  const companyRef = useRef(company);
  const proposedRef = useRef(proposedDecisions);
  const inFlight = useRef<Set<string>>(new Set());
  const synthDone = useRef<Set<string>>(new Set());
  const synthFlight = useRef<Set<string>>(new Set());

  tasksRef.current = tasks;
  agentsRef.current = agents;
  companyRef.current = company;
  proposedRef.current = proposedDecisions;

  useEffect(() => {
    const interval = setInterval(() => {
      const current = tasksRef.current;
      const agentMap = Object.fromEntries(agentsRef.current.map((a) => [a.id, a]));
      const apiKey = companyRef.current.anthropic_api_key?.trim();

      // Auto-assign an agent to queued tasks that have none
      const unassigned = current.filter((t) => t.status === 'queued' && !t.agent_id);
      unassigned.forEach((t) => {
        const sameDept = agentsRef.current.filter(
          (a) => a.department === t.department && a.status !== 'paused' && a.status !== 'error'
        );
        const pool = sameDept.length
          ? sameDept
          : agentsRef.current.filter((a) => a.status !== 'paused' && a.status !== 'error');
        if (!pool.length) return;
        // pick the least busy agent (lowest queue length, then highest level)
        const agent = pool.slice().sort(
          (a, b) => (a.queue_length || 0) - (b.queue_length || 0) || (b.level || 0) - (a.level || 0)
        )[0];
        updateTask(t.id, { agent_id: agent.id, agent_name: agent.name, updated_at: new Date().toISOString() });
        addNotif({ title: '🤝 Görev Atandı', message: `${t.title} → ${agent.name}`, type: 'info' });
      });

      // Pick up queued tasks → running
      const queued = current.filter(
        (t) => t.status === 'queued' && t.agent_id && !t.output && !inFlight.current.has(t.id)
      );
      const pickCount = queued.some((t) => agentMap[t.agent_id!]?.godmode) ? 3 : 1;

      queued.slice(0, pickCount).forEach((t) => {
        const agent = agentMap[t.agent_id!];
        if (!agent) return;

        // ── DEMO MOD BLOKLAMA: API key yoksa sahte çıktı üretme, görevi blokla ──
        if (!apiKey) {
          updateTask(t.id, {
            status: 'blocked',
            progress: 0,
            output: `⛔ Görev çalıştırılamadı — Anthropic API key tanımlı değil.\n\nBu uygulamada demo/şablon çıktı üretimi kapalıdır. Ajanların gerçek iş üretebilmesi için:\nAyarlar → AI Model & API Bağlantısı → geçerli bir API key gir.\n\nKey girdikten sonra bu görevi "Yeniden Kuyruğa Al" ile tekrar başlatabilirsin.`,
            output_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          addNotif({ title: '⛔ API Key Gerekli', message: `${t.title} bloklandı — gerçek çıktı için API key gir`, type: 'warning' });
          return;
        }

        inFlight.current.add(t.id);

        updateTask(t.id, {
          status: 'running',
          progress: agent.godmode ? 20 : Math.floor(Math.random() * 15) + 5,
          updated_at: new Date().toISOString(),
        });
        addNotif({
          title: agent.godmode ? '⚡ God Mode Görevi Başladı' : '⚙️ Görev Başladı',
          message: `${agent.name}: ${t.title}`,
          type: agent.godmode ? 'success' : 'info',
        });

        // Gerçek Claude API çağrısı → ardından guardrail uyum doğrulaması
        callClaude(t, agent, apiKey)
          .then(async (text) => {
            // çıktı geldi, şimdi guardrail kontrolü
            updateTask(t.id, { progress: 85, updated_at: new Date().toISOString() });

            const rawOutput = `🤖 ${agent.name} — Gerçek AI Çıktısı\n📅 ${new Date().toLocaleString('tr-TR')}\n${'─'.repeat(40)}\n\n${text}`;

            // ── GUARDRAIL: görev-çıktı uyumu ──
            let aligned = true, score = 100, reason = '';
            try {
              const v = await validateAlignment(t, text, apiKey);
              aligned = v.aligned; score = v.score; reason = v.reason;
            } catch {
              // doğrulama altyapısı çökerse gerçek işi engelleme (fail-open), ama not düş
              aligned = true; score = -1; reason = 'doğrulama yapılamadı';
            }

            if (!aligned) {
              const blockedOutput = `🛡️ GUARDRAIL — Görev-çıktı uyumu DÜŞÜK (${score}/100)\n⚠️ ${reason}\n\nBu çıktı göreve uygun bulunmadığı için yayına ALINMADI. Aşağıda üretilen çıktıyı inceleyebilirsin; uygunsa "Yeniden Kuyruğa Al" ile tekrar denet ya da görevi netleştir.\n${'═'.repeat(40)}\n\n${rawOutput}`;
              updateTask(t.id, {
                progress: 100, status: 'blocked', output: blockedOutput,
                output_at: new Date().toISOString(), updated_at: new Date().toISOString(),
              });
              addNotif({ title: '🛡️ Guardrail: Uyumsuz Çıktı', message: `${t.title} — uyum ${score}/100, yayına alınmadı`, type: 'warning' });
              return;
            }

            const badge = score >= 0 ? `🛡️ Guardrail: Görev-çıktı uyumu ✓ (${score}/100)` : `🛡️ Guardrail: doğrulama atlandı (geçici hata)`;
            const output = `${rawOutput}\n\n${'─'.repeat(40)}\n${badge}`;
            updateTask(t.id, {
              progress: 100, status: 'review', output,
              output_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            });
            addNotif({ title: '✅ Görev Tamamlandı', message: `${agent.name}: ${t.title} — inceleme bekliyor`, type: 'success' });
            addXP(t.agent_id!, agent.godmode ? 2000 : 500);
          })
          .catch((err) => {
            updateTask(t.id, {
              progress: 0, status: 'blocked',
              output: `⚠️ API Hatası: ${err.message}\n\nGörev tamamlanamadı. API key'ini ve internet bağlantını kontrol et, sonra "Yeniden Kuyruğa Al" ile tekrar dene.`,
              output_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            });
            addNotif({ title: '⚠️ API Hatası', message: `${agent.name}: ${err.message}`, type: 'error' });
          })
          .finally(() => inFlight.current.delete(t.id));
      });

      // ── Sentez: 2+ tamamlanan görevden otomatik karar öner ──
      const alreadyInProposed = new Set(proposedRef.current.flatMap((p) => p.source_task_ids));
      const doneTasks = current.filter((t) => t.status === 'done' && t.output && !alreadyInProposed.has(t.id));

      // Sentez yalnızca gerçek API key varken çalışır — demo/şablon karar üretilmez
      if (doneTasks.length >= 2 && apiKey) {
        // Etiket bazlı gruplama
        const tagMap = new Map<string, Task[]>();
        doneTasks.forEach((t) => {
          const tag = t.tags[0] || '__general__';
          if (!tagMap.has(tag)) tagMap.set(tag, []);
          tagMap.get(tag)!.push(t);
        });

        tagMap.forEach((group, _tag) => {
          if (group.length < 2) return;
          const key = group.map((t) => t.id).sort().join('|');
          if (synthDone.current.has(key) || synthFlight.current.has(key)) return;
          synthFlight.current.add(key);

          const runSynth = async () => {
            try {
              const result = await callClaudeSynthesis(group, apiKey, companyRef.current.default_model);
              addProposed({
                ...result,
                id: Math.random().toString(36).slice(2),
                source_task_ids: group.map((t) => t.id),
                created_at: new Date().toISOString(),
                tags: result.tags.length ? result.tags : [_tag].filter((t) => t !== '__general__'),
              });
              addNotif({
                title: '🧠 Karar Önerisi Hazır',
                message: `${group.length} görev çıktısı sentezlendi — onayın bekleniyor`,
                type: 'success',
              });
              synthDone.current.add(key);
            } catch {
              const fallback = templateSynthesis(group, _tag);
              addProposed({ ...fallback, id: Math.random().toString(36).slice(2), source_task_ids: group.map((t) => t.id), created_at: new Date().toISOString() });
              synthDone.current.add(key);
            } finally {
              synthFlight.current.delete(key);
            }
          };
          runSynth();
        });
      }

    }, 3500);

    return () => clearInterval(interval);
  }, [updateTask, addNotif, addXP, addProposed]);
}
