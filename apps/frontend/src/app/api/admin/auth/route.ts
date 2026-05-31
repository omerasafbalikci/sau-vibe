// app/api/admin/auth/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const EXACT_ADMIN_KEY = process.env.ADMIN_KEY; // Sunucu tarafında env'den güvenli şekilde okunur.

    if (!EXACT_ADMIN_KEY) {
      return NextResponse.json(
        { success: false, message: "Sunucu hatası: ADMIN_KEY konfigüre edilmemiş." },
        { status: 500 }
      );
    }

    if (password === EXACT_ADMIN_KEY) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "Geçersiz veya hatalı admin anahtarı girdiniz." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Sistemsel bir hata oluştu." },
      { status: 500 }
    );
  }
}