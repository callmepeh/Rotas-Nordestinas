import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
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
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 401 }
      );
    }

    const userID = user.id;

    const {
      estado,
      nomeCidade,
      latitude,
      longitude,
      imagemCapa,
      descricaoCidade,
      comoChegar,
      pontosTuristicos,
      atividades,
      dicas,
    } = await req.json();

    if (!estado || !nomeCidade) {
      return NextResponse.json(
        { error: "Estado e cidade são obrigatórios." },
        { status: 400 }
      );
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude e longitude são obrigatórias." },
        { status: 400 }
      );
    }

    const payload = {
      userID,
      estado,
      nomeCidade,
      imagemCapa: imagemCapa || null,
      descricaoCidade: descricaoCidade || null,
      comoChegar: JSON.stringify(comoChegar || []),
      pontosTuristicos: JSON.stringify(pontosTuristicos || []),
      atividades: JSON.stringify(atividades || []),
      dicas: JSON.stringify(dicas || []),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      dataSubmissao: new Date().toISOString(),
      status: "pendente",
      obsAdmin: "",
      idAdmin: null,
      cidadeID: null,
    };

    const { error } = await supabase.from("Sugestoes_de_Rota").insert([payload]);

    if (error) {
      console.error("ERRO SUPABASE AO INSERIR:", error);
      return NextResponse.json(
        { error: "Erro ao enviar sugestão" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Sugestão enviada com sucesso!", data: payload },
      { status: 201 }
    );
  } catch (err) {
    console.error("ERRO AO SUGERIR ROTA:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
