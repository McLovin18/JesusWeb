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
    const body = await request.json();
    const { productId, productName, userName, userEmail, rating, comment } = body;

    // Validar datos requeridos
    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Validar rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "El rating debe estar entre 1 y 5" },
        { status: 400 }
      );
    }

    // Crear reseña
    await db.collection("resenas").add({
      productId,
      productName: productName || "Producto sin nombre",
      userName,
      userEmail: userEmail || "",
      rating: parseInt(rating),
      comment,
      status: "pending",
      createdAt: Date.now(),
    });

    return NextResponse.json(
      { message: "Reseña enviada exitosamente. Será revisada por el administrador." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/reviews/submit:", error);
    return NextResponse.json(
      { error: "Error al enviar reseña" },
      { status: 500 }
    );
  }
}
