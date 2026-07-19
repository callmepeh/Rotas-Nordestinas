import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { userID, cidadeID, mensagem } = await req.json();

    if (!userID || !cidadeID) {
      return NextResponse.json(
        { error: "userID e cidadeID são obrigatórios." },
        { status: 400 }
      );
    }

    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (token) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return NextResponse.json(
          { error: "Não autorizado." },
          { status: 401 }
        );
      }
    }

    const { data, error } = await supabase
      .from("Comentarios")
      .insert([{ userID, cidadeID, mensagem }])
      .select();

    if (error) {
      console.error("Erro Supabase ao adicionar comentário:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error("Erro ao adicionar comentário:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
