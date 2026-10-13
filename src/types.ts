export type TWork = {
  id: number | string;
  period: string;
  position: string;
  workplace: { name: string; link: string };
  text?: string[];
  description?: any;
  tags: string[];
};

export type TProject = {
  id?: number | string;
  key: string;
  title: string;
  image: string;
  link: string;
  text?: string[];
  description?: any;
  technologies: string[];
};

export type TSiteSettings = {
  authorFirstName: string;
  authorLastName: string;
  postTitle: string;
  statusText: string;
  cityTitle: string;
  cityAddress: string;
  description: string;
  about?: any;
  socials?: Array<{
    id: string;
    icon: string;
    link: string;
  }>;
};