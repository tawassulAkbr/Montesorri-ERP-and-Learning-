import { config, aiLlmEnabled } from '../../config';
import { llmClassificationSchema } from './schema';

// Optional OpenAI-compatible language model. The built-in analysis engine is
// authoritative — the LLM only classifies ambiguous questions or polishes
// prose, and any failure silently falls back to local results. Mirrors the
// RESEND_API_KEY pattern: leave AI_API_KEY empty to run fully local.

const TIMEOUT_MS = 8000;

let announcedDisabled = false;

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

async function chatJson(messages: ChatMessage[]): Promise<unknown | null> {
  if (!aiLlmEnabled) {
    if (!announcedDisabled) {
      announcedDisabled = true;
      console.log('[AI] No AI_API_KEY configured — using the built-in analysis engine. Add AI_API_KEY to server/.env to enable language-model enrichment.');
    }
    return null;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${config.AI_API_BASE.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.AI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}

/** Map an unmatched question to a known intent id, or null. */
export async function llmClassify(question: string, intentIds: string[]): Promise<string | null> {
  const raw = await chatJson([
    {
      role: 'system',
      content: `You classify questions for a Montessori school ERP. Respond with JSON {"intent": "<id>"} where <id> is exactly one of: ${intentIds.join(', ')}, fallback.`,
    },
    { role: 'user', content: question },
  ]);
  const parsed = llmClassificationSchema.safeParse(raw);
  if (!parsed.success) return null;
  const intent = parsed.data.intent.trim().toLowerCase();
  return intentIds.includes(intent) ? intent : null;
}
