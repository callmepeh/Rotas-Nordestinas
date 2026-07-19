import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

function getAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function assertConfigured(): void {
  const url = getSupabaseUrl();
  const anonKey = getAnonKey();

  if (!isValidUrl(url)) {
    throw new Error(
      "Supabase URL is not configured. Set NEXT_PUBLIC_SUPABASE_URL in your environment variables."
    );
  }

  if (!anonKey) {
    throw new Error(
      "Supabase Anon Key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables."
    );
  }
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    assertConfigured();
    supabaseInstance = createClient(getSupabaseUrl(), getAnonKey());
  }
  return supabaseInstance;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    assertConfigured();
    supabaseAdminInstance = createClient(
      getSupabaseUrl(),
      getServiceRoleKey()
    );
  }
  return supabaseAdminInstance;
}

// Convenience re-exports for use in API routes
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});
