import { getPayload } from 'payload';
import config from '../src/payload.config';
import fs from 'fs';
import path from 'path';

if (typeof (process as any).loadEnvFile === 'function') {
  try { (process as any).loadEnvFile('.env.local'); } catch {}
  try { (process as any).loadEnvFile('.env'); } catch {}
}

async function seed() {
  console.log('--- Starting Payload CMS 3.0 Seeding ---');
  const payload = await getPayload({ config });

  // 1. Read existing JSON files
  const worksPath = path.resolve(process.cwd(), 'public/data/works.json');
  const projectsPath = path.resolve(process.cwd(), 'public/data/projects.json');

  const works = JSON.parse(fs.readFileSync(worksPath, 'utf8'));
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

  console.log(`Found ${works.length} experiences, ${projects.length} projects to migrate.`);

  // 2. Seed Technologies
  const allTechs = new Set<string>();
  works.forEach((w: any) => w.tags?.forEach((t: string) => allTechs.add(t.trim())));
  projects.forEach((p: any) => p.technologies?.forEach((t: string) => allTechs.add(t.trim())));

  const techMap = new Map<string, any>();
  for (const techName of allTechs) {
    if (!techName) continue;
    try {
      const existing = await payload.find({
        collection: 'technologies',
        where: { name: { equals: techName } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        techMap.set(techName, existing.docs[0]);
      } else {
        const created = await payload.create({
          collection: 'technologies',
          data: {
            name: techName,
            category: 'core',
            accentColor: '#E2F163',
          },
        });
        techMap.set(techName, created);
        console.log(`+ Technology created: ${techName}`);
      }
    } catch (err) {
      console.error(`Failed to seed technology ${techName}:`, err);
    }
  }

function toLexical(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: (paragraphs || []).map((t) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: t,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
      })),
      direction: 'ltr',
    },
  };
}

  // 3. Seed Experiences
  for (const work of works) {
    try {
      const existing = await payload.find({
        collection: 'experiences',
        where: { companyName: { equals: work.workplace.name } },
        limit: 1,
      });

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'experiences',
          data: {
            companyName: work.workplace.name,
            companyLink: work.workplace.link,
            position: work.position,
            period: work.period,
            order: work.id || 0,
            description: toLexical(work.text || []),
            tags: work.tags || [],
          },
        });
        console.log(`+ Experience created: ${work.workplace.name}`);
      } else {
        await payload.update({
          collection: 'experiences',
          id: existing.docs[0].id,
          data: {
            description: toLexical(work.text || []),
          },
        });
        console.log(`+ Experience updated with richText: ${work.workplace.name}`);
      }
    } catch (err) {
      console.error(`Failed to seed experience ${work.workplace?.name}:`, err);
    }
  }

  // 4. Seed Projects
  for (let i = 0; i < projects.length; i++) {
    const proj = projects[i];
    try {
      const existing = await payload.find({
        collection: 'projects',
        where: { key: { equals: proj.key } },
        limit: 1,
      });

      if (existing.docs.length === 0) {
        const techIds = (proj.technologies || [])
          .map((t: string) => techMap.get(t.trim())?.id)
          .filter(Boolean);

        await payload.create({
          collection: 'projects',
          data: {
            title: proj.title,
            key: proj.key,
            order: i,
            image: proj.image,
            link: proj.link,
            shaderPreset: i % 2 === 0 ? 'orbital' : 'turbulent',
            description: toLexical(proj.text || []),
            technologies: techIds,
            techTags: proj.technologies || [],
          },
        });
        console.log(`+ Project created: ${proj.title}`);
      } else {
        await payload.update({
          collection: 'projects',
          id: existing.docs[0].id,
          data: {
            description: toLexical(proj.text || []),
          },
        });
        console.log(`+ Project updated with richText: ${proj.title}`);
      }
    } catch (err) {
      console.error(`Failed to seed project ${proj.title}:`, err);
    }
  }

  // 5. Seed SiteSettings
  try {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        authorFirstName: 'Alexey',
        authorLastName: 'Aleksandrov',
        postTitle: 'Frontend-разработчик (React, Next.js)',
        statusText: 'AVAILABLE FOR NEW CONTRACTS',
        cityTitle: 'Cheboksary, Russia',
        cityAddress: 'https://yandex.ru/maps/-/CCUVFBXKlD',
        description: 'Создаю производительные и отзывчивые интерфейсы на React & Next.js. Уделяю внимание анимациям, оптимизации LCP и архитектуре приложений.',
        about: toLexical([
          'Привет! Я Frontend-разработчик с коммерческим опытом более 4 лет. Специализируюсь на создании адаптивных, кроссбраузерных и высокопроизводительных веб-приложений с использованием современного стека: React, Next.js (SSR, SSG) и TypeScript.',
          'Стек технологий:\n• Frontend: React, Next.js, TypeScript, JavaScript (ES6+), Zustand, Redux Toolkit, TanStack Query, Tailwind CSS, Styled Components, SCSS, BEM.\n• Анимация & Creative: GSAP, Motion, Canvas, CSS Animations (простые и сложные интерактивные сценарии).\n• Backend & CMS: Node.js, Express, NestJS, PostgreSQL, Sequelize ORM, Prisma, Headless CMS (Payload CMS, Strapi, Directus), REST API.\n• Инфраструктура & AI: Nginx, Git, Gulp, Telegram WebApp и боты, активная интеграция AI-инструментов (Claude Code, ChatGPT, DeepSeek, Gemini).',
          'Опыт и подход к разработке:\nГлубоко погружен в процесс верстки и UI: стремлюсь к pixel-perfect качеству, поддерживаю и развиваю проекты на 1С-Битрикс и Bitrix24 (инфоблоки, кастомные активити, шаблоны на PHP). Систематически оптимизирую скорость загрузки страниц, Core Web Vitals и показатели LCP в Google PageSpeed Insights.',
          'Постоянно развиваюсь: слежу за развитием экосистем React и Next.js, применяю принципы чистого кода, DRY и KISS. Всегда открыт к сложным задачам и изучению новых передовых технологий.',
        ]),
        socials: [
          { id: 'github', icon: 'github', link: 'https://github.com/Werwllleh' },
          { id: 'telegram', icon: 'telegram', link: 'https://t.me/all_lllll' },
        ],
      },
    });
    console.log('+ SiteSettings global updated successfully');
  } catch (err) {
    console.error('Failed to seed SiteSettings:', err);
  }

  console.log('--- Payload CMS Seeding Complete ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding fatal error:', err);
  process.exit(1);
});
