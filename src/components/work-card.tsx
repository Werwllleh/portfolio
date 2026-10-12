"use client";
import React from 'react';
import {ymReach} from "@/utils";
import {YM_METHOD} from "@/consts";

interface IWorkCard {
  id: number;
  period: string;
  position: string;
  workplace: { name: string, link: string };
  text: string[];
  tags: string[];
}

const WorkCard = ({data}: { data: IWorkCard }) => {
  return (
    <div className="group relative rounded-2xl border border-hairline/70 bg-surface/40 p-6 md:p-7 backdrop-blur-md transition-all duration-300 hover:border-lime/40 hover:bg-surface/75 hover:shadow-[0_0_35px_rgba(226,241,99,0.05)]">
      <a
        onClick={() => ymReach(YM_METHOD.REACH_GOAL, `work-${data.workplace.name}`)}
        href={data.workplace.link}
        target="_blank"
        rel="noreferrer noopener"
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-lime"
        aria-label={`${data.position} at ${data.workplace.name}`}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <header className="sm:w-36 shrink-0 pt-0.5">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-text-muted transition-colors group-hover:text-lime">
            {data.period}
          </span>
        </header>

        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <h4 className="flex items-center gap-1.5 text-base font-bold text-text-primary transition-colors group-hover:text-lime">
              <span>{data.position}</span>
              <span className="inline-block transform text-sm text-lime transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </h4>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-hairline/90 bg-surface/80 px-2.5 py-0.5 font-mono text-xs font-semibold tracking-wide text-text-primary transition-colors group-hover:border-lime/40 group-hover:text-lime">
              <span>🏢</span>
              <span>{data.workplace.name}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm leading-relaxed text-text-dim">
            {data.text.map((t: string, i: number) => (
              <p key={i}>{t}</p>
            ))}
          </div>

          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {data.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full border border-hairline bg-surface/80 px-2.5 py-0.5 font-mono text-[11px] tracking-wide text-lime/90 transition-colors group-hover:border-lime/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkCard;
