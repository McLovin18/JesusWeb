import React from 'react';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <main className={styles.hero}>
      <section className={styles.intro}>
        <h1>Sitios Web que Convierten 🚀</h1>
        <p>
          Desarrollo full-stack de aplicaciones web modernas con arquitectura escalable, 
          optimización SEO avanzada y experiencia de usuario excepcional. Transformo ideas 
          en soluciones digitales de alto rendimiento que generan resultados reales.
        </p>
        <div className={styles.highlights}>
          <div className={styles.highlight}>
            <span className={styles.icon}>⚡</span>
            <span>Performance optimizado</span>
          </div>
          <div className={styles.highlight}>
            <span className={styles.icon}>🔍</span>
            <span>SEO de clase mundial</span>
          </div>
          <div className={styles.highlight}>
            <span className={styles.icon}>📱</span>
            <span>Responsive perfecto</span>
          </div>
          <div className={styles.highlight}>
            <span className={styles.icon}>🎯</span>
            <span>Conversión enfocada</span>
          </div>
        </div>
      </section>
    </main>
  );
}
