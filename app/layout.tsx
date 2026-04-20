import type { Metadata } from 'next';
import { WindowProvider } from '@/context/WindowContext';
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jesus Oswaldo Checa — Web & Tienda Online',
  description: 'Bienvenido. Explora mis servicios, tienda y artículos.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Icons+Round:wght@100;300;400;500;700&display=swap"
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const isAdmin = window.location.pathname.startsWith('/admin');
                  const theme = isAdmin ? 'light' : (localStorage.getItem('tecno-theme') || 
                               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
                  if (document && document.documentElement) {
                    document.documentElement.classList.toggle('dark', theme === 'dark' && !isAdmin);
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <UserProvider>
          <ToastProvider>
            <WindowProvider>
              {children}
            </WindowProvider>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
