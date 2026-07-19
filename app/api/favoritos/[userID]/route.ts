import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params;
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
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("Favoritos")
      .select(
        `
        id,
        cidadeID,
        Cidades (
          id,
          nomeCidade,
          url_imagem
        )
      `
      )
      .eq("userID", userID);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const favoritosFormatados = (data || []).map((fav: any) => ({
      id: fav.id,
      cidadeID: fav.cidadeID,
      nomeCidade: fav.Cidades?.nomeCidade ?? "",
      url_imagem: fav.Cidades?.url_imagem ?? "",
    }));

    return NextResponse.json(favoritosFormatados);
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
