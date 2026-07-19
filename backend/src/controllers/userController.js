const supabase = require("../database/supabaseClient.js");

// GET /usuarios/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // Se o usuário não for encontrado, o Supabase retorna um erro. Queremos enviar um 404.
      if (error.code === 'PGRST116') {
          return res.status(404).json({ error: "Usuário não encontrado." });
      }
      return res.status(400).json({ error: error.message });
    }

    if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// POST /usuarios
exports.createUser = async (req, res) => {
  try {
    const { id, nome, email } = req.body;

    if (!id || !nome || !email) {
      return res.status(400).json({ error: "ID, nome e email são obrigatórios." });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([{ id, nome, email, role: "user" }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// GET /usuarios
exports.listarTodos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, nomeCompleto, funcao, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// PUT /usuarios/:id
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar." });
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Usuário não encontrado." });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// DELETE /usuarios/:id
exports.deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: "Usuário removido com sucesso." });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};