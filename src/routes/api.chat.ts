import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatBody = {
  messages?: UIMessage[];
  threadId?: string;
  lang?: string;
};

const SYSTEM = (lang: string) => `You are Orvia, a friendly AI farming assistant for Myanmar farmers, buyers, traders, and transport providers using the Orvia agriculture platform.

Domains you advise on:
- Crop recommendations (rice, pulses, sesame, groundnut, onion, corn, etc.)
- Weather and seasonal planning
- Pest and disease control (organic and chemical options)
- Market prices and selling strategy
- Transport and logistics for agricultural goods
- How to use Orvia features: Crop Doctor, Market Analytics, AI Insights, Vehicle / Transport booking, Listings

Style:
- Be practical and short. Prefer bullet points and step-by-step answers.
- Reply in the user's language (code: ${lang}). If lang=my use Myanmar Unicode (no Zawgyi). If lang=en use plain English.
- All advice is a recommendation, not a guarantee.
- If a user asks something outside agriculture or the Orvia platform, briefly redirect them back to farming/marketplace help.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as ChatBody;
          const messages = body.messages;
          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response("Missing messages", { status: 400 });
          }
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

          const gateway = createLovableAiGatewayProvider(key);
          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system: SYSTEM(body.lang ?? "en"),
            messages: await convertToModelMessages(messages),
          });

          // Persist messages when an authenticated thread is provided.
          const authHeader = request.headers.get("authorization") ?? "";
          const bearer = authHeader.replace(/^Bearer\s+/i, "");
          const threadId = body.threadId;

          return result.toUIMessageStreamResponse({
            originalMessages: messages,
            onFinish: async ({ messages: finalMessages }) => {
              if (!threadId || !bearer) return;
              try {
                const url = process.env.SUPABASE_URL;
                const pub = process.env.SUPABASE_PUBLISHABLE_KEY;
                if (!url || !pub) return;
                const supa = createClient(url, pub, {
                  global: { headers: { Authorization: `Bearer ${bearer}` } },
                  auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
                });
                const { data: userRes } = await supa.auth.getUser(bearer);
                const userId = userRes.user?.id;
                if (!userId) return;

                // Persist only the last user message + the new assistant message.
                const lastUser = [...messages].reverse().find((m) => m.role === "user");
                const lastAssistant = [...finalMessages].reverse().find((m) => m.role === "assistant");
                const rows: Array<{
                  thread_id: string;
                  user_id: string;
                  role: string;
                  parts: unknown;
                }> = [];
                if (lastUser) {
                  rows.push({
                    thread_id: threadId,
                    user_id: userId,
                    role: "user",
                    parts: lastUser.parts ?? [{ type: "text", text: "" }],
                  });
                }
                if (lastAssistant) {
                  rows.push({
                    thread_id: threadId,
                    user_id: userId,
                    role: "assistant",
                    parts: lastAssistant.parts ?? [{ type: "text", text: "" }],
                  });
                }
                if (rows.length > 0) {
                  const sb = supa as unknown as {
                    from: (t: string) => {
                      insert: (v: unknown) => Promise<unknown>;
                      update: (v: unknown) => { eq: (c: string, v: string) => Promise<unknown> };
                    };
                  };
                  await sb.from("chat_messages").insert(rows);
                  await sb.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
                }

              } catch (e) {
                console.error("[chat] persist error", e);
              }
            },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          if (/402/.test(msg)) return new Response("AI credits exhausted", { status: 402 });
          if (/429/.test(msg)) return new Response("AI rate limit reached", { status: 429 });
          console.error("[chat] error", e);
          return new Response("AI service error", { status: 500 });
        }
      },
    },
  },
});
