"use client"
import SvgIcon from "@/components/svg-icon";
import WorkCard from "@/components/work-card";
import ProjectCard from "@/components/project-card";
import { useEffect, useState, useCallback } from 'react';
import {TProject, TWork} from "@/types";
import {ABOUT_INFO, SOCIALS} from "@/content";
import Link from "next/link";
import {ymReach} from "@/utils";
import {YM_METHOD} from "@/consts";

const navItems = [
  {
    title: "О себе",
    anchor: "about"
  },
  {
    title: "Опыт",
    anchor: "experience"
  },
  {
    title: "Проекты",
    anchor: "projects"
  },
]

const MainPage = () => {

  const [workList, setWorkList] = useState<TWork[]>([]);
  const [projectList, setProjectList] = useState<TProject[]>([]);
  const [activeSection, setActiveSection] = useState<string>('about');

  const navClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const anchor = e.currentTarget.dataset.anchor;
    if (!anchor) return;

    const el = document.getElementById(anchor);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(anchor);
    ymReach(YM_METHOD.REACH_GOAL, `menu`)
  }, []);

  useEffect(() => {
    (async () => {
      const [worksRes, projectsRes] = await Promise.all([
        fetch('/data/works.json', { cache: 'no-store' }),
        fetch('/data/projects.json', { cache: 'no-store' }),
      ]);

      setWorkList(await worksRes.json());
      setProjectList(await projectsRes.json());
    })();
  }, []);

  useEffect(() => {
    const ids = ['about', 'experience', 'projects'];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      {
        root: null,
        rootMargin: '-50px 0px 80px 0px',
        threshold: 0,
      }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="page-main">
      <div className="container page-main__conainer">
        <div className="page-main__body">
          <div className="page-main__grid">
            <div className="page-main__left">
              <div className="page-main__left--top">
                <div className="page-main__author">
                  <h1 className="page-main__author--title">
                    <b>{ABOUT_INFO.AUTHOR[0]}</b> {ABOUT_INFO.AUTHOR[1]}
                  </h1>
                  <p className="page-main__author--post">{ABOUT_INFO.POST}</p>
                  <Link
                    onClick={() => ymReach(YM_METHOD.REACH_GOAL, 'address')}
                    href={ABOUT_INFO.CITY.ADDRESS}
                    rel="noopener norefferer"
                    target={"_blank"}
                    className="page-main__author--address"
                  >
                    {ABOUT_INFO.CITY.TITLE}
                  </Link>
                  <p className="page-main__author--description">
                    {ABOUT_INFO.DESCRIPTION}
                  </p>
                </div>
                <nav className="menu">
                  <ul className="menu__list">
                    {navItems.map((item) => (
                      <li key={item.anchor} className="menu__item">
                        <button
                          type={"button"}
                          onClick={(e) => navClick(e)}
                          aria-label={item.title}
                          data-anchor={item.anchor}
                          className={activeSection === item.anchor ? 'active' : ''}
                        >
                          <span></span>
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="page-main__left--bottom">
                {SOCIALS.length ? (
                  <div className="socials">
                    <ul className="socials__list">
                      {SOCIALS.map((item, index) => (
                        <li key={index} className="socials__item">
                          <Link
                            href={item.LINK}
                            rel="noopener noreferrer"
                            target={"_blank"}
                            onClick={() => ymReach(YM_METHOD.REACH_GOAL, `contacts-${item.ID}`)}
                          >
                            <SvgIcon name={item.ICON}/>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="page-main__right">
              <section id="about">
                <h3>Обо мне</h3>
                <div className="description">
                  {ABOUT_INFO.TEXT}
                </div>
              </section>
              <section id="experience">
                <h3>Опыт</h3>
                {workList && workList.length ?
                  <ul className="work-list">
                    {[...workList].reverse().map((data) => (
                      <li key={data.id}>
                        <WorkCard data={data}/>
                      </li>
                    ))}
                  </ul>
                 : null}
              </section>
              <section id="projects">
                <h3>Проекты</h3>
                <div className="projects">
                  {projectList && projectList.length ? (
                    <ul className="projects__list">
                      {projectList.map((data) => (
                        <li key={data.key}>
                          <ProjectCard data={data} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
