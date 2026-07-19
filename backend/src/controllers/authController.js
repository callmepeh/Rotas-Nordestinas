const supabase = require("../database/supabaseClient.js");

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { nomeCompleto, email, senha } = req.body;

    if (!nomeCompleto || !email || !senha) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
    }

    console.log("📩 Recebido no backend:", req.body);
    console.log("🟦 Criando usuário no Supabase Auth...");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nomeCompleto },
        emailRedirectTo: "http://localhost:3000/login",
      },
    });

    if (authError) {
      console.log("❌ Erro Supabase Auth:", authError);
      return res.status(400).json({ error: authError.message });
    }

    console.log("🟩 Usuário criado no Auth:", authData);

    const userId = authData.user?.id;

    if (!userId) {
      return res.status(400).json({
        error: "Erro ao obter o ID do usuário. Verifique o Supabase.",
      });
    }

    console.log("🟦 Inserindo usuário na tabela Users...");

    const { error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          email,
          nomeCompleto,   // agora o nome da coluna está correto
          funcao: "usuario",
        },
      ]);

    if (insertError) {
      console.log("❌ Erro ao inserir no Users:", insertError);
      return res.status(400).json({ error: insertError.message });
    }

    return res.status(201).json({
      message: "Cadastro criado! Verifique seu e-mail para confirmar o acesso.",
    });

  } catch (err) {
    console.log("❌ ERRO GERAL NO BACKEND:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};


// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    console.log("Dados recebidos no login:", req.body);

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

    console.log("loginData:", loginData);
    console.log("loginError:", loginError);

    if (loginError || !loginData?.user) {
  return res.status(401).json({ error: "Credenciais inválidas." });
}
    const userId = loginData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("Dados do usuário:", profile);
    console.log("profileError:", profileError);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.json({
      message: "Login realizado com sucesso.",
      token: loginData.session.access_token,
      user: profile,
    });
  } catch (err) {
    console.log("Erro geral no login:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};


// GET /auth/me
exports.me = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(404).json({ error: error.message });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao carregar perfil." });
  }
};



exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({ error: "Não autorizado." });
    }

    const { action, ...updates } = req.body;
    let novaFuncao = undefined;
    let mensagem = "";

    // 🔹 Pedido para virar colaborador
    if (action === "request_collaborator") {
      novaFuncao = "colaborador_pendente";
      mensagem = "Sua solicitação foi enviada e está aguardando análise!";
    } 
    
    // 🔹 Atualização de perfil
    else if (action === "update_profile") {
      mensagem = "Perfil atualizado com sucesso!";
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        ...(novaFuncao && { funcao: novaFuncao })
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: mensagem,
      user: data,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
};
