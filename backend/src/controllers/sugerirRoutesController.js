import supabase from "../config/supabaseClient.js";

export const sugerirRota = async (req, res) => {
  try {
    const userID = req.user.id; // vem do token JWT

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
    } = req.body;

    // 🔥 Validação mínima
    if (!estado || !nomeCidade) {
      return res.status(400).json({
        error: "Estado e cidade são obrigatórios.",
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Latitude e longitude são obrigatórias.",
      });
    }

    // 🔥 Preparar dados para a tabela
    const payload = {
      userID,
      estado,
      nomeCidade,
      imagemCapa: imagemCapa || null,
      descricaoCidade: descricaoCidade || null,

      // JSON armazenado como string
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

    // 🔥 Inserir no banco
    const { error } = await supabase
      .from("sugestoes_de_rota")
      .insert([payload]);

    if (error) {
      console.error("ERRO SUPABASE AO INSERIR:", error);
      return res.status(400).json({ error: "Erro ao enviar sugestão" });
    }

    return res.status(201).json({
      message: "Sugestão enviada com sucesso!",
      data: payload,
    });

  } catch (err) {
    console.error("ERRO AO SUGERIR ROTA:", err);
    return res.status(500).json({
      error: "Erro interno no servidor",
    });
  }
};
