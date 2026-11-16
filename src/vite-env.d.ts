/// <reference types="vite/client" />

declare module 'world-atlas/*.json' {
  const data: Record<string, unknown>;
  export default data;
}
