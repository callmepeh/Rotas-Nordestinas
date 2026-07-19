const supabase = require("../database/supabaseClient.js");

// Lista todas as atividades de uma cidade
exports.listarPorCidade = async (req, res) => {
  try {
    const { cidadeId } = req.params;

    const { data, error } = await supabase
      .from("atividades")
      .select("*")
      .eq("cidadeID", cidadeId);

    if (error) return res.status(400).json({ error: error.message });

    return res.json(data);
  } catch (err) {
    console.error("Erro ao listar atividades:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
