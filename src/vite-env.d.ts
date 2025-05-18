
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALPACA_API_KEY: string;
  readonly VITE_ALPACA_API_SECRET: string;
  readonly VITE_PERPLEXITY_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
