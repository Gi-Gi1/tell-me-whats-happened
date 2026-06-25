import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, Send, Plus, Trash2, Sprout, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import {
  listChatThreads,
  createChatThread,
  deleteChatThread,
  listThreadMessages,
  type ChatThread,
} from "@/lib/chat.functions";
import ReactMarkdown from "react-markdown";

type Mode = "list" | "chat";

export function ChatWidget() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("list");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const listFn = useServerFn(listChatThreads);
  const createFn = useServerFn(createChatThread);
  const deleteFn = useServerFn(deleteChatThread);
  const messagesFn = useServerFn(listThreadMessages);

  // Keep a fresh bearer token for the chat transport (server fns auto-attach,
  // but the raw /api/chat POST needs it manually for persistence).
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setAuthToken(data.session?.access_token ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      setAuthToken(s?.access_token ?? null);
    });
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const loadThreads = async () => {
    if (!user) { setThreads([]); return; }
    setLoadingThreads(true);
    try {
      const rows = await listFn();
      setThreads(rows);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    if (open && user) { void loadThreads(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const openThread = async (t: ChatThread) => {
    setActiveId(t.id);
    setMode("chat");
    setInitialMessages(null);
    const rows = await messagesFn({ data: { threadId: t.id } });
    const msgs: UIMessage[] = rows.map((r) => ({
      id: r.id,
      role: (r.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
      parts: ((r.parts as Array<{ type: string; text?: string }>) ?? [{ type: "text", text: "" }]).map((p) => ({
        type: "text" as const,
        text: p.text ?? "",
      })),
    }));
    setInitialMessages(msgs);

  };

  const newThread = async () => {
    if (!user) return;
    const t = await createFn({ data: { title: "New chat" } });
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
    setMode("chat");
    setInitialMessages([]);
  };

  const removeThread = async (id: string) => {
    await deleteFn({ data: { id } });
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMode("list");
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("chatOpen", { en: "Open AI farming assistant", my: "AI လယ်ယာ အကြံပေး ဖွင့်ရန်" })}
          className="fixed bottom-4 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-agri-tiger text-white shadow-xl shadow-agri-tiger/40 ring-2 ring-white/30 transition hover:scale-105 sm:bottom-6 sm:right-6"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed inset-x-2 bottom-2 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-white/15 bg-agri-primary-dark/95 text-white shadow-2xl backdrop-blur-xl sm:bottom-6 sm:right-6 sm:left-auto sm:w-[400px]">
          <header className="flex items-center justify-between gap-2 border-b border-white/10 bg-agri-primary-dark/90 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              {mode === "chat" && user && (
                <button
                  type="button"
                  onClick={() => { setMode("list"); setActiveId(null); }}
                  className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label={t("back")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-agri-tiger text-white">
                <Sprout className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-extrabold leading-tight">
                  Orvia <span className="text-agri-butter">AI</span>
                </p>
                <p className="truncate text-[10px] uppercase tracking-wider text-white/60">
                  {t("aiFarmAssistant", { en: "AI Farming Assistant", my: "AI လယ်ယာ အကြံပေး" })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label={t("cancel")}
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {!user ? (
            <SignedOutBody t={t} />
          ) : mode === "list" ? (
            <ThreadList
              threads={threads}
              loading={loadingThreads}
              onOpen={openThread}
              onNew={newThread}
              onDelete={removeThread}
              t={t}
            />
          ) : activeId && initialMessages !== null ? (
            <ChatPanel
              key={activeId}
              threadId={activeId}
              initialMessages={initialMessages}
              lang={lang}
              authToken={authToken}
              t={t}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-white/70">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("loading")}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SignedOutBody({ t }: { t: (k: string, fb?: { en: string; my: string }) => string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Sprout className="h-10 w-10 text-agri-butter" />
      <p className="text-sm font-semibold text-white">
        {t("chatSignInTitle", { en: "Sign in to chat with Orvia AI", my: "Orvia AI နှင့် စကားပြောရန် အကောင့်ဝင်ပါ" })}
      </p>
      <p className="text-xs leading-relaxed text-white/70">
        {t("chatSignInBody", {
          en: "Save your chats and get personalized advice on crops, prices, weather and transport.",
          my: "သင့်စကားပြောကို သိမ်းဆည်းပြီး သီးနှံ၊ ဈေး၊ ရာသီဥတု၊ သယ်ယူပို့ဆောင်ရေး အကြံပြုချက်များ ရရှိရန်။",
        })}
      </p>
      <a
        href="/auth"
        className="inline-flex items-center gap-2 rounded-full bg-agri-tiger px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg"
      >
        {t("signIn")}
      </a>
    </div>
  );
}

function ThreadList({
  threads,
  loading,
  onOpen,
  onNew,
  onDelete,
  t,
}: {
  threads: ChatThread[];
  loading: boolean;
  onOpen: (t: ChatThread) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  t: (k: string, fb?: { en: string; my: string }) => string;
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={onNew}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-agri-tiger px-3 py-2.5 text-sm font-bold text-white shadow-md hover:bg-agri-tiger/90"
        >
          <Plus className="h-4 w-4" />
          {t("chatNew", { en: "New conversation", my: "စကားပြောအသစ်" })}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("loading")}
          </div>
        )}
        {!loading && threads.length === 0 && (
          <p className="px-3 py-8 text-center text-xs text-white/60">
            {t("chatEmpty", { en: "No conversations yet. Start a new chat above.", my: "စကားပြောမရှိသေးပါ။ အပေါ်တွင် အသစ်စတင်ပါ။" })}
          </p>
        )}
        <ul className="space-y-1">
          {threads.map((th) => (
            <li key={th.id} className="group flex items-center gap-1 rounded-lg hover:bg-white/5">
              <button
                type="button"
                onClick={() => onOpen(th)}
                className="flex-1 truncate rounded-lg px-3 py-2.5 text-left text-sm text-white/85"
              >
                {th.title || t("chatNew", { en: "New conversation", my: "စကားပြောအသစ်" })}
                <span className="ml-2 text-[10px] text-white/40">
                  {new Date(th.updated_at).toLocaleDateString()}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(th.id)}
                aria-label={t("delete", { en: "Delete", my: "ဖျက်ရန်" })}
                className="mr-2 rounded-full p-1.5 text-white/50 opacity-0 transition group-hover:opacity-100 hover:bg-agri-cherry/30 hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ChatPanel({
  threadId,
  initialMessages,
  lang,
  authToken,
  t,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  lang: string;
  authToken: string | null;
  t: (k: string, fb?: { en: string; my: string }) => string;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: () => ({
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      }),
      body: () => ({ threadId, lang }),
    }),
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  const submit = async () => {
    const txt = input.trim();
    if (!txt || busy) return;
    setInput("");
    await sendMessage({ text: txt });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/80">
            <p className="mb-2 font-bold text-agri-butter">
              {t("chatHelloTitle", { en: "Hi! I'm Orvia AI 🌾", my: "မင်္ဂလာပါ! ကျွန်တော် Orvia AI 🌾" })}
            </p>
            <p>
              {t("chatHelloBody", {
                en: "Ask me about crops, weather, prices, pest control, or how to use Orvia features.",
                my: "သီးနှံ၊ ရာသီဥတု၊ ဈေး၊ ပိုးကာကွယ်ရေး၊ Orvia အသုံးပြုပုံတို့အကြောင်း မေးနိုင်ပါသည်။",
              })}
            </p>
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("")
            .trim();
          const mine = m.role === "user";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  mine
                    ? "bg-agri-tiger text-white"
                    : "bg-white/8 text-white/95 border border-white/10"
                }`}
              >
                {mine ? (
                  <p className="whitespace-pre-wrap">{text}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                    <ReactMarkdown>{text || "…"}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {status === "submitted" && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-white/8 px-3.5 py-2.5 text-sm text-white/70">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-agri-butter" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-agri-butter [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-agri-butter [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        {error && (
          <p className="rounded-lg border border-agri-cherry/40 bg-agri-cherry/15 px-3 py-2 text-xs text-white">
            {t("chatError", { en: "Couldn't reach AI. Please try again.", my: "AI သို့ မဆက်သွယ်နိုင်ပါ။ ထပ်ကြိုးစားပါ။" })}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
        className="flex items-end gap-2 border-t border-white/10 bg-agri-primary-dark/80 p-3"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          rows={1}
          disabled={busy}
          placeholder={t("chatPlaceholder", { en: "Ask anything about farming…", my: "လယ်ယာအကြောင်း မေးပါ…" })}
          className="max-h-32 flex-1 resize-none rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-agri-butter focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label={t("send", { en: "Send", my: "ပို့ရန်" })}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-agri-tiger text-white shadow-md transition disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
