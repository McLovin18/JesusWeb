import React from 'react';
import { TiendaWindowContent } from '@/components/Window/TiendaWindowContent';
import { BlogsWindowContent } from '@/components/Window/BlogsWindowContent';

export const WINDOW_CONTENT = {
  servicios: {
    title: 'Mis servicios',
    description: 'Mis servicios principales de desarrollo web',
    content: (
      <div>
        <h2>Mis servicios</h2>
        <p>
          Ofrezco soluciones front-end y back-end: páginas responsivas, tiendas en
          línea, optimización de rendimiento y mantenimiento.
        </p>
        <div className="cards">
          <div className="card">
            <strong>Desarrollo Front‑end</strong>
            <p>HTML, CSS, JS, React/Vue.</p>
          </div>
          <div className="card">
            <strong>Desarrollo Back‑end</strong>
            <p>APIs, bases de datos y servidores.</p>
          </div>
          <div className="card">
            <strong>Consultoría</strong>
            <p>Mejoras UX, rendimiento y arquitectura.</p>
          </div>
        </div>
      </div>
    ),
  },
  sobre: {
    title: 'Sobre mí',
    description: 'Más información sobre mí y mis habilidades',
    content: (
      <div>
        <h2>Sobre mí</h2>
        <p>
          Soy desarrollador web con pasión por construir experiencias sencillas y
          elegantes. Trabajo con tecnologías modernas y me encanta resolver problemas.
        </p>
        <p>
          Habilidades: HTML, CSS, JavaScript, frameworks, APIs, accesibilidad y buenas
          prácticas.
        </p>
      </div>
    ),
  },
  tienda: {
    title: 'Mi Tienda',
    description: 'Explora nuestros productos y categorías',
    content: <TiendaWindowContent />,
  },
  blogs: {
    title: 'Blogs',
    description: 'Artículos y guías de tecnología',
    content: <BlogsWindowContent />,
  },
} as const;
