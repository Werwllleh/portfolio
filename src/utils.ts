export const ymReach = (
  method: string,
  target: string,
  options?: Record<string, unknown>
):void => {
  if (typeof window === "undefined") return;

  const ymId = Number(process.env.NEXT_PUBLIC_YMETRIKA);

  if (window && window.ym) {
    window.ym(ymId, method, target, options);
  } else {
    const interval = setInterval(() => {
      if (window.ym) {
        window.ym(ymId, method, target, options);
        clearInterval(interval);
      }
    }, 300);

    setTimeout(() => clearInterval(interval), 5000);
  }
};
