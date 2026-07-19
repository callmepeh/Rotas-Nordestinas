import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cidadeId: string }> }
) {
  try {
    const { cidadeId } = await params;

    const { data, error } = await supabase
      .from("Pontos_Turisticos")
      .select("*")
      .eq("cidadeID", cidadeId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro ao listar pontos turísticos:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
