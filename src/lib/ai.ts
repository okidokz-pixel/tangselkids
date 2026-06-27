import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Claude-backed helpers for the admin: expand/clean up Indonesian descriptions
 * and translate fields to English. Server-only — reads ANTHROPIC_API_KEY (a
 * pay-as-you-go Console API key; the Claude Max subscription does NOT grant API
 * access). Without the key, callers return a friendly "not configured" error.
 *
 * Models are cheap-by-default and swappable in one place: bump these to
 * "claude-opus-4-8" if you want maximum quality.
 */
const MODEL_TRANSLATE = "claude-haiku-4-5"; // fast + cheap, ideal for translation
const MODEL_WRITE = "claude-sonnet-4-6"; // better prose for description rewriting

export function hasAnthropicKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function getClient(): Anthropic {
  return new Anthropic(); // reads ANTHROPIC_API_KEY from env
}

/** Pull the text out of a non-streaming Messages response. */
function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/** Strip ```json fences if the model wrapped its JSON. */
function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

/**
 * Rewrite/expand an Indonesian facility description into ~`paragraphs` clean,
 * parent-facing paragraphs. Returns the improved Indonesian text.
 */
export async function improveDescription(opts: {
  text: string;
  name?: string;
  category?: string;
  paragraphs?: number;
}): Promise<string> {
  const { text, name, category, paragraphs = 4 } = opts;
  const client = getClient();

  const message = await client.messages.create({
    model: MODEL_WRITE,
    max_tokens: 2048,
    system:
      "You write clear, warm, accurate descriptions for TangselKids, a directory of children's facilities (schools, daycares, clinics, cafes, playgrounds) in Tangerang Selatan, Indonesia. Write in natural Indonesian for parents. Be specific and factual — do NOT invent concrete details (prices, accreditations, founding years, named programs) that aren't present in or clearly implied by the draft. No marketing fluff or emoji.",
    messages: [
      {
        role: "user",
        content:
          `Rewrite and expand the description below into about ${paragraphs} well-structured paragraphs in Indonesian. ` +
          `Keep all facts faithful to the draft; improve flow, clarity and completeness only.\n\n` +
          `Facility: ${name ?? "(unnamed)"}${category ? ` — ${category}` : ""}\n\n` +
          `Draft:\n${text}\n\n` +
          `Return only the rewritten description, no preamble.`,
      },
    ],
  });

  return textOf(message);
}

/**
 * Translate a map of Indonesian fields to English. Returns the same keys with
 * English values. Proper nouns are preserved; comma-separated lists stay
 * comma-separated. Empty inputs are skipped.
 */
export async function translateFields(
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim() !== "");
  if (entries.length === 0) return {};

  const client = getClient();
  const input = Object.fromEntries(entries);

  const message = await client.messages.create({
    model: MODEL_TRANSLATE,
    max_tokens: 4096,
    system:
      "You are a professional Indonesian→English translator for TangselKids, a children's facility directory. Translate naturally and concisely for an international parent audience, preserving meaning and tone. Keep proper nouns (facility names, places, neighborhoods) untranslated. Keep comma-separated lists comma-separated.",
    messages: [
      {
        role: "user",
        content:
          "Translate every string value in this JSON object to English. " +
          "Return ONLY a JSON object with the exact same keys and English values — no markdown, no commentary.\n\n" +
          JSON.stringify(input, null, 2),
      },
    ],
  });

  const raw = stripFences(textOf(message));
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Translation returned malformed JSON. Try again.");
  }

  const out: Record<string, string> = {};
  for (const key of Object.keys(input)) {
    const v = parsed[key];
    if (typeof v === "string") out[key] = v.trim();
  }
  return out;
}
