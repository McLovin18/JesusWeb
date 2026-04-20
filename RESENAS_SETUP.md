# 📋 Configuración de Sistema de Reseñas

## 🚀 Pasos de Configuración

### 1. Crear Colección en Firestore

1. Ve a **Firebase Console** → Tu proyecto → **Firestore Database**
2. Haz clic en **+ Crear colección** o **+ Agregar colección**
3. **Nombre de colección**: `resenas`
4. Haz clic en **Siguiente**
5. En el primer documento, puedes hacer clic en **Cancelar** ya que los documentos se crearán automáticamente cuando se envíen reseñas

### 2. Estructura de Datos en Firestore

Cada reseña en la colección `resenas` tendrá la siguiente estructura:

```json
{
  "productId": "ID_DEL_PRODUCTO",
  "productName": "Nombre del Producto",
  "userName": "Nombre del Usuario",
  "userEmail": "email@example.com",
  "rating": 5,
  "comment": "Excelente producto, muy recomendado",
  "status": "pending",
  "createdAt": 1713607800000
}
```

**Campos explicados:**
- `productId` (string): ID único del producto en Firestore
- `productName` (string): Nombre del producto (para mostrar en admin)
- `userName` (string): Nombre del usuario que deja la reseña
- `userEmail` (string): Email del usuario (opcional)
- `rating` (number): Calificación de 1 a 5
- `comment` (string): Texto de la reseña
- `status` (string): `pending` (nueva), `approved` (aprobada), `rejected` (rechazada)
- `createdAt` (number): Timestamp en milisegundos

### 3. Reglas de Seguridad de Firestore

Actualiza las reglas de Firestore para permitir:
- Lectura pública de reseñas aprobadas
- Admin pueda ver y modificar todas las reseñas
- Usuarios puedan crear reseñas pendientes

En **Firestore Database** → **Reglas**, reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Reseñas: públicos lectura de aprobadas, admin gestión completa
    match /resenas/{document=**} {
      allow read: if resource.data.status == 'approved';
      allow create: if request.auth != null;
      allow update, delete: if request.auth.token.admin == true;
    }

    // Otros documentos (productos, etc.)
    match /productos/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    match /categorias/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    match /blogs/{document=**} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    // Denegar acceso a otros documentos por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 📡 Endpoints API Disponibles

### 1. **GET /api/reviews/pending**
**Requiere**: Admin autenticado
**Headers**: `Authorization: Bearer {idToken}`
**Respuesta**: Array de reseñas con status `pending`

```bash
curl -H "Authorization: Bearer TOKEN" \
  https://tudominio.com/api/reviews/pending
```

### 2. **POST /api/reviews/approve**
**Requiere**: Admin autenticado
**Query**: `id` (ID de la reseña)
**Headers**: `Authorization: Bearer {idToken}`

```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  https://tudominio.com/api/reviews/approve?id=REVIEW_ID
```

### 3. **POST /api/reviews/reject**
**Requiere**: Admin autenticado
**Query**: `id` (ID de la reseña)
**Headers**: `Authorization: Bearer {idToken}`

```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  https://tudominio.com/api/reviews/reject?id=REVIEW_ID
```

### 4. **POST /api/reviews/submit**
**Requiere**: Ninguno (público)
**Body JSON**:
```json
{
  "productId": "ID_DEL_PRODUCTO",
  "productName": "Nombre Producto",
  "userName": "Nombre Usuario",
  "userEmail": "email@example.com",
  "rating": 5,
  "comment": "Mi opinión sobre el producto"
}
```

**Ejemplo**:
```bash
curl -X POST https://tudominio.com/api/reviews/submit \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod123",
    "productName": "Mi Producto",
    "userName": "Juan",
    "userEmail": "juan@example.com",
    "rating": 5,
    "comment": "Excelente!"
  }'
```

### 5. **GET /api/reviews/product**
**Requiere**: Ninguno (público)
**Query**: `productId` (ID del producto)
**Respuesta**: Array de reseñas aprobadas del producto

```bash
curl https://tudominio.com/api/reviews/product?productId=prod123
```

## 🔧 Funciones Disponibles (lib/reviews-db.ts)

```typescript
// Crear reseña
import { crearResena } from '@/lib/reviews-db';
await crearResena({
  productId: "prod123",
  productName: "Mi Producto",
  userName: "Juan",
  rating: 5,
  comment: "Excelente"
});

// Obtener reseñas pendientes
import { obtenerResenasPendientes } from '@/lib/reviews-db';
const pendientes = await obtenerResenasPendientes();

// Obtener reseñas aprobadas de un producto
import { obtenerResenasPorProducto } from '@/lib/reviews-db';
const resenas = await obtenerResenasPorProducto("prod123");

// Aprobar reseña
import { aprobarResena } from '@/lib/reviews-db';
await aprobarResena("resena_id");

// Rechazar reseña
import { rechazarResena } from '@/lib/reviews-db';
await rechazarResena("resena_id");

// Estadísticas del producto
import { obtenerEstadisticasProducto } from '@/lib/reviews-db';
const stats = await obtenerEstadisticasProducto("prod123");
// Retorna: { total, aprobadas, pendientes, rechazadas, promedio }
```

## 📱 Flujo de Uso

### Para Usuarios (dejar reseña):
1. Usuario ve producto en el detalle
2. Completa formulario: nombre, email, rating, comentario
3. Envía reseña vía POST `/api/reviews/submit`
4. Reseña se guarda con status `pending` en Firestore
5. Se muestra mensaje: "Tu reseña será revisada por el admin"

### Para Admin (gestionar reseñas):
1. Admin va a `/admin/reviews`
2. Ve lista de reseñas `pending`
3. Puede:
   - ✅ **Aprobar**: Reseña cambia a `approved` y es visible en la página del producto
   - ❌ **Rechazar**: Reseña cambia a `rejected` y no se muestra
4. Las reseñas aprobadas aparecen en el detalle del producto

### Para Clientes (ver reseñas):
1. Cliente ve página de detalle del producto
2. Se cargan reseñas aprobadas vía GET `/api/reviews/product?productId=prod123`
3. Se muestran rating, nombre, fecha y comentario
4. Puede ver promedio de calificación

## ✅ Checklist de Instalación

- [ ] Colección `resenas` creada en Firestore
- [ ] Variables de entorno configuradas (Firebase Admin SDK)
- [ ] Archivos creados:
  - [ ] `lib/reviews-db.ts`
  - [ ] `app/api/reviews/pending/route.ts`
  - [ ] `app/api/reviews/approve/route.ts`
  - [ ] `app/api/reviews/reject/route.ts`
  - [ ] `app/api/reviews/submit/route.ts`
  - [ ] `app/api/reviews/product/route.ts`
- [ ] Página `/app/admin/reviews/page.tsx` actualizada
- [ ] Reglas de Firestore configuradas
- [ ] Probado envío de reseña (POST /api/reviews/submit)
- [ ] Probado panel admin (GET /api/reviews/pending)
- [ ] Probado aprobación (POST /api/reviews/approve)
- [ ] Probado visualización en producto (GET /api/reviews/product)

## 🐛 Troubleshooting

### "Error al cargar reseñas" en el admin
- Verifica que el usuario esté autenticado como admin
- Verifica que el idToken se está obteniendo correctamente
- Revisa la consola del navegador para más detalles

### Las reseñas no aparecen en Firestore
- Verifica que FIREBASE_PROJECT_ID esté correcto en `.env.local`
- Verifica que las credenciales de Firebase Admin están configuradas

### No se pueden enviar reseñas
- Verifica que la colección `resenas` existe en Firestore
- Revisa las reglas de seguridad de Firestore

### Las reseñas aprobadas no aparecen en el producto
- Verifica que `status: 'approved'` esté en Firestore
- Asegúrate de que el `productId` coincida exactamente

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor (terminal de Next.js)
3. Verifica Firebase Console → Firestore → Reglas y Datos
4. Verifica Firebase Console → Authentication
