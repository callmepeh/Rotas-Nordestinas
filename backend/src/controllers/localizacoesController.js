const supabase = require("../database/supabaseClient.js");

// GET /localizacoes/estados
exports.listarEstados = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("estados")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error("Erro ao listar estados:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// GET /localizacoes/estados/:estadoID/cidades
exports.listarCidadesPorEstado = async (req, res) => {
  try {
    const { estadoID } = req.params;

    const { data, error } = await supabase
      .from("cidades")
      .select("id, nomeCidade, url_imagem, latitude, longitude")
      .eq("estadoID", estadoID)
      .order("nomeCidade", { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error("Erro ao listar cidades por estado:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// GET /localizacoes/estados/:sigla
exports.buscarEstadoPorSigla = async (req, res) => {
  try {
    const { sigla } = req.params;

    const { data, error } = await supabase
      .from("estados")
      .select("*")
      .ilike("sigla", sigla)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Estado não encontrado." });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    console.error("Erro ao buscar estado por sigla:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};
