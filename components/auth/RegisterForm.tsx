"use client";

import React, { useState } from "react";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.senha !== formData.confirmarSenha) {
      setErrorMsg("As senhas não coincidem!");
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto: formData.nome,
          email: formData.email,
          senha: formData.senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowVerificationPopup(true);
      } else {
        setErrorMsg(data.error || "Erro ao cadastrar");
      }
    } catch (err: any) {
      setErrorMsg("Erro ao cadastrar. Tente novamente.");
    }
  };

  const commonInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px 15px",
    border: "1px solid var(--cor-primaria, #eb662b)",
    borderRadius: "25px",
    fontSize: "16px",
    outline: "none",
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px 10px",
    background: isPrimaryHovered ? "var(--cor-hover, #d84606)" : "var(--cor-primaria, #eb662b)",
    border: "none",
    borderRadius: "25px",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
    transition: "0.2s",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      {showVerificationPopup && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "350px",
              textAlign: "center",
              boxShadow: "0 4px 25px rgba(0,0,0,0.25)",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Verifique seu e-mail</h3>
            <p>Enviamos um link de confirmação para:</p>
            <strong>{formData.email}</strong>
            <p style={{ marginTop: "10px" }}>
              Após confirmar, volte e faça login.
            </p>

            <button
              onClick={() => setShowVerificationPopup(false)}
              style={{
                marginTop: "20px",
                background: "var(--cor-primaria, #eb662b)",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        Bem-vindo a <br />
        rotas nordestinas
      </h2>

      {errorMsg && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
          {errorMsg}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <input
            name="nome"
            type="text"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            style={commonInputStyle}
            required
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={commonInputStyle}
            required
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleChange}
            style={commonInputStyle}
            required
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            name="confirmarSenha"
            type="password"
            placeholder="Confirmar senha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            style={commonInputStyle}
            required
          />
        </div>

        <button
          type="submit"
          style={primaryButtonStyle}
          onMouseEnter={() => setIsPrimaryHovered(true)}
          onMouseLeave={() => setIsPrimaryHovered(false)}
        >
          Criar conta
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
