# 📝 Ejemplos de Uso - Rules en Acción

## Lectura de Productos (Pública)

```typescript
// Cualquiera puede leer productos
const querySnapshot = await getDocs(collection(db, 'productos'));
// ✅ Funciona: La regla permite read: if true
```

---

## Escritura de Productos (Solo Admin)

```typescript
// Admin crea producto
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';

const auth = getAuth();
const user = auth.currentUser;

// Verificar que sea admin antes de intentar
const idTokenResult = await user?.getIdTokenResult();
if (idTokenResult?.claims.admin) {
  await addDoc(collection(db, 'productos'), {
    nombre: 'Laptop',
    precio: 999.99,
    categoria: 'Electrónica',
    createdAt: new Date(),
  });
  // ✅ Funciona: El usuario tiene admin: true en su token
}

// Usuario NO admin intenta escribir
await addDoc(collection(db, 'productos'), { /* ... */ });
// ❌ Error: Permission denied (la regla rechaza)
```

---

## Lectura de Blogs (Público si publicado)

```typescript
// Leer blogs publicados (cualquiera)
import { query, where, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'blogs'),
  where('publicado', '==', true)
);

const snapshot = await getDocs(q);
// ✅ Funciona: Cumple la regla (publicado == true || isAdmin())

// Intentar leer blog borrador (no admin)
const draftRef = doc(db, 'blogs', 'borrador-id');
const draftSnap = await getDoc(draftRef);
// ❌ Error: Permission denied (no cumple ninguna condición)

// Admin puede leer cualquier blog (publicado o no)
// ✅ Funciona: isAdmin() es true
```

---

## Actualizar Blog (Solo Admin)

```typescript
import { updateDoc, doc } from 'firebase/firestore';

// Admin actualiza blog
if (isAdmin) {
  await updateDoc(doc(db, 'blogs', 'blog-id'), {
    title: 'Nuevo título',
    publicado: true,
  });
  // ✅ Funciona: isAdmin() es true
}

// Usuario NO admin intenta actualizar
await updateDoc(doc(db, 'blogs', 'blog-id'), {
  title: 'Intento de edición',
});
// ❌ Error: Permission denied (la regla solo permite a admin)
```

---

## Carrito (Usuario Propio)

```typescript
import { setDoc, doc, getDoc } from 'firebase/firestore';

const userId = auth.currentUser?.uid;

// Usuario guarda su carrito
if (userId) {
  await setDoc(doc(db, 'carrito', userId), {
    userId: userId,
    items: [
      { productoId: 'prod-1', cantidad: 2, precio: 50 },
      { productoId: 'prod-2', cantidad: 1, precio: 100 },
    ],
    total: 200,
  });
  // ✅ Funciona: El userId del documento coincide con request.auth.uid
}

// Usuario intenta leer carrito de otro usuario
const otroCarrito = await getDoc(doc(db, 'carrito', 'otro-user-id'));
// ❌ Error: Permission denied (no es el dueño)

// Admin intenta actualizar carrito
// ❌ Error: La regla dice 'if isSignedIn() && resource.data.userId == request.auth.uid'
// Admin no es el dueño del carrito (aunque sea admin)
// Para que admin pueda editar, la regla sería: if isAdmin() || (isSignedIn() && ...)
```

---

## Órdenes (Crear como Invitado, Leer como Propietario)

```typescript
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';

// INVITADO crea orden
const orderData = {
  userId: null, // Invitado
  items: [{ productoId: 'prod-1', cantidad: 1 }],
  total: 100,
  email: 'cliente@example.com',
  createdAt: new Date(),
};
const docRef = await addDoc(collection(db, 'ordenes'), orderData);
// ✅ Funciona: allow create: if true (cualquiera puede)

// USUARIO AUTENTICADO puede ver su orden
const myOrders = query(
  collection(db, 'ordenes'),
  where('userId', '==', auth.currentUser?.uid)
);
const snapshot = await getDocs(myOrders);
// ✅ Funciona: isSignedIn() && resource.data.userId == request.auth.uid

// ADMIN ve todas las órdenes
// ✅ Funciona: isAdmin() es true

// Usuario intenta actualizar orden
await updateDoc(doc(db, 'ordenes', 'order-id'), { estado: 'completada' });
// ❌ Error: allow update: if isAdmin() rechaza a no-admin
```

---

## Storage - Subir Imagen de Producto (Admin)

```typescript
import { ref, uploadBytes } from 'firebase/storage';

// Admin sube imagen
if (isAdmin) {
  const storageRef = ref(storage, 'productos/laptop.jpg');
  await uploadBytes(storageRef, imageFile);
  // ✅ Funciona: request.auth.token.admin == true
}

// Usuario NO admin intenta subir
const storageRef = ref(storage, 'productos/otro.jpg');
await uploadBytes(storageRef, imageFile);
// ❌ Error: Permission denied
```

---

## Storage - Descargar Imagen (Pública)

```typescript
import { ref, getDownloadURL } from 'firebase/storage';

// Cualquiera (sin auth) puede descargar
const storageRef = ref(storage, 'productos/laptop.jpg');
const url = await getDownloadURL(storageRef);
// ✅ Funciona: allow read: if true
```

---

## Errores Comunes y Soluciones

### ❌ "Permission denied" al leer productos

**Problema:** Las reglas de Firestore están tan restrictivas que no deja leer nada.

**Solución:**
```javascript
// ❌ MAL
match /productos/{productId} {
  allow read: if request.auth != null; // Solo usuarios autenticados
}

// ✅ BIEN
match /productos/{productId} {
  allow read: if true; // Cualquiera puede leer
}
```

---

### ❌ "Permission denied" al actualizar blogs como admin

**Problema:** Verificaste que es admin en el frontend, pero Firestore rechaza.

**Solución:**
1. Verifica que la función `isAdmin()` está correcta:
   ```javascript
   function isAdmin() {
     return isSignedIn() && request.auth.token.admin == true;
   }
   ```

2. Verifica que el usuario tiene el custom claim:
   ```javascript
   const result = await user.getIdTokenResult(true); // true = force refresh
   console.log(result.claims.admin); // debe ser true
   ```

3. Publica las reglas nuevamente (a veces se olvida hacer click en "Publish")

---

### ❌ "Permission denied" al crear orden como invitado

**Problema:** Las órdenes solo permitían crear a usuarios autenticados.

**Solución:** La regla debe estar:
```javascript
match /ordenes/{orderId} {
  allow create: if true; // Invitados también pueden
}
```

---

### ⚠️ Custom claims no se actualizan

**Problema:** Cambié el custom claim pero el usuario sigue sin permiso.

**Solución:** Los claims se cachean en el token. El usuario necesita:
1. Hacer logout
2. Esperar ~5 minutos (o actualizar token manualmente)
3. Hacer login nuevamente

Para forzar actualización:
```typescript
const auth = getAuth();
await auth.currentUser?.getIdTokenResult(true); // true = force refresh
```

---

## 🔍 Debugging

### Ver qué regla se disparó

En Firebase Console → Firestore → Rules → Logs, puedes ver:

```
Read request denied
Location: /productos/prod-123
Reason: Rule at `match /productos/{productId} { allow read: if ??? }`
```

### Emular Firestore localmente

Para probar reglas sin publicar:

```bash
firebase emulators:start --only firestore
```

En tu app, conecta al emulator:

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## ✅ Checklist - Rules Working

- [ ] Puedo leer productos sin estar logueado
- [ ] Puedo leer blogs publicados sin estar logueado
- [ ] NO puedo leer blogs borradores sin ser admin
- [ ] Puedo escribir productos siendo admin
- [ ] NO puedo escribir productos siendo usuario normal
- [ ] Puedo ver mi carrito siendo usuario
- [ ] NO puedo ver carrito de otros usuarios
- [ ] Admin ve todas las órdenes
- [ ] Usuario solo ve sus órdenes

---

## 📚 Referencias

- [Firestore Security Rules Language](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Common Security Rules Patterns](https://firebase.google.com/docs/firestore/security/rules-query)
