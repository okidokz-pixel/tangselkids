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

/**
 * Generate the *descriptive* fields for a place from grounded context: a short
 * Indonesian "about" paragraph and a facilities list. Everything factual (phone,
 * hours, coordinates, rating) comes from Google elsewhere — this only writes prose
 * and infers facilities, and it is told NOT to invent hard facts. Returns empty
 * fields when the context is too thin to write anything faithful.
 */
export async function generatePlaceDetails(opts: {
  name: string;
  category: string;
  address?: string;
  website?: string;
  instagram?: string;
  googleSummary?: string;
  googleTypes?: string[];
  siteText?: string;
}): Promise<{ about: string; facilities: string[] }> {
  const { name, category, address, website, instagram, googleSummary, googleTypes, siteText } = opts;
  const client = getClient();

  const context = [
    `Name: ${name}`,
    `Category: ${category}`,
    address ? `Address: ${address}` : null,
    website ? `Website: ${website}` : null,
    instagram ? `Instagram: ${instagram}` : null,
    googleSummary ? `Google editorial summary: ${googleSummary}` : null,
    googleTypes?.length ? `Google place types: ${googleTypes.join(", ")}` : null,
    siteText ? `Website text (excerpt):\n${siteText.slice(0, 6000)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const message = await client.messages.create({
    model: MODEL_WRITE,
    max_tokens: 1600,
    system:
      "You write accurate, parent-facing content for TangselKids, a directory of children's facilities in Tangerang Selatan, Indonesia. Given grounded context about ONE place, produce a short Indonesian description and a list of facilities. " +
      "CRITICAL: Do NOT invent concrete facts. Only state facilities and details that are present in or clearly implied by the provided context (website text, Google summary, category). If the context is thin, keep the description general and the facilities list short — an empty list is better than guessed facilities. No prices, no accreditations, no founding years unless explicitly given. No marketing fluff, no emoji.",
    messages: [
      {
        role: "user",
        content:
          "From the context below, return ONLY a JSON object of the form " +
          '{ "about": string, "facilities": string[] }. ' +
          '"about" is 2–3 natural Indonesian paragraphs for parents. ' +
          '"facilities" is a short list of concrete facilities/features (Indonesian, e.g. "Area indoor", "Parkir luas"). ' +
          "Return no markdown and no commentary.\n\n" +
          context,
      },
    ],
  });

  const raw = stripFences(textOf(message));
  let parsed: { about?: unknown; facilities?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { about: "", facilities: [] };
  }

  const about = typeof parsed.about === "string" ? parsed.about.trim() : "";
  const facilities = Array.isArray(parsed.facilities)
    ? parsed.facilities.filter((f): f is string => typeof f === "string").map((f) => f.trim()).filter(Boolean)
    : [];
  return { about, facilities };
}
