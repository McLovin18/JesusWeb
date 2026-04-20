# 🔥 Configuración Completa de Firebase

## Paso 1: Estructura de Colecciones en Firestore

Accede a [Firebase Console](https://console.firebase.google.com) y crea las siguientes colecciones:

### 1. **Colección: `productos`**
```
Documento: {id automático}
├── nombre: string (ej: "iPhone 14 Pro")
├── sku: string (ej: "IP14P-256GB")
├── stock: number (ej: 50)
├── precio: number (ej: 999.99)
├── descuento: number (0-100) (ej: 10 para 10% descuento)
├── categoria: string (ID de categoría)
├── subcategoria: string (opcional)
├── subsubcategoria: string (opcional)
├── marca: string (ej: "Apple")
├── imagenes: array<string> (URLs de imágenes o rutas de Storage)
├── descripcion: string (descripción larga)
├── caracteristicas: array<string> (ej: ["256GB", "5G", "ProMotion"])
├── bodegaId: string (opcional, para inventario)
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 2. **Colección: `categorias`**
```
Documento: {id automático}
├── nombre: string (ej: "Smartphones")
├── icono: string (ej: "smartphone" - Material Icons)
├── orden: number (para ordenar en UI)
├── descripcion: string (opcional)
├── subcategorias: array<object> (estructura recursiva)
│   ├── id: string (generado: Math.random().toString(36))
│   ├── nombre: string
│   ├── orden: number
│   └── subcategorias: array (para nivel 3)
├── createdAt: timestamp
└── updatedAt: timestamp
```

**Ejemplo de categorías con subcategorías:**
```javascript
{
  nombre: "Tecnología",
  icono: "devices",
  orden: 1,
  subcategorias: [
    {
      id: "xyz123",
      nombre: "Smartphones",
      orden: 1,
      subcategorias: [
        {
          id: "abc456",
          nombre: "iPhone",
          orden: 1
        }
      ]
    }
  ]
}
```

### 3. **Colección: `blogs`**
```
Documento: {id automático}
├── titulo: string (ej: "Guía de compra de smartphones 2026")
├── slug: string (ej: "guia-compra-smartphones-2026")
├── contenido: string (HTML o markdown)
├── imagen: string (URL de portada)
├── autor: string (ej: "Admin")
├── etiquetas: array<string> (ej: ["tech", "smartphones", "guía"])
├── publicado: boolean (true para mostrar en sitio)
├── vistas: number (se incrementa automáticamente)
├── createdAt: timestamp
└── updatedAt: timestamp
```

---

## Paso 2: Configurar Firebase Storage (para imágenes)

1. Accede a **Firebase Console → Storage**
2. Click en "Comenzar"
3. Selecciona ubicación geográfica cercana
4. Copia la regla de seguridad recomendada (abajo)

### Reglas de Seguridad para Storage
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Solo admin puede escribir/eliminar
    match /productos/{fileName} {
      allow write, delete: if request.auth.token.email == resource.metadata.get('adminEmail');
    }
    
    match /blogs/{fileName} {
      allow write, delete: if request.auth.token.email == resource.metadata.get('adminEmail');
    }
  }
}
```

---

## Paso 3: Configurar Autenticación (Solo Admin)

1. **Firebase Console → Authentication**
2. Click en "Comenzar"
3. Activa **Email/Password**
4. Click en "Usuarios"
5. Click en "Añadir usuario"
6. Ingresa:
   - Email: `admin@tecnothing.com` (debe coincidir con `NEXT_PUBLIC_ADMIN_EMAIL`)
   - Contraseña: `AdminPassword123!` (cambiar después en settings)

---

## Paso 4: Reglas de Seguridad en Firestore

1. **Firebase Console → Firestore Database → Reglas**
2. Reemplaza con esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Productos: lectura pública, escritura solo admin
    match /productos/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Categorías: lectura pública, escritura solo admin
    match /categorias/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Blogs publicados: lectura pública
    match /blogs/{document} {
      allow read: if resource.data.publicado == true;
    }
    
    // Blogs (admin): lectura/escritura solo admin
    match /blogs/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Funciones auxiliares
    function isAdmin() {
      return request.auth.token.email == 'admin@tecnothing.com';
    }
  }
}
```

---

## Paso 5: Instalación de Dependencias

```bash
npm install firebase
```

---

## Paso 6: Estructura de `.env.local` (ya configurado ✅)

```env
# Credenciales de Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCZOKiR6chfjbHPGXuWeIac5f1x2WdmSuM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jesusweb-2d51d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jesusweb-2d51d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jesusweb-2d51d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=179678125136
NEXT_PUBLIC_FIREBASE_APP_ID=1:179678125136:web:62d6271a09a629486e0555
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4V1CP63R2K

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@tecnothing.com
```

---

## Paso 7: Crear Primera Categoría

En **Firestore Console**, crea manualmente un documento en `categorias`:

```json
{
  "nombre": "Electrónica",
  "icono": "devices",
  "orden": 1,
  "descripcion": "Todos los productos electrónicos",
  "subcategorias": [],
  "createdAt": "2026-04-19T00:00:00Z",
  "updatedAt": "2026-04-19T00:00:00Z"
}
```

---

## Paso 8: Crear Primer Producto

En **Firestore Console**, crea un documento en `productos`:

```json
{
  "nombre": "Samsung Galaxy S25",
  "sku": "SG-S25-256",
  "stock": 30,
  "precio": 899.99,
  "descuento": 5,
  "categoria": "{ID_DE_CATEGORIA}",
  "subcategoria": "Smartphones",
  "marca": "Samsung",
  "imagenes": ["https://ejemplo.com/imagen1.jpg"],
  "descripcion": "Últimas características de Samsung",
  "caracteristicas": ["256GB", "5G", "AMOLED"],
  "createdAt": "2026-04-19T00:00:00Z",
  "updatedAt": "2026-04-19T00:00:00Z"
}
```

---

## Verificación ✅

1. Accede a http://localhost:3000
2. Haz click en "Mi Tienda" en el navbar
3. Deberías ver las categorías y productos
4. Haz click en "Blogs"
5. Deberías ver los blogs publicados

---

## Siguientes Pasos Opcionales

- [ ] Crear página de **login admin** (`/admin/login`)
- [ ] Crear dashboard admin completo
- [ ] Integrar Stripe para pagos
- [ ] Sistema de órdenes
- [ ] Email notifications
- [ ] Analytics avanzado

