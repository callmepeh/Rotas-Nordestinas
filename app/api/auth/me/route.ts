import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { data: profile, error: profileError } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: profile });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao carregar perfil." },
      { status: 500 }
    );
  }
}
