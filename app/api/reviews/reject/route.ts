import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

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

const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    // Verificar que sea admin
    const idToken = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 401 }
      );
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.admin !== true) {
      return NextResponse.json(
        { error: "Solo administradores pueden acceder" },
        { status: 403 }
      );
    }

    // Obtener ID de la reseña
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de reseña requerido" },
        { status: 400 }
      );
    }

    // Rechazar reseña
    await db.collection("resenas").doc(id).update({
      status: "rejected",
    });

    return NextResponse.json(
      { message: "Reseña rechazada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en POST /api/reviews/reject:", error);
    return NextResponse.json(
      { error: "Error al rechazar reseña" },
      { status: 500 }
    );
  }
}
