import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const cidadeSelect = `
  id,
  nomecidade,
  url_imagem,
  descricao,
  latitude,
  longitude,
  estados:estadoid (
    id,
    nome,
    sigla
  ),
  usuario:userid (
    id,
    nomeCompleto
  )
`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: cidade, error } = await supabase
      .from("cidades")
      .select(cidadeSelect)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!cidade) {
      return NextResponse.json(
        { error: "Cidade não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(cidade);
  } catch (err) {
    console.error("Erro ao buscar cidade por ID:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
