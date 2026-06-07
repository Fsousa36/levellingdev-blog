export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  keywords: string[];
  sections: Array<{
    heading: string;
    body: string[];
  }>;
  checklist: string[];
  externalLinks: Array<{
    label: string;
    href: string;
  }>;
  published?: boolean;
  featured?: boolean;
  sortOrder?: number;
  sourceUrl?: string;
  sourceName?: string;
};
