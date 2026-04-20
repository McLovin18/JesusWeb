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
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "ID del producto requerido" },
        { status: 400 }
      );
    }

    // Obtener reseñas aprobadas del producto
    const snapshot = await db
      .collection("resenas")
      .where("productId", "==", productId)
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .get();

    const resenas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(resenas, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/reviews/product:", error);
    return NextResponse.json(
      { error: "Error al obtener reseñas del producto" },
      { status: 500 }
    );
  }
}
