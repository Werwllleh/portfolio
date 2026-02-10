export type TWork = {
  id: number;
  period: string;
  position: string;
  workplace: { name: string; link: string };
  text: string[];
  tags: string[];
};

export  type TProject = {
  key: string;
  title: string;
  image: string;
  link: string;
  text: string[];
};