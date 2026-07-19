import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const cidadeSelect = `
  id,
  nomeCidade,
  url_imagem,
  descricao,
  latitude,
  longitude,
  estados:estadoID (
    id,
    nome,
    sigla
  ),
  usuario:userID (
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
      .from("Cidades")
      .select(cidadeSelect)
      .ilike("nomeCidade", `%${nome}%`);

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
