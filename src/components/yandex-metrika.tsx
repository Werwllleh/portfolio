"use client"

import React, {useEffect} from 'react';
import {usePathname, useSearchParams} from "next/navigation";
import Script from "next/script";
import {YM_METHOD, YM_METRIKA_ID} from "@/consts";
import {ymReach} from "@/utils";


const base = "https://resume-aaa.vercel.app";

const YandexMetrica = () => {

  const pathName = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {

    if (typeof window !== "undefined" && window.ym) {
      const params = searchParams.toString();
      const url = base + pathName + (params ? "?" + params : "");
      ymReach(YM_METHOD.HIT, url);
    }

  }, [pathName, searchParams]);

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],
              k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    
            ym(${Number(YM_METRIKA_ID)}, "init", {
              defer: true,
              clickmap:true,
              webvisor: true,
              trackLinks:true,
              accurateTrackBounce:true
            });
          `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${Number(YM_METRIKA_ID)}`}
            style={{position: "absolute", left: "-9999px;"}}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
};

export default YandexMetrica;
