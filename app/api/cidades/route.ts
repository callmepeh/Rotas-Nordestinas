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

export async function GET() {
  try {
    const { data, error } = await supabase.from("Cidades").select(cidadeSelect);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao listar cidades:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
