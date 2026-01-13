import SvgIcon from "@/components/svg-icon";

export default function Home() {


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
                      <a href="#">
                        <span></span>
                        About
                      </a>
                    </li>
                    <li className="menu__item">
                      <a href="#">
                        <span></span>
                        Experience
                      </a>
                    </li>
                    <li className="menu__item">
                      <a href="#">
                        <span></span>
                        Projects
                      </a>
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
            <div className="page-main__right"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
