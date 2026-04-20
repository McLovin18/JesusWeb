import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Inicializar Firebase Admin si no está inicializado
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
    const { idToken } = await request.json();

    console.log("[LOGIN API] Recibiendo solicitud de login...");

    if (!idToken) {
      console.error("[LOGIN API] No se proporcionó idToken");
      return NextResponse.json(
        { error: "ID token requerido" },
        { status: 400 }
      );
    }

    // Verificar el token
    console.log("[LOGIN API] Verificando token...");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const isAdmin = decodedToken.admin === true;

    console.log("[LOGIN API] Token verificado:", { uid, email, isAdmin });

    if (!isAdmin) {
      console.error("[LOGIN API] Usuario no es admin:", email);
      return NextResponse.json(
        { error: "Solo administradores pueden acceder" },
        { status: 403 }
      );
    }

    // Crear la sesión
    const response = NextResponse.json(
      { 
        success: true,
        message: "Login exitoso",
        user: {
          uid,
          email,
          admin: true,
        }
      },
      { status: 200 }
    );

    // Crear cookie de sesión
    response.cookies.set("auth-token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    console.log("[LOGIN API] Login exitoso para:", email);
    return response;
  } catch (error: any) {
    console.error("[LOGIN API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar login" },
      { status: 401 }
    );
  }
}
