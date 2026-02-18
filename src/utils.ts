import {YM_METRIKA_ID} from "@/consts";

export const ymReach = (
  method: string,
  target: string,
  options?: Record<string, unknown>
):void => {
  if (typeof window === "undefined") return;

  const ymId = Number(YM_METRIKA_ID);

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
