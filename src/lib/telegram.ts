import { kvGet, kvSet } from "./kv";

/**
 * Minimal Telegram Bot API client. Token in TELEGRAM_BOT_TOKEN.
 * The bot is single-owner: only @OWNER_USERNAME may use it; their numeric chat id
 * is captured on first contact and stored in KV ("bot:owner_chat").
 */

const OWNER_USERNAME = (process.env.TELEGRAM_OWNER_USERNAME || "okidokz").replace(/^@/, "").toLowerCase();

function token(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

export async function tg(method: string, params: Record<string, unknown>): Promise<unknown> {
  const t = token();
  if (!t) { console.warn("[tg] TELEGRAM_BOT_TOKEN not set"); return null; }
  try {
    const res = await fetch(`https://api.telegram.org/bot${t}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const j = await res.json().catch(() => ({}));
    if (!(j as { ok?: boolean }).ok) console.error("[tg]", method, "failed:", JSON.stringify(j).slice(0, 300));
    return j;
  } catch (e) { console.error("[tg] network error:", e); return null; }
}

export type InlineButton = { text: string; callback_data?: string; url?: string };

export async function sendMessage(chatId: string | number, text: string, buttons?: InlineButton[][]): Promise<void> {
  await tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: false,
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  });
}

export async function answerCallback(id: string, text?: string): Promise<void> {
  await tg("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
}

export async function editMessageText(chatId: string | number, messageId: number, text: string, buttons?: InlineButton[][]): Promise<void> {
  await tg("editMessageText", {
    chat_id: chatId, message_id: messageId, text, parse_mode: "HTML",
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : { reply_markup: { inline_keyboard: [] } }),
  });
}

/** Download a Telegram file (by file_id) as a base64 data string + mime. */
export async function downloadFile(fileId: string): Promise<{ base64: string; mime: string } | null> {
  const t = token();
  if (!t) return null;
  const meta = (await tg("getFile", { file_id: fileId })) as { result?: { file_path?: string } } | null;
  const path = meta?.result?.file_path;
  if (!path) return null;
  try {
    const res = await fetch(`https://api.telegram.org/file/bot${t}/${path}`);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = (path.split(".").pop() || "jpg").toLowerCase();
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return { base64: buf.toString("base64"), mime };
  } catch { return null; }
}

// ── Owner identity ──────────────────────────────────────────────────────────
export async function getOwnerChat(): Promise<string | null> {
  return kvGet("bot:owner_chat");
}

/** Returns true if this update is from the owner; captures their chat id on first contact. */
export async function authorizeOwner(from: { id: number; username?: string } | undefined, chatId: number): Promise<boolean> {
  if (!from) return false;
  const stored = await getOwnerChat();
  if (stored) return String(chatId) === stored;
  // Not yet bound — bind to the first message from the allowlisted username.
  if ((from.username || "").toLowerCase() === OWNER_USERNAME) {
    await kvSet("bot:owner_chat", String(chatId));
    return true;
  }
  return false;
}

/** Send a message to the owner (used by monitors + agents). No-op if unbound. */
export async function notifyOwnerTelegram(text: string, buttons?: InlineButton[][]): Promise<boolean> {
  const chat = await getOwnerChat();
  if (!chat) return false;
  await sendMessage(chat, text, buttons);
  return true;
}
