"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { YM_METHOD } from "@/consts";
import { ymReach } from "@/utils";

const YandexMetrica = () => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Initial page load is handled automatically by ym("init") in layout.tsx.
    // Subsequent client-side route/search param changes trigger a hit.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = searchParams ? searchParams.toString() : "";
    const url = `${pathName}${params ? `?${params}` : ""}`;
    ymReach(YM_METHOD.HIT, url);
  }, [pathName, searchParams]);

  return null;
};

export default YandexMetrica;
