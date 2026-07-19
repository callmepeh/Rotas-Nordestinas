const supabase = require("../database/supabaseClient");

// Adicionar comentário
exports.adicionar = async (req, res) => {
  try {
    const { userID, cidadeID, mensagem } = req.body;

    if (!userID || !cidadeID) {
      return res.status(400).json({ error: "userID e cidadeID são obrigatórios." });
    }

    const { data, error } = await supabase
      .from("comentarios")
      .insert([
        {
          userID: userID,
          cidadeID: cidadeID,
          mensagem,
        },
      ])
      .select();

    if (error) {
      console.error("Erro Supabase ao adicionar comentário:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.json(data[0]);
  } catch (err) {
    console.error("Erro ao adicionar comentário:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// Listar comentários por cidade
exports.listarPorCidade = async (req, res) => {
  try {
    const { cidadeId } = req.params;

    const { data: comentarios, error: comentariosError } = await supabase
      .from("comentarios")
      .select("*")
      .eq("cidadeID", cidadeId)
      .order("created_at", { ascending: false });

    if (comentariosError) {
      console.error("Erro Supabase ao listar comentários:", comentariosError);
      return res.status(400).json({ error: comentariosError.message });
    }

    console.log("Comentários recebidos do Supabase:", comentarios);


    if (!comentarios || comentarios.length === 0) {
      return res.json([]);
    }

    const userIds = [...new Set(comentarios.map((c) => c.userID).filter(id => id))];

    console.log("IDs de usuário extraídos:", userIds);


    if (userIds.length === 0) {
      const comentariosSemUsuario = comentarios.map(c => ({ ...c, usuario: null }));
      console.log("Nenhum ID de usuário encontrado, retornando comentários sem usuário:", comentariosSemUsuario);
      return res.json(comentariosSemUsuario);
    }

    const { data: usuarios, error: usuariosError } = await supabase
      .from("users")
      .select("id, nomeCompleto")
      .in("id", userIds);

    if (usuariosError) {
      console.error("Erro Supabase ao buscar usuários:", usuariosError);
      const comentariosComUsuarioNull = comentarios.map(c => ({ ...c, usuario: null }));
      console.log("Erro ao buscar usuários, retornando comentários com usuário nulo:", comentariosComUsuarioNull);
      return res.json(comentariosComUsuarioNull);
    }

    console.log("Usuários recebidos do Supabase:", usuarios);


    const userMap = new Map(usuarios.map((u) => [u.id, { nome: u.nomeCompleto }])); console.log("Mapa de usuários criado:", userMap);


    const comentariosComUsuario = comentarios.map((comentario) => ({
      ...comentario,
      usuario: userMap.get(comentario.userID) || null,
    }));

    console.log("Comentários finais com dados do usuário:", comentariosComUsuario);


    return res.json(comentariosComUsuario);
  } catch (err) {
    console.error("Erro ao listar comentários:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// EDITAR comentário
exports.editar = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensagem } = req.body;

    const { data, error } = await supabase
      .from("comentarios")
      .update({ mensagem })
      .eq("id", id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    if (!data || data.length === 0)
      return res.status(404).json({ error: "Comentário não encontrado." });

    return res.json(data[0]);
  } catch (err) {
    console.error("Erro ao editar comentário:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// DELETAR comentário
exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("comentarios")
      .delete()
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: "Comentário removido com sucesso." });
  } catch (err) {
    console.error("Erro ao deletar comentário:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
