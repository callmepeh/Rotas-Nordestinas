import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const body = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token não fornecido." },
        { status: 401 }
      );
    }

    // Verify token
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 401 }
      );
    }

    if (authUser.id !== id) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 403 }
      );
    }

    const { action, ...updates } = body;
    let novaFuncao: string | undefined;
    let mensagem = "";

    if (action === "request_collaborator") {
      novaFuncao = "colaborador_pendente";
      mensagem = "Sua solicitação foi enviada e está aguardando análise!";
    } else if (action === "update_profile") {
      mensagem = "Perfil atualizado com sucesso!";
    }

    const { data, error } = await supabase
      .from("Users")
      .update({
        ...updates,
        ...(novaFuncao && { funcao: novaFuncao }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: mensagem,
      user: data,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil." },
      { status: 500 }
    );
  }
}
