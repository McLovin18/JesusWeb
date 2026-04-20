# 🔐 Firebase Security Rules - Jesus Web

## Descripción General

Este proyecto usa **Firestore** para datos y **Cloud Storage** para imágenes. Las reglas están configuradas para:

- ✅ **Lectura pública** de productos, categorías y blogs
- 🔒 **Escritura solo para admin** en todas las colecciones
- 👤 **Usuarios** pueden gestionar su propio carrito y perfil
- 👑 **Admin** tiene acceso total y es verificado por custom claims

---

## 📋 Colecciones de Firestore

### 1. **productos**
```javascript
{
  id: string (auto-generated)
  nombre: string
  descripcion: string
  precio: number
  categoria: string (FK)
  imagen: string (URL de Storage)
  stock: number
  createdAt: timestamp
  updatedAt: timestamp
}
```
- ✅ Lectura: Pública
- 🔒 Escritura: Solo admin

---

### 2. **categorias**
```javascript
{
  id: string (auto-generated)
  nombre: string
  icono: string (ej: "shopping_cart")
  orden: number
  descripcion: string
  imagen?: string (opcional, URL de Storage)
  subcategorias?: array[{
    id: string
    nombre: string
    icono: string
    orden: number
    subcategorias?: array (recursivo)
  }]
  createdAt: timestamp
  updatedAt: timestamp
}
```
- ✅ Lectura: Pública
- 🔒 Escritura: Solo admin

---

### 3. **blogs**
```javascript
{
  id: string (auto-generated)
  title: string
  slug: string (auto-generated)
  description: string
  imagen: string (URL de Storage)
  autor: string
  etiquetas: array<string>
  publicado: boolean
  blocks?: array[{
    id?: string
    type: 'paragraph' | 'subtitle' | 'image'
    text?: string
    url?: string
    alt?: string
    caption?: string
    style?: {
      fontSize?: string
      textAlign?: string
      // ... más estilos
    }
  }]
  contenido?: string (fallback HTML para blogs antiguos)
  vistas: number (default: 0)
  createdAt: timestamp
  updatedAt: timestamp
}
```
- ✅ Lectura: Públicos (publicado==true) + Admin ve todos
- 🔒 Escritura: Solo admin

---

### 4. **users** (Opcional)
```javascript
{
  userId: string (same as request.auth.uid)
  email: string
  nombre: string
  avatar: string (URL de Storage, opcional)
  favoritos: array<string> (IDs de productos)
  createdAt: timestamp
  updatedAt: timestamp
}
```
- ✅ Lectura: Solo el usuario propietario
- ✅ Escritura: Solo el usuario propietario

---

### 5. **carrito** (Opcional, si se persiste en Firestore)
```javascript
{
  userId: string
  items: array[{
    productoId: string
    cantidad: number
    precio: number
  }]
  total: number
  updatedAt: timestamp
}
```
- ✅ Lectura/Escritura: Solo el usuario propietario
- 🔒 Admin puede eliminar

---

### 6. **ordenes** (Opcional, para futuro e-commerce)
```javascript
{
  orderId: string (auto-generated)
  userId?: string (null para invitados)
  items: array[{
    productoId: string
    cantidad: number
    precio: number
  }]
  total: number
  estado: string ('pendiente' | 'pagada' | 'enviada' | 'entregada')
  email: string
  telefono: string
  direccion: string
  createdAt: timestamp
}
```
- ✅ Creación: Cualquiera (invitado o usuario)
- ✅ Lectura: Usuario propietario o Admin
- 🔒 Actualización/Eliminación: Solo Admin

---

## 🔑 Custom Claims para Admin

El usuario admin (`admin@jesusweb.com`) debe tener un custom claim en Firebase Auth:

```json
{
  "admin": true
}
```

### Cómo configurarlo:

**Opción 1: Firebase Console (Manual)**
1. Ve a `Firebase Console → Authentication → Usuarios`
2. Busca `admin@jesusweb.com`
3. Click en los 3 puntos → "Editar custom claims"
4. Pega:
```json
{
  "admin": true
}
```

**Opción 2: Cloud Function (Recomendado)**

Si quieres automatizar esto, puedes crear una Cloud Function:

```javascript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "No estás autenticado"
    );
  }

  const { email } = data;

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `${email} ahora es admin` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", (error as Error).message);
  }
});
```

---

## 🚀 Cómo Aplicar las Reglas

### Firestore Rules

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `jesusweb-2d51d`
3. Ve a **Firestore Database → Rules**
4. Reemplaza el contenido con el de `FIRESTORE_RULES.txt`
5. Click en **Publicar**

### Storage Rules

1. En Firebase Console
2. Ve a **Storage → Rules**
3. Reemplaza el contenido con el de `STORAGE_RULES.txt`
4. Click en **Publicar**

---

## 📝 Tabla de Permisos

| Colección | Lectura Pública | Usuario Auth | Admin | Invitado |
|-----------|-----------------|--------------|-------|----------|
| productos | ✅ | ✅ | ✅ | ✅ |
| categorias | ✅ | ✅ | ✅ | ✅ |
| blogs (publicados) | ✅ | ✅ | ✅ | ✅ |
| blogs (borradores) | ❌ | ❌ | ✅ | ❌ |
| users (propio) | ✅ | ✅ | ✅ | ❌ |
| carrito | ❌ | ✅ | ✅ | ❌ |
| ordenes (propias) | ❌ | ✅ | ✅ | ❌ |
| ordenes (todas) | ❌ | ❌ | ✅ | ❌ |

---

## 🔐 Seguridad

- 🛡️ Las colecciones rechazarán acceso a documentos no configurados
- 🛡️ Solo admin puede escribir en colecciones principales
- 🛡️ Datos públicos (productos, blogs) están completamente accesibles en lectura
- 🛡️ Custom claims verificados en backend (Firebase tokens)
- 🛡️ Storage: Solo admin puede subir, todos pueden descargar

---

## ⚠️ Notas Importantes

1. **Desarrollo vs Producción**: Estas reglas están configuradas para **producción**. En desarrollo, puedes usar:
   ```
   match /{document=**} {
     allow read, write: if true;
   }
   ```
   Pero **NUNCA** uses esto en producción.

2. **Índices**: Firestore puede pedirte crear índices compuestos. Créalos desde los links que te proporcione Firebase.

3. **Custom Claims**: Los custom claims se cachean en el token Firebase. Si cambias el claim, el usuario necesita hacer logout/login para que se actualice.

4. **Storage URLs**: Usa `getDownloadURL()` para obtener URLs públicas en Storage:
   ```typescript
   import { ref, getDownloadURL } from "firebase/storage";
   const url = await getDownloadURL(ref(storage, "productos/imagen.jpg"));
   ```

---

## 📚 Referencias

- [Firestore Security Rules Docs](https://firebase.google.com/docs/firestore/security/start)
- [Storage Security Rules Docs](https://firebase.google.com/docs/storage/security/start)
- [Custom Claims en Firebase](https://firebase.google.com/docs/auth/admin-setup-custom-claims)
