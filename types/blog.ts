// Tipos para bloques de contenido del blog
export interface BlogBlockStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string | number;
  textDecoration?: string;
  paddingBlock?: string;
  backgroundColor?: string;
  borderRadius?: string;
}

export type BlogBlockType = 'paragraph' | 'subtitle' | 'image';

export interface BlogBlock {
  id?: string;
  type: BlogBlockType;
  text?: string;
  url?: string;
  alt?: string;
  caption?: string;
  style?: BlogBlockStyle;
}

export interface Blog {
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  imagen?: string;
  autor?: string;
  etiquetas?: string[];
  status: 'draft' | 'published';
  featured?: boolean;
  vistas?: number;
  blocks?: BlogBlock[];
  contenido?: string; // Fallback para contenido simple
  createdAt?: number;
  updatedAt?: number;
}
