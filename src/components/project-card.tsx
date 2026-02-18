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
    <div className={`project-card ${data.key}`}>
      <div className="project-card__body">
        <div className="project-card__image">
          <img src={data?.image} alt={data.title}/>
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
        {technologies.length ? (
          <ul className="project-card__technologies">
            {technologies.map((tag: string, i: number) => {
              return (
                (
                  <li key={i}>
                    <span aria-label={tag} title={tag} className="tag">{tag}</span>
                  </li>
                )
              )
            })}
          </ul>
        ) : null}
      </div>
      {data?.link ? (
        <Link
          onClick={() => ymReach(YM_METHOD.REACH_GOAL, `project-${data.title}`)}
          href={data?.link}
          className="project-card__link"
          target="_blank"
          rel="noopener noreferrer"/>
      ) : null}
    </div>
  );
};

export default ProjectCard;
