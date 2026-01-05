// Fix: Removed problematic triple-slash reference to 'vite/client' as it was causing a resolution error.
// The manual definitions below ensure type safety for Vite's ImportMeta while avoiding the missing reference.
interface ImportMetaEnv {
  readonly VITE_API_KEY: 'AIzaSyC4lsARrG-SUrXlePWTOyE_kVM41WyVxUg';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}