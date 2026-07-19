const supabase = require("../database/supabaseClient.js");

// Lista todas as dicas de uma cidade
exports.listarPorCidade = async (req, res) => {
  try {
    const { cidadeId } = req.params;

    const { data, error } = await supabase
      .from("dicas")
      .select("*")
      .eq("cidadeID", cidadeId);

    if (error) return res.status(400).json({ error: error.message });

    return res.json(data);
  } catch (err) {
    console.error("Erro ao listar dicas:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};