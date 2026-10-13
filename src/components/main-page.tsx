"use client";
import SvgIcon from "@/components/svg-icon";
import WorkCard from "@/components/work-card";
import ProjectCard from "@/components/project-card";
import { useEffect, useState, useCallback } from 'react';
import { RichText } from "@payloadcms/richtext-lexical/react";
import {TProject, TWork, TSiteSettings} from "@/types";
import {ABOUT_INFO, SOCIALS} from "@/content";
import Link from "next/link";
import {ymReach} from "@/utils";
import {YM_METHOD} from "@/consts";
import {ThemeToggle} from "@/components/theme-toggle";

const navItems = [
  {
    index: "01",
    title: "О себе",
    anchor: "about"
  },
  {
    index: "02",
    title: "Опыт работы",
    anchor: "experience"
  },
  {
    index: "03",
    title: "Проекты",
    anchor: "projects"
  },
]

interface MainPageProps {
  initialSettings?: TSiteSettings | null;
  initialWorks?: TWork[] | null;
  initialProjects?: TProject[] | null;
}

const MainPage = ({ initialSettings, initialWorks, initialProjects }: MainPageProps) => {

  const [settings] = useState<TSiteSettings | null>(initialSettings || null);
  const [workList, setWorkList] = useState<TWork[]>(initialWorks || []);
  const [projectList, setProjectList] = useState<TProject[]>(initialProjects || []);
  const [activeSection, setActiveSection] = useState<string>('about');

  const navClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const anchor = e.currentTarget.dataset.anchor;
    if (!anchor) return;

    const el = document.getElementById(anchor);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(anchor);
    ymReach(YM_METHOD.REACH_GOAL, 'menu')
  }, []);

  useEffect(() => {
    if (!initialWorks?.length || !initialProjects?.length) {
      (async () => {
        const [worksRes, projectsRes] = await Promise.all([
          fetch('/data/works.json', { cache: 'no-store' }),
          fetch('/data/projects.json', { cache: 'no-store' }),
        ]);

        if (!initialWorks?.length) setWorkList(await worksRes.json());
        if (!initialProjects?.length) setProjectList(await projectsRes.json());
      })();
    }
  }, [initialWorks, initialProjects]);

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
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
      <div className="lg:flex lg:justify-between lg:gap-12">
        {/* Left Column: Fixed Header / HUD / Bio */}
        <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
          <div>
            {/* Status Indicator & Theme Toggle in top bar */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-lime/30 bg-surface/60 px-3.5 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime"></span>
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-lime">
                  {settings?.statusText || "AVAILABLE FOR NEW CONTRACTS"}
                </span>
              </div>
              <div className="lg:hidden">
                <ThemeToggle />
              </div>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
              <span className="text-lime">{settings?.authorFirstName || ABOUT_INFO.AUTHOR[0]}</span>{" "}
              {settings?.authorLastName || ABOUT_INFO.AUTHOR[1]}
            </h1>

            <h2 className="mt-4 text-xl font-medium tracking-tight text-text-primary sm:text-2xl">
              {settings?.postTitle || ABOUT_INFO.POST}
            </h2>

            <Link
              onClick={() => ymReach(YM_METHOD.REACH_GOAL, 'address')}
              href={settings?.cityAddress || ABOUT_INFO.CITY.ADDRESS}
              rel="noopener noreferrer"
              target="_blank"
              className="mt-3 inline-flex items-center gap-2 font-mono text-sm text-text-muted transition-colors hover:text-lime"
            >
              <span>📍 {settings?.cityTitle || ABOUT_INFO.CITY.TITLE}</span>
              <span className="text-lime text-base">↗</span>
            </Link>

            <p className="mt-6 max-w-md text-base leading-relaxed text-text-dim sm:text-lg">
              {settings?.description || ABOUT_INFO.DESCRIPTION}
            </p>

            {/* Vernier Navigation */}
            <nav className="mt-14 hidden lg:block" aria-label="Разделы страницы">
              <ul className="space-y-5">
                {navItems.map((item) => {
                  const isActive = activeSection === item.anchor;
                  return (
                    <li key={item.anchor}>
                      <button
                        type="button"
                        onClick={(e) => navClick(e)}
                        aria-label={item.title}
                        data-anchor={item.anchor}
                        className="group flex items-center py-1.5 text-left transition-all"
                      >
                        <span
                          className={`mr-4 h-px transition-all duration-300 ${
                            isActive
                              ? 'w-16 bg-lime shadow-[0_0_10px_#E2F163]'
                              : 'w-8 bg-hairline group-hover:w-12 group-hover:bg-text-muted'
                          }`}
                        />
                        <span className={`font-mono text-sm tracking-wider transition-colors mr-3 ${
                          isActive ? 'text-lime font-bold' : 'text-text-muted group-hover:text-text-primary'
                        }`}>
                          {item.index}
                        </span>
                        <span
                          className={`text-sm font-semibold uppercase tracking-widest transition-colors ${
                            isActive
                              ? 'text-text-primary'
                              : 'text-text-muted group-hover:text-text-primary'
                          }`}
                        >
                          {item.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Social Links */}
          {(settings?.socials?.length || SOCIALS.length) > 0 && (
            <div className="mt-12 lg:mt-0">
              <ul className="flex items-center gap-3">
                {(settings?.socials || SOCIALS.map(s => ({ id: s.ID, icon: s.ICON, link: s.LINK }))).map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.link}
                      rel="noopener noreferrer"
                      target="_blank"
                      onClick={() => ymReach(YM_METHOD.REACH_GOAL, `contacts-${item.id}`)}
                      className="group flex h-11 w-11 items-center justify-center rounded-xl border border-hairline/80 bg-surface/50 text-text-muted backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-lime/50 hover:bg-surface hover:text-lime hover:shadow-[0_0_20px_rgba(226,241,99,0.15)]"
                      aria-label={item.id}
                    >
                      <span className="h-5 w-5 transition-transform group-hover:scale-110">
                        <SvgIcon name={item.icon} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* Desktop Fixed Theme Toggle (Top Right Corner) */}
        <div className="fixed top-6 right-6 z-50 hidden lg:block">
          <ThemeToggle />
        </div>

        {/* Right Column: Content Sections */}
        <div className="pt-20 lg:w-1/2 lg:py-24 space-y-24">
          {/* About Section */}
          <section id="about" className="scroll-mt-16 lg:scroll-mt-24">
            <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between border-b border-hairline/40 bg-obsidian/85 px-6 py-4 backdrop-blur-md lg:hidden">
              <h3 className="font-mono text-xs uppercase tracking-widest text-lime">
                01 // Обо мне
              </h3>
            </div>
            <div className="hidden lg:flex items-center gap-3 mb-6 font-mono text-xs tracking-widest text-lime uppercase">
              <span>01 // Обо мне</span>
              <span className="h-px flex-1 bg-hairline/60"></span>
            </div>
            <div className="rounded-2xl border border-hairline/70 bg-surface/40 p-6 md:p-7 backdrop-blur-md space-y-4 text-sm leading-relaxed text-text-dim sm:text-base transition-all duration-300 hover:border-lime/30 hover:bg-surface/60 [&>p]:mb-3">
              {settings?.about ? (
                <RichText data={settings.about} />
              ) : (
                ABOUT_INFO.TEXT
              )}
            </div>
          </section>

          {/* Experience Section */}
          <section id="experience" className="scroll-mt-16 lg:scroll-mt-24">
            <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between border-b border-hairline/40 bg-obsidian/85 px-6 py-4 backdrop-blur-md lg:hidden">
              <h3 className="font-mono text-xs uppercase tracking-widest text-lime">
                02 // Опыт работы
              </h3>
            </div>
            <div className="hidden lg:flex items-center gap-3 mb-6 font-mono text-xs tracking-widest text-lime uppercase">
              <span>02 // Опыт работы</span>
              <span className="h-px flex-1 bg-hairline/60"></span>
            </div>
            {workList && workList.length > 0 && (
              <ul className="space-y-6">
                {workList.map((data) => (
                  <li key={data.id}>
                    <WorkCard data={data} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Projects Section */}
          <section id="projects" className="scroll-mt-16 lg:scroll-mt-24">
            <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-center justify-between border-b border-hairline/40 bg-obsidian/85 px-6 py-4 backdrop-blur-md lg:hidden">
              <h3 className="font-mono text-xs uppercase tracking-widest text-lime">
                03 // Проекты
              </h3>
            </div>
            <div className="hidden lg:flex items-center gap-3 mb-6 font-mono text-xs tracking-widest text-lime uppercase">
              <span>03 // Проекты</span>
              <span className="h-px flex-1 bg-hairline/60"></span>
            </div>
            {projectList && projectList.length > 0 && (
              <ul className="space-y-6">
                {projectList.map((data) => (
                  <li key={data.key}>
                    <ProjectCard data={data} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
