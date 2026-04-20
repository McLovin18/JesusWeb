# 🛍️ TECNO THINGS - Tienda Online de Tecnología

Aplicación Next.js moderna con Firebase para gestionar una tienda de tecnología, blogs y categorías de productos.

## 🎯 Características Principales

- **Sistema de Ventanas Desktop-Like**: Interfaz intuitiva similar a un escritorio con ventanas arrastables
- **Tienda Completa**: 
  - Filtrado por categorías (3 niveles)
  - Carrito de compras
  - Favoritos (localStorage)
  - Búsqueda de productos
  
- **Blog Sistema**: 
  - Artículos publicables
  - Etiquetado
  - Contador de vistas
  
- **Admin Panel**: 
  - Gestión de productos (CRUD)
  - Gestión de categorías y subcategorías
  - Crear/editar blogs
  - Autenticación Firebase

- **Responsive**: Funciona perfectamente en móvil, tablet y desktop

## 🚀 Quick Start

### Instalación

```bash
# Clonar repo
git clone <repo-url>
cd jesus_web_nextjs

# Instalar dependencias
npm install

# Configurar variables de entorno
# Copia las credenciales de Firebase en .env.local
# (Ver FIREBASE_SETUP.md para detalles)

# Ejecutar en desarrollo
npm run dev
```

### Estructura del Proyecto

```
src/
├── app/                      # Rutas Next.js
│   ├── page.tsx             # Home principal
│   ├── layout.tsx           # Layout global con providers
│   └── admin/               # Panel admin
├── components/
│   ├── Navbar/              # Navegación principal
│   ├── Window/              # Sistema de ventanas
│   │   ├── Window.tsx       # Componente principal
│   │   ├── TiendaWindowContent.tsx   # Ventana de tienda
│   │   ├── BlogsWindowContent.tsx    # Ventana de blogs
│   │   └── Titlebar.tsx     # Barra de título
│   ├── Hero/                # Sección hero
│   └── ProductoCard/        # Tarjeta de producto
├── context/
│   ├── UserContext.tsx      # Estado del usuario y carrito
│   ├── ToastContext.tsx     # Notificaciones
│   └── WindowContext.tsx    # Sistema de ventanas
├── lib/
│   ├── firebase.ts          # Config de Firebase
│   ├── firebase-auth.ts     # Autenticación
│   ├── productos-db.ts      # CRUD de productos
│   ├── categorias-db.ts     # CRUD de categorías
│   ├── blogs-db.ts          # CRUD de blogs
│   └── useAnalytics.ts      # Tracking
└── hooks/
    ├── useWindow.ts         # Hook para ventanas
    └── useDragWindow.ts     # Hook para arrastrar ventanas
```

## 🔧 Configuración de Firebase

**Ver [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) para instrucciones detalladas**

Resumen rápido:
1. Crear proyecto en Firebase Console
2. Copiar credenciales a `.env.local`
3. Crear colecciones en Firestore: `productos`, `categorias`, `blogs`
4. Configurar autenticación email/password
5. Configurar Storage para imágenes
6. Aplicar reglas de seguridad

## 💻 Admin Panel

### Acceso
- Email: `admin@tecnothing.com`
- Contraseña: `AdminPassword123!`

### Gestión de Productos

```bash
POST /api/admin/productos         # Crear
GET  /api/admin/productos         # Listar
GET  /api/admin/productos/{id}    # Obtener
PATCH /api/admin/productos/{id}   # Actualizar
DELETE /api/admin/productos/{id}  # Eliminar
```

### Gestión de Categorías

```bash
POST /api/admin/categorias        # Crear
GET  /api/admin/categorias        # Listar
PATCH /api/admin/categorias/{id}  # Actualizar
DELETE /api/admin/categorias/{id} # Eliminar
```

### Gestión de Blogs

```bash
POST /api/admin/blogs             # Crear
GET  /api/admin/blogs             # Listar
PATCH /api/admin/blogs/{id}       # Actualizar
DELETE /api/admin/blogs/{id}      # Eliminar
```

## 🛒 Sistema de Carrito

El carrito funciona con **localStorage** (sin autenticación requerida):

```javascript
import { useUser } from '@/context/UserContext';

export function MiComponente() {
  const { carrito, addCarrito, removeCarrito } = useUser();
  
  // Usar el carrito...
}
```

## ⭐ Favoritos

Los favoritos también usan **localStorage**:

```javascript
const { favoritos, addFavorito, removeFavorito } = useUser();
```

## 🔔 Notificaciones (Toast)

```javascript
import { useToast } from '@/context/ToastContext';

export function MiComponente() {
  const { showToast } = useToast();
  
  showToast('Producto añadido', 'success');
  showToast('Error al guardar', 'error');
  showToast('Información', 'info');
  showToast('Cuidado', 'warning');
}
```

## 🪟 Sistema de Ventanas

### Abrir una ventana

```javascript
import { useWindow } from '@/hooks/useWindow';

export function MiComponente() {
  const { openWindow } = useWindow();
  
  // Opciones: 'tienda', 'blogs', 'servicios', 'sobre'
  <button onClick={() => openWindow('tienda')}>
    Abrir Tienda
  </button>
}
```

### Crear nueva ventana personalizada

1. Agregar tipo en `types/window.ts`:
```typescript
export type WindowType = 'servicios' | 'sobre' | 'tienda' | 'blogs' | 'mi_nueva_ventana';
```

2. Crear contenido en `components/Window/`:
```typescript
// components/Window/MiNuevaVentana.tsx
export function MiNuevaVentana() {
  return <div>Contenido de la ventana</div>;
}
```

3. Agregar a `content/windowContent.tsx`:
```typescript
import { MiNuevaVentana } from '@/components/Window/MiNuevaVentana';

export const WINDOW_CONTENT = {
  // ... contenido existente
  mi_nueva_ventana: {
    title: 'Mi Nueva Ventana',
    description: 'Descripción',
    content: <MiNuevaVentana />,
  },
};
```

## 🎨 Temas y Estilos

El proyecto usa:
- **Tailwind CSS** para estilos
- **Material Icons** para íconos
- **CSS Modules** para componentes
- Variables CSS personalizadas para temas

### Variables de tema disponibles:
```css
--cream          /* Color de fondo claro */
--brown          /* Color primario */
--soft           /* Color suave de fondo */
--accent         /* Color de acento */
--text           /* Color de texto */
--border         /* Color de bordes */
--hover          /* Color hover */
```

## 📱 Responsividad

Breakpoints (Tailwind):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Coverage
npm run test:coverage
```

## 📦 Build y Deploy

```bash
# Build
npm run build

# Ejecutar en producción
npm start
```

### Deployment en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🔐 Seguridad

- ✅ Autenticación Firebase
- ✅ Reglas de Firestore configuradas
- ✅ Validación de datos en frontend y backend
- ✅ Variables de entorno protegidas
- ✅ CORS configurado

## 🐛 Troubleshooting

### Problema: "useUser debe usarse dentro de UserProvider"
**Solución**: Asegúrate de que tu componente esté dentro de `UserProvider` en `layout.tsx`

### Problema: Imágenes no cargan en Storage
**Solución**: Verifica las reglas de seguridad en Firebase Storage

### Problema: Categorías no aparecen
**Solución**: Crea categorías en Firestore con la estructura correcta

## 📚 Recursos

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Material Icons](https://fonts.google.com/icons)

## 📝 Licencia

Este proyecto es privado.

---

**Made with ❤️ for TECNO THINGS**
