"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";

const LoginForm = () => {
  const { login: loginContext } = useAuth();
  const { closeModal } = useUI();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const success = await loginContext(email, password);
      
      if (success) {
        closeModal();
      } else {
        setErrorMsg("Credenciais inválidas. Tente novamente.");
      }
    } catch (error: any) {
      setErrorMsg("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const commonInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px 15px",
    border: "1px solid var(--cor-primaria, #eb662b)",
    borderRadius: "25px",
    boxSizing: "border-box",
    fontSize: "16px",
    outline: "none",
    color: "#333",
    transition: "border-color 0.2s",
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px 10px",
    background: "var(--cor-fundo, #fff)",
    border: "1px solid var(--cor-primaria, #eb662b)",
    borderRadius: "25px",
    color: "var(--cor-primaria, #eb662b)",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
    transition: "background 0.2s, color 0.2s",
    userSelect: "none",
  };

  const loginButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    background: isPrimaryHovered ? "var(--cor-hover, #d84606)" : "var(--cor-primaria, #eb662b)",
    color: "var(--cor-fundo, #fff)",
    border: `1px solid ${
      isPrimaryHovered ? "var(--cor-hover, #d84606)" : "var(--cor-primaria, #eb662b)"
    }`,
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div
      style={{
        padding: "20px",
        position: "relative",
        maxWidth: "400px",
        margin: "auto",
        backgroundColor: "var(--cor-fundo, #fff)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "20px",
          lineHeight: "1.2",
        }}
      >
        Bem-vindo de volta a <br />
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={commonInputStyle}
            required
          />
        </div>

        <div style={{ marginBottom: "20px", position: "relative" }}>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={commonInputStyle}
            required
          />
        </div>

        <button
          type="submit"
          style={loginButtonStyle}
          disabled={loading}
          onMouseEnter={() => setIsPrimaryHovered(true)}
          onMouseLeave={() => setIsPrimaryHovered(false)}
        >
          {loading ? "Entrando..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
