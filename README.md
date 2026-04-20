# Jesus Web - Portafolio de Desarrollador Web

Portafolio moderno de desarrollador web construido con **Next.js 14**, **TypeScript** y **React**.

## 🚀 Características

- ✅ **Navbar** con navegación responsive
- ✅ **Ventanas modales** arrastrables (tipo OS Windows)
- ✅ **Minimización de ventanas** con menú desplegable
- ✅ **Maximización de ventanas**
- ✅ **Accesibilidad** (ARIA attributes)
- ✅ **TypeScript** para mayor seguridad de tipos
- ✅ **CSS Modules** para estilos encapsulados
- ✅ **React Hooks** y Context API
- ✅ **Responsive Design** (mobile first)

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación

1. **Navega al directorio del proyecto:**
```bash
cd jesus_web_nextjs
```

2. **Instala las dependencias:**
```bash
npm install
# o
yarn install
```

3. **Inicia el servidor de desarrollo:**
```bash
npm run dev
# o
yarn dev
```

4. **Abre tu navegador:**
```
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App directory (Next.js 13+)
│   ├── layout.tsx         # Layout raíz con providers
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
│
├── components/            # Componentes React
│   ├── Navbar/            # Barra de navegación
│   ├── Hero/              # Sección hero
│   ├── Window/            # Componente ventana modal
│   └── MinimizedMenu/     # Menú de ventanas minimizadas
│
├── context/               # Context API
│   ├── WindowContext.tsx  # Contexto y provider de ventanas
│   └── types.ts          # Tipos del contexto
│
├── hooks/                 # Custom hooks
│   ├── useWindow.ts      # Hook para usar el contexto
│   └── useDragWindow.ts  # Hook para arrastrar ventanas
│
├── content/              # Contenido estático
│   └── windowContent.tsx # Contenido de las ventanas
│
└── types/                # Tipos TypeScript
    └── window.ts         # Tipos de ventanas
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run type-check` - Verifica tipos de TypeScript

## 🎨 Personalización

### Colores
Modifica las variables CSS en `app/globals.css`:
```css
:root {
  --cream: #fff6e6;
  --brown: #5c4033;
  --soft: #f7efe6;
}
```

### Contenido
Edita el contenido de las ventanas en `content/windowContent.tsx`

### Información Personal
- Actualiza el nombre en `components/Navbar/Navbar.tsx`
- Modifica el texto hero en `components/Hero/Hero.tsx`

## 🚀 Deployment

Para desplegar en Vercel:

```bash
npm install -g vercel
vercel
```

O sigue la documentación de Vercel para otros servicios de hosting.

## 📦 Dependencias

- **Next.js** 14.x - Framework React con SSR
- **React** 18.x - Librería UI
- **TypeScript** 5.x - Tipado estático
- **CSS Modules** - Estilos encapsulados (built-in)

## 📝 Notas

- Todos los componentes usan `'use client'` para interactividad del lado del cliente
- Se utiliza Context API para gestión del estado de ventanas
- Los estilos están organizados con CSS Modules por componente
- Responsive design implementado con media queries

## 🤝 Contribuir

Siéntete libre de hacer fork y enviar pull requests.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
