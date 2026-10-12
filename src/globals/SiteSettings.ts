import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      name: 'authorFirstName',
      type: 'text',
      defaultValue: 'Alexey',
      required: true,
    },
    {
      name: 'authorLastName',
      type: 'text',
      defaultValue: 'Aleksandrov',
      required: true,
    },
    {
      name: 'postTitle',
      type: 'text',
      defaultValue: 'Front End Developer',
      required: true,
    },
    {
      name: 'statusText',
      type: 'text',
      defaultValue: 'AVAILABLE FOR NEW CONTRACTS',
    },
    {
      name: 'cityTitle',
      type: 'text',
      defaultValue: 'Cheboksary, Russia',
    },
    {
      name: 'cityAddress',
      type: 'text',
      defaultValue: 'https://yandex.ru/maps/-/CCUVFBXKlD',
    },
    {
      name: 'description',
      type: 'textarea',
      defaultValue: 'Нравится создавать и кодить, придумывать что-то сложное и изучать новое.',
    },
    {
      name: 'about',
      label: 'About',
      type: 'richText',
    },
    {
      name: 'socials',
      type: 'array',
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'text',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
