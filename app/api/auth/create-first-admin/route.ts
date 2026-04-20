import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, masterPassword } = await request.json();

    // Validar contraseña maestra
    if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
      return NextResponse.json(
        { error: "Contraseña maestra incorrecta" },
        { status: 403 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    // Verificar que no haya admins existentes
    const adminUsers = await admin.auth().listUsers();
    const hasExistingAdmin = adminUsers.users.some(
      (user) => user.customClaims?.admin === true
    );

    if (hasExistingAdmin) {
      return NextResponse.json(
        { error: "Ya existe un administrador en el sistema" },
        { status: 400 }
      );
    }

    // Crear usuario en Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: "Administrador",
    });

    // Asignar custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    // Obtener ID token para el cliente
    const idToken = await admin.auth().createCustomToken(userRecord.uid);

    return NextResponse.json(
      {
        success: true,
        message: "Administrador creado exitosamente",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          admin: true,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creando admin:", error);

    // Manejar errores específicos de Firebase
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "El email ya existe en Firebase" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al crear administrador" },
      { status: 500 }
    );
  }
}
