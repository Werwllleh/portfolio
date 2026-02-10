"use client";
import React from 'react';

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
    <div className="work-card">
      <a href={data.workplace.link} target={"_blank"} rel={"noreferrer noopener"} className="work-card__link"/>
      <div className="work-card__body">
        <div className="work-card__period">
          <span>{data.period}</span>
        </div>
        <div className="work-card__info">
          <h5 className="work-card__header">
            <p className="work-card__position">{data.position}</p>
            <span></span>
            <p className="work-card__workplace">{data.workplace.name}</p>
          </h5>
          <div className="work-card__text">
            {data.text.map((t: string, i: number) => (
              <p key={i}>{t}</p>
            ))}
          </div>
          {data.tags && data.tags.length &&
            <div className="work-card__tags">
              {data.tags.map((tag, index) => (
                <span aria-label={tag} key={index}>
                  {tag}
                </span>
              ))}
            </div>}
        </div>
      </div>
    </div>
  );
};

export default WorkCard;