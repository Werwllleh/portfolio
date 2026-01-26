"use client"

import SvgIcon from "@/components/svg-icon";
import {workList} from "@/data";
import WorkCard from "@/components/work-card";

export default function Home() {

  const navClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  }


  return (
    <div className="page page-main">
      <div className="container page-main__conainer">
        <div className="page-main__body">
          <div className="page-main__grid">
            <div className="page-main__left">
              <div className="page-main__left--top">
                <div className="page-main__author">
                  <h1 className="page-main__author--title">Brittany Chiang</h1>
                  <p className="page-main__author--post">Front End Engineer</p>
                  <p className="page-main__author--description">
                    I build accessible, pixel-perfect digital experiences for the web.
                  </p>
                </div>
                <nav className="menu">
                  <ul className="menu__list">
                    <li className="menu__item">
                      <button type={"button"} onClick={(e) => navClick(e)} aria-label="О себе" data-anchor="#about">
                        <span></span>
                        О себе
                      </button>
                    </li>
                    <li className="menu__item">
                      <button type={"button"} aria-label="Опыт" data-anchor="#expirience">
                        <span></span>
                        Опыт
                      </button>
                    </li>
                    <li className="menu__item">
                      <button type={"button"} aria-label="Проекты" data-anchor="#">
                        <span></span>
                        Проекты
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className="page-main__left--bottom">
                <div className="socials">
                  <ul className="socials__list">
                    <li className="socials__item">
                      <a href="#"><SvgIcon name={"github"}/></a>
                    </li>
                    <li className="socials__item">
                      <a href="#"><SvgIcon name={"instagram"}/></a>
                    </li>
                    <li className="socials__item">
                      <a href="#"><SvgIcon name={"github"}/></a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="page-main__right">
              <section>
                <div id="#about" className="description">
                  <p>I’m a frontend engineer with a specialty in web accessibility, focused on building pixel-perfect,
                    intuitive user interfaces. I enjoy working at the intersection of design and engineering, where
                    great
                    user experience meets robust, clean, and scalable code.</p>
                  <p>Currently, I'm a senior frontend engineer at Klaviyo, where I work on the component library team to
                    help maintain and evolve our design system. In this role, I lead accessibility efforts across
                    components, tooling, and patterns, partnering closely with designers and engineers to ensure
                    accessibility is part of our core architecture.</p>
                  <p>Previously, I’ve worked across a wide range of environments, from product studios to startups and
                    large tech companies, including Apple, Starry Internet, and Upstatement. Alongside my professional
                    work, I also created an online video course a few years ago which walks through building a
                    real-world,
                    API-driven application from scratch. These experiences have shaped how I think about building
                    products
                    that are both well-crafted and widely usable.</p>
                </div>
              </section>
              <section>
                {workList && workList.length &&
                  <ul id="#expirience" className="work-list">
                    {workList.map((data) => (
                      <li key={data.id}>
                        <WorkCard data={data}/>
                      </li>
                    ))}
                  </ul>
                }
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
