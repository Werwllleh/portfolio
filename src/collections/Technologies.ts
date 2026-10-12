import type { CollectionConfig } from 'payload';

export const Technologies: CollectionConfig = {
  slug: 'technologies',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'accentColor'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'core',
      options: [
        { label: 'Core Frontend', value: 'core' },
        { label: '3D & Creative', value: 'creative' },
        { label: 'Architecture & Backend', value: 'backend' },
        { label: 'Tools & Ecosystem', value: 'tools' },
      ],
    },
    {
      name: 'accentColor',
      type: 'text',
      admin: {
        description: 'Optional HEX color (e.g. #E2F163) for 3D shader highlight on hover',
      },
    },
  ],
};
