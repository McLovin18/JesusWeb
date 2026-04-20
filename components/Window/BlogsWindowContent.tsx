'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { obtenerBlogs, Blog } from '@/lib/blogs-db';
import { BlogPreview } from './BlogPreview';
import styles from './Window.module.css';

export function BlogsWindowContent() {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const blogsData = await obtenerBlogs();
        setBlogs(blogsData);
      } catch (error) {
        console.error('Error cargando blogs:', error);
        showToast('Error cargando blogs', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [showToast]);

  return (
    <div className={styles.subBody}>
      {loading ? (
        <div className="text-center py-16">

          <p className="text-slate-500 dark:text-white/50">Cargando blogs...</p>
        </div>
      ) : selectedBlog ? (
        // ═══ VISTA: Detalle del Blog ═══
        <div>
          <button
            onClick={() => setSelectedBlog(null)}
            className="mb-6 flex items-center gap-2 text-[#7b68ee] hover:opacity-80 transition-opacity font-semibold text-sm"
          >
            <span className="material-icons-round" style={{ fontSize: '20px', lineHeight: 1 }}>arrow_back</span>
            Volver a blogs
          </button>

          <BlogPreview blog={selectedBlog} />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16">

          <p className="text-slate-500 dark:text-white/50 mt-2">No hay blogs disponibles</p>
        </div>
      ) : (
        // ═══ VISTA: Listado de Blogs ═══
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-white/50 mb-4">
            Artículos
          </h2>

          <div className="space-y-4">
            {blogs.map((blog) => {
              // Obtener la primera imagen: de blog.imagen o del primer bloque de imagen
              const firstImage = blog.imagen || 
                blog.blocks?.find((b) => b.type === 'image')?.url;

              return (
                <button
                  key={blog.id}
                  onClick={() => setSelectedBlog(blog)}
                  className="w-full text-left p-4 rounded-lg border-2 border-slate-200 dark:border-white/10 hover:border-[#7b68ee] dark:hover:border-[#7b68ee] hover:shadow-lg hover:shadow-purple-500/20 transition-all group"
                >
                <div className="flex gap-4">
                  {firstImage && (
                    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/5">
                      <img
                        src={firstImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-[#7b68ee] transition-colors line-clamp-2 text-sm">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-white/50 mt-2 line-clamp-2 leading-relaxed">
                      {blog.description || 
                        (blog.contenido?.replace(/<[^>]*>/g, '').substring(0, 100) + '...') ||
                        (blog.blocks?.find(b => b.type === 'paragraph')?.text?.substring(0, 100) + '...') ||
                        'Sin descripción'}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 dark:text-white/40">
                      {blog.autor && (
                        <>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>person</span>
                            <span>{blog.autor}</span>
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>calendar_today</span>
                        <span>
                          {new Date(blog.createdAt || 0).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span className="material-icons-round" style={{ fontSize: '16px', lineHeight: 1 }}>visibility</span>
                        <span>Vistas {blog.vistas || 0}</span>
                      </span>
                    </div>

                    {blog.etiquetas && blog.etiquetas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {blog.etiquetas.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-[#7b68ee]/10 text-[#7b68ee] dark:text-purple-300 text-xs rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                        {blog.etiquetas.length > 3 && (
                          <span className="text-xs text-slate-400 dark:text-white/40">
                            +{blog.etiquetas.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="text-slate-300 dark:text-white/30 group-hover:text-[#7b68ee] transition-colors flex-shrink-0 self-center material-icons-round" style={{ fontSize: '20px', lineHeight: 1 }}>
                    arrow_forward
                  </span>
                </div>
              </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}