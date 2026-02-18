export {};

declare global {
  interface Window {
    ym?: (
      id: number,
      method: string,
      target: string,
      options?: any
    ) => void;
  }
}
