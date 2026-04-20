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

export async function GET(request: NextRequest) {
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

    // Obtener reseñas pendientes
    const snapshot = await db
      .collection("resenas")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .get();

    const resenas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(resenas, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/reviews/pending:", error);
    return NextResponse.json(
      { error: "Error al obtener reseñas pendientes" },
      { status: 500 }
    );
  }
}
