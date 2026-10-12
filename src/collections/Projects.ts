import type { CollectionConfig } from 'payload';

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'key', 'shaderPreset', 'order'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Sort order on portfolio page',
      },
    },
    {
      name: 'image',
      type: 'text',
      admin: {
        description: 'Image path or URL (e.g. /images/projects/vagclub21.svg)',
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'External project URL',
      },
    },
    {
      name: 'shaderPreset',
      type: 'select',
      defaultValue: 'orbital',
      options: [
        { label: 'Orbital (Harmonic Field)', value: 'orbital' },
        { label: 'Turbulent (High Energy Chaos)', value: 'turbulent' },
        { label: 'Wireframe (Grid Matrix)', value: 'wireframe' },
        { label: 'Vortex (Axial Swirl)', value: 'vortex' },
      ],
      admin: {
        description: 'Controls 3D particle collider physics when viewing this project',
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'richText',
    },
    {
      name: 'technologies',
      type: 'relationship',
      relationTo: 'technologies',
      hasMany: true,
    },
    {
      name: 'techTags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Quick tags list (for direct tag rendering)',
      },
    },
  ],
};
