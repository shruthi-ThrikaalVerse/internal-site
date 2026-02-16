declare module '*.png';
declare module '*.webp';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg' {
  const content: any;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_TEMPLATE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
