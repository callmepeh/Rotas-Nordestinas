import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { nomeCompleto, email, senha } = await req.json();

    if (!nomeCompleto || !email || !senha) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nomeCompleto },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_API_URL || ""}/`,
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Erro ao obter o ID do usuário." },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from("Users")
      .insert([
        {
          id: userId,
          email,
          nomeCompleto,
          funcao: "usuario",
        },
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Cadastro criado! Verifique seu e-mail para confirmar o acesso.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erro no register:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
