const supabase = require("../database/supabaseClient.js");

// =========================
// GET /cidades
// =========================
exports.listarTodas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cidades")
      .select(`
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
`)


    if (error) {
      console.error("Erro Supabase:", error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);

  } catch (err) {
    console.error("Erro interno ao listar cidades:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// =========================
// GET /cidades/buscar?nome=
// =========================
exports.buscarPorNome = async (req, res) => {
  try {
    const nome = req.query.nome;

    const { data, error } = await supabase
      .from("cidades")
      .select(`
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
`)

      .ilike("nomeCidade", `%${nome}%`);

    if (error) return res.status(400).json({ error: error.message });

    return res.json(data);

  } catch (err) {
    console.error("Erro ao buscar por nome:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// =========================
// GET /cidades/estado/:estadoID
// =========================
exports.listarPorEstado = async (req, res) => {
  try {
    const { estadoID } = req.params;

    const { data, error } = await supabase
      .from("cidades")
      .select(`
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
`)

      .eq("estadoID", estadoID);

    if (error) return res.status(500).json({ error: error.message });

    return res.json(data);

  } catch (err) {
    console.error("Erro ao listar por estado:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// =========================
// GET /cidades/:id
// =========================
exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: cidade, error } = await supabase
      .from("cidades")
      .select(`
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
`)

      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro Supabase ao buscar cidade:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!cidade) {
      return res.status(404).json({ error: "Cidade não encontrada." });
    }

    return res.json(cidade);

  } catch (err) {
    console.error("Erro ao buscar cidade por ID:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
