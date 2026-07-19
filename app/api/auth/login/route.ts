import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

    if (loginError || !loginData?.user) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const userId = loginData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Login realizado com sucesso.",
      token: loginData.session.access_token,
      user: profile,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
