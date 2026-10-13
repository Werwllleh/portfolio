import MainPage from "@/components/main-page";
import { getPayload } from "payload";
import config from "@/payload.config";
import { TProject, TWork, TSiteSettings } from "@/types";

export const revalidate = 60;

export default async function Home() {
  let settings: TSiteSettings | null = null;
  let works: TWork[] | null = null;
  let projects: TProject[] | null = null;

  try {
    const payload = await getPayload({ config });

    const [settingsDoc, experiencesRes, projectsRes] = await Promise.all([
      payload.findGlobal({ slug: "site-settings" }).catch(() => null),
      payload.find({
        collection: "experiences",
        sort: "-order",
        limit: 100,
      }).catch(() => null),
      payload.find({
        collection: "projects",
        sort: "order",
        limit: 100,
      }).catch(() => null),
    ]);

    if (settingsDoc) {
      settings = {
        authorFirstName: settingsDoc.authorFirstName,
        authorLastName: settingsDoc.authorLastName,
        postTitle: settingsDoc.postTitle,
        statusText: settingsDoc.statusText || "",
        cityTitle: settingsDoc.cityTitle || "",
        cityAddress: settingsDoc.cityAddress || "",
        description: settingsDoc.description || "",
        about: settingsDoc.about,
        socials: (settingsDoc.socials || []).map((s: any) => ({
          id: s.id,
          icon: s.icon,
          link: s.link,
        })),
      };
    }

    if (experiencesRes?.docs?.length) {
      works = experiencesRes.docs.map((doc: any) => ({
        id: doc.id,
        period: doc.period,
        position: doc.position,
        workplace: {
          name: doc.companyName,
          link: doc.companyLink || "#",
        },
        description: doc.description,
        tags: doc.tags || [],
      }));
    }

    if (projectsRes?.docs?.length) {
      projects = projectsRes.docs.map((doc: any) => {
        const technologies: string[] = [];
        if (doc.technologies?.length) {
          doc.technologies.forEach((t: any) => {
            if (typeof t === "object" && t?.name) {
              technologies.push(t.name);
            } else if (typeof t === "string") {
              technologies.push(t);
            }
          });
        } else if (doc.techTags?.length) {
          technologies.push(...doc.techTags);
        }

        return {
          id: doc.id,
          key: doc.key,
          title: doc.title,
          image: doc.image || "",
          link: doc.link || "",
          description: doc.description,
          technologies,
        };
      });
    }
  } catch (err) {
    console.error("Error loading Payload data for frontend page:", err);
  }

  return (
    <div className="page">
      <MainPage
        initialSettings={settings}
        initialWorks={works}
        initialProjects={projects}
      />
    </div>
  );
}
