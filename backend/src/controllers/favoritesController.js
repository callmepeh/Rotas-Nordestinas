const supabase = require("../database/supabaseClient.js");

exports.adicionarFavorito = async (req, res) => {
  try {
    const { userID, cidadeID } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    const supabase = supabaseWithAuth(token);

    const { data, error } = await supabase
      .from("favoritos")
      .insert([{ userID, cidadeID }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Favorito adicionado", data });

  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};


exports.removerFavorito = async (req, res) => {
  try {
    const { userID, cidadeID } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    const supabase = supabaseWithAuth(token);

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("userID", userID)
      .eq("cidadeID", cidadeID);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Favorito removido" });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};


exports.listarFavoritos = async (req, res) => {
  try {
    const { userID } = req.params;
    const token = req.headers.authorization?.replace("Bearer ", "");

    const supabase = supabaseWithAuth(token);

    const { data, error } = await supabase
      .from("favoritos")
      .select(`
        id,
        cidadeID,
        Cidades (
          nome,
          cidade,
          urlImagem
        )
      `)
      .eq("userID", userID);

    if (error) return res.status(400).json({ error: error.message });

    const favoritosFormatados = data.map(fav => ({
      id: fav.id,
      rotaID: fav.cidadeID,
      nome_rota: fav.Cidades?.nome ?? "",
      cidade: fav.Cidades?.cidade ?? "",
      urlImagem: fav.Cidades?.urlImagem ?? ""
    }));

    return res.json(favoritosFormatados);

  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};
