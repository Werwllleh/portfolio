"use client"

import Link from "next/link";
import React, {useEffect, useState} from "react";
import {TProject} from "@/types";
import {ymReach} from "@/utils";
import {YM_METHOD} from "@/consts";

const ProjectCard = ({data}: { data: TProject }) => {

  const [technologies, setTechnologies] = useState<string[]>([])

  useEffect(() => {
    if (data.technologies?.length) {
      setTechnologies(data.technologies.filter(tag => tag?.trim()))
    }
  }, [data])

  return (
    <div className="group relative rounded-2xl border border-hairline/70 bg-surface/40 p-6 md:p-7 backdrop-blur-md transition-all duration-300 hover:border-lime/40 hover:bg-surface/75 hover:shadow-[0_0_35px_rgba(226,241,99,0.05)]">
      {data?.link ? (
        <Link
          onClick={() => ymReach(YM_METHOD.REACH_GOAL, `project-${data.title}`)}
          href={data?.link}
          className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-lime"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={data.title}
        />
      ) : null}

      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        {data?.image && (
          <div className="sm:w-44 shrink-0 overflow-hidden rounded-xl border border-hairline/80 bg-surface/80 p-2.5 transition-all duration-300 group-hover:border-lime/40">
            <div className="flex h-24 w-full items-center justify-center rounded-lg bg-zinc-200/90 dark:bg-zinc-700/60 p-2 border border-black/5 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] transition-all duration-300 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700">
              <img
                src={data.image}
                alt={data.title}
                className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div className="flex-1 space-y-3">
          <h4 className="flex items-center gap-2 text-base font-medium text-text-primary transition-colors group-hover:text-lime">
            <span>{data.title}</span>
            {data?.link && (
              <span className="inline-block transform text-sm text-lime transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            )}
          </h4>

          {data.text.length > 0 && (
            <div className="space-y-2 text-sm leading-relaxed text-text-dim">
              {data.text.map((t: string, i: number) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          )}

          {technologies.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-2">
              {technologies.map((tag: string, i: number) => (
                <li key={i}>
                  <span className="rounded-full border border-hairline bg-surface/80 px-2.5 py-0.5 font-mono text-[11px] tracking-wide text-lime/90 transition-colors group-hover:border-lime/30">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
