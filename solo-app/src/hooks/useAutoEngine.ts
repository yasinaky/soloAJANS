import { useEffect, useRef } from 'react';
import { useTaskStore, useAgentStore, useNotifStore, useCompanyStore, useDecisionStore } from '../stores/index';
import type { Task, Agent, ProposedDecision } from '../types';

// --- Fallback templates (used when no API key) ---
const FALLBACK: Record<string, string[]> = {
  engineering: [
    `✅ Geliştirme tamamlandı\n\n📁 Değiştirilen dosyalar:\n• src/core/feature.ts (+89 satır)\n• tests/feature.test.ts (+45 satır)\n\n📊 Test sonuçları: 18/18 ✓\n🔒 Güvenlik taraması: Temiz\n\n→ PR incelemeye hazır`,
    `✅ Bug fix tamamlandı\n\n🐛 Root cause tespit edildi ve çözüldü\n• Regression testi geçti ✓\n• Lint: Temiz\n\n→ Production'a alınabilir`,
  ],
  marketing: [
    `✅ İçerik hazırlandı\n\n📝 Blog yazısı tamamlandı\n🎯 SEO skoru: 87/100\n📅 Yayın takvimi güncellendi\n\n→ Onaya hazır`,
  ],
  support: [
    `✅ Destek talebi çözüldü\n\n📊 CSAT: 4.8/5\n⏱️ Yanıt süresi: 3.2 dk\n\n→ Müşteri bilgilendirildi`,
  ],
  design: [
    `✅ Tasarım tamamlandı\n\n🎨 Assets teslim edildi\n✓ WCAG 2.1 AA uyumu\n✓ Dark/Light mode\n\n→ Dev handoff hazır`,
  ],
  sales: [
    `✅ Satış görevi tamamlandı\n\n📊 Pipeline güncellendi\n📧 Outreach gönderildi\n\n→ CRM güncellendi`,
  ],
  analytics: [
    `✅ Analiz tamamlandı\n\n📊 KPI raporu hazır\n🔍 İçgörüler belirlendi\n\n→ Dashboard güncellendi`,
  ],
};

function getFallback(task: Task): string {
  const pool = FALLBACK[task.department] || FALLBACK.engineering;
  return pool[Math.floor(Math.random() * pool.length)];
}

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

        if (apiKey) {
          // Real Claude API call
          callClaude(t, agent, apiKey)
            .then((text) => {
              const output = `🤖 ${agent.name} — Gerçek AI Çıktısı\n📅 ${new Date().toLocaleString('tr-TR')}\n${'─'.repeat(40)}\n\n${text}`;
              updateTask(t.id, {
                progress: 100, status: 'review', output,
                output_at: new Date().toISOString(), updated_at: new Date().toISOString(),
              });
              addNotif({ title: '✅ Görev Tamamlandı', message: `${agent.name}: ${t.title} — inceleme bekliyor`, type: 'success' });
              addXP(t.agent_id!, agent.godmode ? 2000 : 500);
            })
            .catch((err) => {
              const output = `⚠️ API Hatası: ${err.message}\n\n${getFallback(t)}`;
              updateTask(t.id, {
                progress: 100, status: 'review', output,
                output_at: new Date().toISOString(), updated_at: new Date().toISOString(),
              });
              addNotif({ title: '⚠️ API Hatası', message: `${agent.name}: ${err.message}`, type: 'warning' });
            })
            .finally(() => inFlight.current.delete(t.id));
        } else {
          // No API key — simulate with progress ticks, then fallback output
          // (handled by the progress advancement below; mark as "needs-completion")
        }
      });

      // Advance running tasks that have NO API key (simulation mode)
      if (!apiKey) {
        const running = current.filter(
          (t) => t.status === 'running' && t.agent_id && !inFlight.current.has(t.id)
        );
        running.forEach((t) => {
          const agent = agentMap[t.agent_id!];
          if (!agent) return;
          const cur = t.progress || 0;
          const inc = agent.godmode
            ? Math.floor(Math.random() * 40) + 25
            : Math.floor(Math.random() * 18) + 7;
          const next = Math.min(100, cur + inc);

          if (next >= 100) {
            const output = `🤖 ${agent.name} tarafından tamamlandı\n📅 ${new Date().toLocaleString('tr-TR')}\n⚠️ Demo mod (API key yok — Ayarlar'dan Anthropic key gir)\n\n${getFallback(t)}`;
            updateTask(t.id, {
              progress: 100, status: 'review', output,
              output_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            });
            addNotif({ title: '✅ Görev Tamamlandı (Demo)', message: `${agent.name}: ${t.title}`, type: 'success' });
            addXP(t.agent_id!, agent.godmode ? 1500 : 250);
          } else {
            updateTask(t.id, { progress: next, updated_at: new Date().toISOString() });
          }
        });
      }
      // ── Sentez: 2+ tamamlanan görevden otomatik karar öner ──
      const alreadyInProposed = new Set(proposedRef.current.flatMap((p) => p.source_task_ids));
      const doneTasks = current.filter((t) => t.status === 'done' && t.output && !alreadyInProposed.has(t.id));

      if (doneTasks.length >= 2) {
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
              const result = apiKey
                ? await callClaudeSynthesis(group, apiKey, companyRef.current.default_model)
                : templateSynthesis(group, _tag);
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
