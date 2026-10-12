import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

import { Users } from '@/collections/Users';
import { Media } from '@/collections/Media';
import { Technologies } from '@/collections/Technologies';
import { Projects } from '@/collections/Projects';
import { Experiences } from '@/collections/Experiences';
import { SiteSettings } from '@/globals/SiteSettings';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Technologies, Projects, Experiences],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'payload-secret-alexey-portfolio-2026-super-secure',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || 'postgres://postgres:2k85anMk2V72@localhost:5433/resume_payload',
    },
  }),
});
