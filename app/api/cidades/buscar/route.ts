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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nome = searchParams.get("nome");

    if (!nome) {
      return NextResponse.json(
        { error: "Parâmetro 'nome' é obrigatório." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("cidades")
      .select(cidadeSelect)
      .ilike("nomecidade", `%${nome}%`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao buscar por nome:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
