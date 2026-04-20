'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Blog, BlogBlock } from '@/types/blog';
import { incrementarVistas } from '@/lib/blogs-db';
import styles from './Window.module.css';

interface BlogPreviewProps {
  blog: Blog;
}

function renderBlock(block: BlogBlock, index: number) {
  if (block.type === 'subtitle') {
    const style: React.CSSProperties = {
      color: block.style?.color,
      fontSize: block.style?.fontSize,
      fontWeight: (block.style?.fontWeight as any) || '600',
      textDecoration: block.style?.textDecoration,
    };
    return (
      <h2
        key={block.id || index}
        className="font-semibold mt-6 mb-3 text-slate-800 dark:text-white scroll-m-20 text-lg"
        style={style}
      >
        {block.text}
      </h2>
    );
  }

  if (block.type === 'paragraph') {
    const style: React.CSSProperties = {
      color: block.style?.color,
      fontSize: block.style?.fontSize,
      paddingBlock: block.style?.paddingBlock,
      backgroundColor: block.style?.backgroundColor,
    };
    return (
      <p
        key={block.id || index}
        className="text-sm leading-7 mb-4 text-slate-600 dark:text-slate-300"
        style={style}
      >
        {block.text}
      </p>
    );
  }

  if (block.type === 'image') {
    const style: React.CSSProperties = {
      borderRadius: block.style?.borderRadius,
      padding: block.style?.paddingBlock,
    };
    return (
      <figure
        key={block.id || index}
        className="my-8 flex flex-col items-center"
        style={style}
      >
        {block.url && (
          <div className="relative max-w-md rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <img
              src={block.url}
              alt={block.alt || 'Imagen del blog'}
              className="w-full h-auto hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        {block.caption && (
          <figcaption className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-center italic font-medium">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return null;
}

export function BlogPreview({ blog }: BlogPreviewProps) {
  const [vistas, setVistas] = useState<number>(blog.vistas || 0);
  const [vistaYaRegistrada, setVistaYaRegistrada] = useState(false);

  // Incrementar vistas cuando se carga el blog
  useEffect(() => {
    if (blog.id && !vistaYaRegistrada) {
      incrementarVistas(blog.id);
      setVistas((prev) => prev + 1);
      setVistaYaRegistrada(true);
    }
  }, [blog.id, vistaYaRegistrada]);

  return (
    <article className={styles.subBody}>
      {/* Header del Blog */}
      <header className="mb-8 pb-6 border-b border-slate-200 dark:border-white/10">
        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-slate-800 dark:text-white leading-tight">
          {blog.title || '(Sin título)'}
        </h1>

        {blog.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            {blog.description}
          </p>
        )}

        {/* Metadatos */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {blog.autor && <span>{blog.autor}</span>}
          {blog.autor && blog.createdAt && <span>•</span>}
          {blog.createdAt && (
            <span>
              {new Date(blog.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>visibility</span>
            <span>Vistas {vistas}</span>
          </span>
        </div>

        {/* Etiquetas */}
        {blog.etiquetas && blog.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {blog.etiquetas.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-[#7b68ee]/10 text-[#7b68ee] dark:text-purple-300 text-xs font-semibold rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Imagen principal */}
      {blog.imagen && (
        <div className="mb-10 max-w-xl mx-auto rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
          <img
            src={blog.imagen}
            alt={blog.title}
            className="w-full h-auto hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Contenido */}
      <section className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200">
        {Array.isArray(blog.blocks) && blog.blocks.length > 0 ? (
          blog.blocks.map(renderBlock)
        ) : blog.contenido ? (
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.contenido }}
          />
        ) : (
          <div className="text-center py-12">
            <span className="material-icons-round text-slate-300 dark:text-white/20 block mb-3" style={{ fontSize: '64px', lineHeight: 1 }}>
              article
            </span>
            <p className="text-slate-500 dark:text-slate-400">No hay contenido disponible en este blog.</p>
          </div>
        )}
      </section>
    </article>
  );
}
