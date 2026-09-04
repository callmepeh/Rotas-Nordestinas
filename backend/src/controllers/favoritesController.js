const supabase = require("../database/supabaseClient.js");

exports.adicionarFavorito = async (req, res) => {
  try {
    const { userid, cidadeID } = req.body;

    const { data, error } = await supabase
      .from("favoritos")
      .insert([{ userid, cidadeID }])
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
    const { userid, cidadeID } = req.body;

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("userid", userid)
      .eq("cidadeid", cidadeID);

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

    const { data, error } = await supabase
      .from("favoritos")
      .select(`
        id,
        cidadeID,
        cidades (
          nomecidade,
          url_imagem
        )
      `)
      .eq("userid", userid);

    if (error) return res.status(400).json({ error: error.message });

    const favoritosFormatados = data.map(fav => ({
      id: fav.id,
      rotaID: fav.cidadeID,
      nome_rota: fav.cidades?.nomecidade ?? "",
      cidade: fav.cidades?.nomecidade ?? "",
      urlImagem: fav.cidades?.url_imagem ?? ""
    }));

    return res.json(favoritosFormatados);

  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};
