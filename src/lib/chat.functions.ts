import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type ChatThread = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessageRow = {
  id: string;
  thread_id: string;
  user_id: string;
  role: string;
  parts: Array<{ type: string; text?: string }>;
  created_at: string;
};


type SbThreads = {
  from: (t: string) => {
    select: (s: string) => {
      eq: (c: string, v: string) => {
        order: (c: string, o: { ascending: boolean }) => Promise<{ data: ChatThread[] | null; error: unknown }>;
        single: () => Promise<{ data: ChatThread | null; error: unknown }>;
      };
    };
    insert: (v: unknown) => { select: (s: string) => { single: () => Promise<{ data: ChatThread | null; error: { message: string } | null }> } };
    update: (v: unknown) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
    delete: () => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
  };
};

type SbMessages = {
  from: (t: string) => {
    select: (s: string) => {
      eq: (c: string, v: string) => {
        order: (c: string, o: { ascending: boolean }) => Promise<{ data: ChatMessageRow[] | null; error: unknown }>;
      };
    };
  };
};

export const listChatThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ChatThread[]> => {
    const { supabase, userId } = context;
    const sb = supabase as never as SbThreads;
    const { data, error } = await sb
      .from("chat_threads")
      .select("id,user_id,title,created_at,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  });

export const createChatThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ title: z.string().default("New chat") }).parse(d ?? {}))
  .handler(async ({ data, context }): Promise<ChatThread> => {
    const { supabase, userId } = context;
    const sb = supabase as never as SbThreads;
    const { data: row, error } = await sb
      .from("chat_threads")
      .insert({ user_id: userId, title: data.title })
      .select("id,user_id,title,created_at,updated_at")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to create thread");
    return row;
  });

export const renameChatThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string(), title: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const sb = context.supabase as never as SbThreads;
    await sb.from("chat_threads").update({ title: data.title, updated_at: new Date().toISOString() }).eq("id", data.id);
    return { ok: true };
  });

export const deleteChatThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const sb = context.supabase as never as SbThreads;
    await sb.from("chat_threads").delete().eq("id", data.id);
    return { ok: true };
  });

export const listThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string() }).parse(d))
  .handler(async ({ data, context }): Promise<ChatMessageRow[]> => {
    const sb = context.supabase as never as SbMessages;
    const { data: rows, error } = await sb
      .from("chat_messages")
      .select("id,thread_id,user_id,role,parts,created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) return [];
    return rows ?? [];
  });
