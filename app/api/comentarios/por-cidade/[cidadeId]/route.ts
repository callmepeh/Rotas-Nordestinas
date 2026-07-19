import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cidadeId: string }> }
) {
  try {
    const { cidadeId } = await params;

    const { data: comentarios, error: comentariosError } = await supabase
      .from("Comentarios")
      .select("*")
      .eq("cidadeID", cidadeId)
      .order("created_at", { ascending: false });

    if (comentariosError) {
      return NextResponse.json(
        { error: comentariosError.message },
        { status: 400 }
      );
    }

    if (!comentarios || comentarios.length === 0) {
      return NextResponse.json([]);
    }

    const userIds = [
      ...new Set(
        comentarios.map((c: any) => c.userID).filter((id: any) => id)
      ),
    ];

    if (userIds.length === 0) {
      const comentariosSemUsuario = comentarios.map((c: any) => ({
        ...c,
        usuario: null,
      }));
      return NextResponse.json(comentariosSemUsuario);
    }

    const { data: usuarios, error: usuariosError } = await supabase
      .from("Users")
      .select("id, nomeCompleto")
      .in("id", userIds);

    if (usuariosError) {
      const comentariosComUsuarioNull = comentarios.map((c: any) => ({
        ...c,
        usuario: null,
      }));
      return NextResponse.json(comentariosComUsuarioNull);
    }

    const userMap = new Map(
      usuarios.map((u: any) => [u.id, { nome: u.nomeCompleto }])
    );

    const comentariosComUsuario = comentarios.map((comentario: any) => ({
      ...comentario,
      usuario: userMap.get(comentario.userID) || null,
    }));

    return NextResponse.json(comentariosComUsuario);
  } catch (err) {
    console.error("Erro ao listar comentários:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
