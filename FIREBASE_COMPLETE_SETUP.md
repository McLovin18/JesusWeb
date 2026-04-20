# ✅ Firebase Setup Checklist - Jesus Web

## 📋 Pre-requisitos

- [ ] Proyecto Firebase creado: `jesusweb-2d51d`
- [ ] Firestore Database habilitada
- [ ] Cloud Storage habilitado
- [ ] Authentication habilitada (Email/Password)

---

## 1️⃣ FIRESTORE DATABASE SETUP

### 1.1 Crear Colecciones Vacías

En Firebase Console → Firestore → **Start collection**

Crea estas colecciones (puedes dejar sin documentos, las llenarás desde la app):

```
1. productos          (para productos de tienda)
2. categorias        (para categorías)
3. blogs             (para artículos)
4. users             (opcional, para perfil de usuarios)
5. carrito           (opcional, para persistencia de carrito)
6. ordenes           (opcional, para futuro e-commerce)
```

### 1.2 Aplicar Security Rules

1. Firebase Console → Firestore → **Rules**
2. Reemplaza todo el contenido con el archivo `FIRESTORE_RULES.txt`
3. Click **Publish**

**Verificar:**
```
✅ La consola dice "Rules published successfully"
```

---

## 2️⃣ CLOUD STORAGE SETUP

### 2.1 Crear Buckets/Carpetas

En Firebase Console → Storage → **Files**

Crea estas carpetas (solo son referencias lógicas):

```
- productos/         (imágenes de productos)
- categorias/        (iconos/imágenes de categorías)
- blogs/             (imágenes de blogs)
- profile_pictures/  (fotos de perfil, opcional)
```

*Nota: No necesitas crear literalmente las carpetas. Se crean automáticamente al subir archivos.*

### 2.2 Aplicar Storage Rules

1. Firebase Console → Storage → **Rules**
2. Reemplaza todo el contenido con el archivo `STORAGE_RULES.txt`
3. Click **Publish**

**Verificar:**
```
✅ La consola dice "Rules deployed successfully"
```

---

## 3️⃣ AUTHENTICATION SETUP

### 3.1 Habilitar Email/Password

1. Firebase Console → Authentication → **Sign-in method**
2. Busca **Email/Password**
3. Habilita si no está habilitado
4. Click **Save**

### 3.2 Crear Usuario Admin

1. Firebase Console → Authentication → **Users**
2. Click **Add user**
3. Completa:
   - Email: `admin@jesusweb.com`
   - Password: (tu contraseña segura)
4. Click **Create user**

**Verificar:**
```
✅ El usuario aparece en la lista
```

### 3.3 Asignar Custom Claim "admin"

1. En la lista de usuarios, busca `admin@jesusweb.com`
2. Haz click en los **3 puntos** (⋮) al final
3. Selecciona **Edit user**
4. Busca **Custom claims** (puede estar en la parte baja)
5. Pega exactamente:
```json
{
  "admin": true
}
```
6. Click **Save**

**Verificar:**
```
✅ El custom claim aparece en el usuario
```

---

## 4️⃣ CONFIGURAR APLICACIÓN

### 4.1 Verificar .env.local

Asegúrate de tener estas variables exactas:

```env
NEXT_PUBLIC_SITE_NAME=Jesus Web
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jesusweb-2d51d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jesusweb-2d51d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jesusweb-2d51d.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_ADMIN_EMAIL=admin@jesusweb.com
```

*Obtén los valores exactos desde Firebase Console → Project Settings*

### 4.2 Verificar Código

- [ ] `lib/firebase.ts` importa y inicializa Firebase
- [ ] `lib/firebase-auth.ts` tiene funciones de auth
- [ ] `context/UserContext.tsx` detecta admin por email
- [ ] `context/WindowContext.tsx` está disponible

---

## 5️⃣ CREAR DATOS DE PRUEBA

### 5.1 Crear Categoría de Prueba

En Firestore Console:

1. Click en colección `categorias`
2. Click **Add document**
3. Document ID: `cat-1` (o auto)
4. Campos:
```
nombre: "Electrónica"
icono: "smartphone"
orden: 1
descripcion: "Productos electrónicos"
createdAt: (timestamp actual)
updatedAt: (timestamp actual)
```
5. Click **Save**

### 5.2 Crear Producto de Prueba

1. Click en colección `productos`
2. Click **Add document**
3. Campos:
```
nombre: "Laptop Gaming"
descripcion: "Laptop potente para gaming"
precio: 1999.99
categoria: "cat-1" (referencia anterior)
stock: 10
imagen: "https://via.placeholder.com/400"
createdAt: (timestamp)
updatedAt: (timestamp)
```
4. Click **Save**

### 5.3 Crear Blog de Prueba

1. Click en colección `blogs`
2. Click **Add document**
3. Campos:
```
title: "Mi Primer Blog"
slug: "mi-primer-blog"
description: "Este es mi primer artículo"
autor: "Hector"
imagen: "https://via.placeholder.com/600"
publicado: true
etiquetas: ["tutorial", "blog"]
vistas: 0
blocks: [
  {
    type: "paragraph",
    text: "Este es el contenido del blog"
  }
]
createdAt: (timestamp)
updatedAt: (timestamp)
```
4. Click **Save**

**Verificar:**
```
✅ Aparecen en la app al abrir Tienda/Blogs
```

---

## 6️⃣ PROBAR REGLAS DE SEGURIDAD

### 6.1 Probar Lectura Pública

```
✅ Sin login: Debo ver productos y blogs publicados
✅ Sin login: NO debo ver blogs borradores (publicado: false)
```

### 6.2 Probar Escritura como Admin

1. Login como `admin@jesusweb.com`
2. Crea un producto desde admin panel (si lo tienes)
3. Verifica en Firestore que aparezca

```
✅ Producto creado exitosamente
✅ Aparece en Firebase Console
```

### 6.3 Probar Escritura como Usuario Normal

1. Crea usuario normal en Firebase Auth (ej: `usuario@example.com`)
2. Login como ese usuario
3. Intenta crear un producto (si expones esa funcionalidad)

```
❌ Debe rechazar con "Permission denied"
```

---

## 7️⃣ STORAGE - SUBIR IMÁGENES

### 7.1 Subir Imagen Manualmente (Testing)

1. Firebase Console → Storage → **Files**
2. Click **Upload file**
3. Sube una imagen a `productos/test.jpg`
4. Click derecho → **Copy URL**
5. Usa esa URL en tus documentos:
```
imagen: "https://storage.googleapis.com/.../test.jpg"
```

### 7.2 Verificar Permisos

```
✅ Puedo ver la imagen sin login (lectura pública)
✅ Admin puede subir archivos
❌ Usuario normal no puede subir
```

---

## 8️⃣ MODO EMULADOR (Opcional - Para Desarrollo Local)

Si quieres probar rules sin publicar:

```bash
# Instalar emulators
firebase init emulators

# Iniciar
firebase emulators:start --only firestore,storage,auth
```

En `lib/firebase.ts` agregar:

```typescript
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

En `.env.local`:
```
NEXT_PUBLIC_USE_EMULATOR=true
```

---

## 9️⃣ TROUBLESHOOTING

### ❌ "Permission denied" al leer productos

**Checklist:**
- [ ] ¿Publicaste las Firestore rules?
- [ ] ¿Verificaste que `allow read: if true` está en productos?
- [ ] ¿El documento existe en Firestore?

**Solución:**
```javascript
// En Firebase Console → Firestore → Rules
// Verifica que diga "Rules published successfully"
```

---

### ❌ "Permission denied" al escribir como admin

**Checklist:**
- [ ] ¿El usuario tiene custom claim `admin: true`?
- [ ] ¿Hiciste logout/login después de agregar el custom claim?
- [ ] ¿Publicaste las reglas nuevamente?

**Solución:**
```typescript
// En navegador console
const result = await auth.currentUser.getIdTokenResult(true);
console.log(result.claims); // Debe tener {admin: true}
```

---

### ❌ Los datos no aparecen en la app

**Checklist:**
- [ ] ¿Creaste el documento en Firestore Console?
- [ ] ¿Está en la colección correcta?
- [ ] ¿La estructura del documento es correcta?
- [ ] ¿Recargaste la página?

**Solución:**
```typescript
// En console de navegador
import { collection, getDocs } from 'firebase/firestore';
const snapshot = await getDocs(collection(db, 'productos'));
console.log(snapshot.docs); // Debe mostrar los documentos
```

---

## ✅ FINAL CHECKLIST

Cuando todo esté configurado:

- [ ] Firestore Database creado
- [ ] Storage habilitado
- [ ] Authentication configurado
- [ ] Colecciones creadas (al menos vacías)
- [ ] Firestore Rules publicadas
- [ ] Storage Rules publicadas
- [ ] Usuario admin creado
- [ ] Custom claim `admin: true` asignado
- [ ] .env.local configurado correctamente
- [ ] Datos de prueba creados
- [ ] Puedo hacer login
- [ ] Puedo ver productos en la app
- [ ] Puedo ver blogs publicados
- [ ] Admin puede crear/editar productos
- [ ] Usuario normal NO puede crear productos

---

## 📞 Soporte

Si algo no funciona:

1. Revisa `SECURITY_RULES_GUIDE.md` para entender las reglas
2. Lee `RULES_EXAMPLES.md` para ver ejemplos de código
3. Verifica `ADMIN_SETUP.md` para config de admin
4. Mira los logs de Firebase Console
5. Usa el emulator local para debug

---

## 📚 Documentación Oficial

- [Firestore Setup](https://firebase.google.com/docs/firestore/quickstart)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/start)
- [Cloud Storage](https://firebase.google.com/docs/storage/web/start)
