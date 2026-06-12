export type ContentBlock = {
  id: string;
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'image' | 'video' | 'quote';
  content: string;
  url?: string;
  alt?: string;
  caption?: string;
  position?: 'full' | 'left' | 'right' | 'center';
};

export type PageWidget = {
  id: string;
  type: 'note' | 'link' | 'image' | 'video' | 'social';
  area: 'top' | 'left' | 'right' | 'middle' | 'afterArticle' | 'footer';
  title: string;
  content: string;
  url?: string;
};

export type PostTypography = {
  fontFamily?: 'system' | 'serif' | 'mono' | 'inter' | 'roboto' | 'lato' | 'merriweather' | 'playfair' | 'montserrat' | 'poppins' | 'sourceCodePro';
  fontWeight?: 'regular' | 'medium' | 'semibold' | 'bold';
  h1Size?: 'sm' | 'md' | 'lg';
  h2Size?: 'sm' | 'md' | 'lg';
  bodySize?: 'sm' | 'md' | 'lg';
  lineHeight?: 'normal' | 'relaxed' | 'loose';
  textAlign?: 'left' | 'center' | 'justify';
};

export type BlogPost = {
  slug: string;
  contentType?: 'post' | 'page';
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
  videoUrl?: string;
  published?: boolean;
  featured?: boolean;
  sortOrder?: number;
  sourceUrl?: string;
  sourceName?: string;
  sourceImageUrl?: string;
  contentBlocks?: ContentBlock[];
  widgets?: PageWidget[];
  typography?: PostTypography;
};
