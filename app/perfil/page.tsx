"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

const PerfilPage = () => {
  const { user } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const [nome, setNome] = useState(user?.nomeCompleto || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [dataNasc, setDataNasc] = useState(user?.dataNascimento || "");
  const [estado, setEstado] = useState(user?.siglaEstado || "");
  const [cidade, setCidade] = useState(user?.nomeCidade || "");
  const [estados, setEstados] = useState<{ sigla: string; nome: string }[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
        );
        const data = await res.json();
        setEstados(data);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    if (!estado) return;
    const fetchCidades = async () => {
      try {
        const res = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`
        );
        const data = await res.json();
        setCidades(data.map((city: any) => city.nome));
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
      }
    };
    fetchCidades();
  }, [estado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    const formatDateToISO = (date: string) => {
      const [dia, mes, ano] = date.split("/");
      return `${ano}-${mes}-${dia}`;
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/auth/update/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "update_profile",
          nomeCompleto: nome,
          telefone,
          dataNascimento: formatDateToISO(dataNasc),
          siglaEstado: estado,
          nomeCidade: cidade,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Perfil atualizado com sucesso!");
      } else {
        alert(result.error || "Erro ao atualizar perfil.");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro desconhecido no servidor.");
    }
  };

  return (
    <div className="perfil-page-wrapper">
      <Navbar />
      <h2 className="perfil-title">Perfil</h2>

      <form className="perfil-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h3>Informações pessoais</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Data de nascimento</label>
              <input
                type="text"
                value={dataNasc}
                onChange={(e) => setDataNasc(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3>Informações de localização</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Estado</label>
              <select
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value);
                  setCidade("");
                }}
              >
                <option value="">Selecione o Estado</option>
                {estados.map((uf) => (
                  <option key={uf.sigla} value={uf.sigla}>
                    {uf.nome} ({uf.sigla})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                disabled={!estado}
              >
                <option value="">
                  {estado ? "Selecione a cidade" : "Escolha um estado"}
                </option>
                {cidades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="save-button">
            Salvar
          </button>
        </div>
      </form>

      <style>{`
        .perfil-page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .perfil-title {
          text-align: center;
          color: #333;
          font-size: 28px;
          margin: 40px 0;
        }
        .perfil-form {
          max-width: 600px;
          margin: 0 auto 60px;
          padding: 0 20px;
          flex: 1;
        }
        .perfil-form .form-section {
          background: #fff;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .perfil-form .form-section h3 {
          margin: 0 0 20px;
          color: #333;
          font-size: 18px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--cor-primaria, #eb662b);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 15px;
        }
        .form-row:last-child {
          margin-bottom: 0;
        }
        .perfil-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .perfil-form .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #555;
        }
        .perfil-form .form-group input,
        .perfil-form .form-group select {
          padding: 12px;
          border: 2px solid var(--cor-cinza-principal, #e9e9e9);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .perfil-form .form-group input:focus,
        .perfil-form .form-group select:focus {
          border-color: var(--cor-primaria, #eb662b);
        }
        .form-actions {
          text-align: center;
          margin-top: 20px;
        }
        .save-button {
          padding: 14px 40px;
          background: var(--cor-primaria, #eb662b);
          color: #fff;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s;
        }
        .save-button:hover {
          background: var(--cor-hover, #d84606);
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default PerfilPage;
