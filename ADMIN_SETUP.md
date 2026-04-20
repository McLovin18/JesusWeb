# 🔑 Configurar Usuario Admin - Jesus Web

## Paso 1: Crear Usuario Admin en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Proyecto: `jesusweb-2d51d`
3. **Authentication → Users**
4. Click **Add user**
5. Llena:
   - Email: `admin@jesusweb.com`
   - Password: (elige una contraseña segura)
6. Click **Create user**

---

## Paso 2: Asignar Custom Claim "admin"

### Opción A: Desde Firebase Console (Manual)

1. En la lista de usuarios, busca `admin@jesusweb.com`
2. Haz click en los **3 puntitos** (⋮) al final de la fila
3. Selecciona **Edit user**
4. Busca la sección **Custom claims** (puede estar abajo)
5. Pega esto exactamente:
   ```json
   {
     "admin": true
   }
   ```
6. Click **Save**

---

### Opción B: Desde Node.js (Recomendado para automatizar)

Crea un archivo `scripts/set-admin.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Descárgalo de Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdminClaim() {
  try {
    const user = await admin.auth().getUserByEmail('admin@jesusweb.com');
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim asignado a ${user.email}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdminClaim();
```

Ejecuta:
```bash
node scripts/set-admin.js
```

---

### Opción C: Desde Firebase CLI

```bash
firebase functions:shell

# En la shell que se abre:
const admin = require('firebase-admin');
admin.auth().setCustomUserClaims('USER_UID', { admin: true });
```

---

## Paso 3: Verificar que Funciona

1. En tu app, intenta login con `admin@jesusweb.com`
2. En la consola del navegador, escribe:
   ```javascript
   import { getAuth } from 'firebase/auth';
   const auth = getAuth();
   const user = auth.currentUser;
   user.getIdTokenResult().then(result => {
     console.log('Custom claims:', result.claims);
   });
   ```
3. Deberías ver: `{ admin: true }`

---

## Paso 4: Descargar Service Account Key (Opcional)

Si usas la opción B (Node.js script), necesitas:

1. En Firebase Console
2. **Project settings (engranaje) → Service accounts**
3. Selecciona **Node.js**
4. Click **Generate new private key**
5. Guarda el archivo como `serviceAccountKey.json` en la raíz del proyecto
6. ⚠️ **IMPORTANTE**: Añade esto a `.gitignore`:
   ```
   serviceAccountKey.json
   ```

---

## Paso 5: .env.local - Variables Necesarias

Asegúrate de que tienes estas variables:

```env
NEXT_PUBLIC_SITE_NAME=Jesus Web
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=jesusweb-2d51d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jesusweb-2d51d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=jesusweb-2d51d.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123...

# Email del admin (debe coincidir con el usuario que creaste)
NEXT_PUBLIC_ADMIN_EMAIL=admin@jesusweb.com
```

---

## 🧪 Probar Login Admin

### En la App (navegador)

1. Abre `http://localhost:3000`
2. Intenta hacer login con:
   - Email: `admin@jesusweb.com`
   - Password: (la que elegiste)

### Verificar custom claim

En `context/UserContext.tsx`, el código ya verifica:

```typescript
const isAdmin = computed(() => {
  return user.value?.email === import.meta.env.VITE_ADMIN_EMAIL;
});
```

Pero mejor aún es verificar desde el token:

```typescript
const idTokenResult = await user.getIdTokenResult();
const isAdmin = idTokenResult.claims.admin === true;
```

---

## 🚨 Troubleshooting

### "No puedo hacer login como admin"
- ✅ Verifica que el usuario existe en Firebase Console
- ✅ Revisa el email exacto (case-sensitive)
- ✅ Intenta reset de contraseña

### "No puedo ver los custom claims"
- ✅ El claim tarda ~5 minutos en propagarse
- ✅ Intenta hacer logout/login nuevamente
- ✅ Recarga la app

### "Las reglas de Firestore dicen 'Permission denied'"
- ✅ Verifica que el usuario tiene custom claim `admin: true`
- ✅ Comprueba que publicaste las reglas (no solo las guardaste)
- ✅ Revisa la consola de Firebase para ver qué regla se disparó

---

## 📚 Recursos

- [Firebase Auth Custom Claims](https://firebase.google.com/docs/auth/admin-setup-custom-claims)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Service Accounts](https://firebase.google.com/docs/admin/setup#initialize_the_sdk)

---

## ✅ Checklist Final

- [ ] Usuario admin creado en Firebase Console
- [ ] Custom claim `admin: true` asignado
- [ ] `.env.local` configurado con `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] Puedes hacer login con admin@jesusweb.com
- [ ] Puedes ver custom claims en el token
- [ ] Firestore Rules están publicadas
- [ ] Storage Rules están publicadas
- [ ] Intentaste leer/escribir en una colección como admin (debe funcionar)
