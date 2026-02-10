"use client"

import Link from "next/link";
import React from "react";
import {TProject} from "@/types";

const ProjectCard = ({data} : {data: TProject}) => {
  return (
    <div className={`project-card ${data.key}`}>
      <div className="project-card__body">
        <div className="project-card__image">
          <img src={data?.image} alt={data.title} />
        </div>
        <div className="project-card__info">
          <h5 className="project-card__title">{data.title}</h5>
          {data.text.length ? (
            <div className="project-card__text">
              {data.text.map((t: string, i: number) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {data?.link ? (
        <Link href={data?.link} className="project-card__link" target="_blank" rel="noopener noreferrer"/>
      ) : null}
    </div>
  );
};

export default ProjectCard;