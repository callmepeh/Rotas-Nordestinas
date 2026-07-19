"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import ImageUpload from "@/components/forms/ImageUpload";
import { FaPlusCircle, FaTrashAlt, FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ComoChegarItem {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
}

interface PontoTuristicoItem {
  id: number;
  nome: string;
  descricao: string;
  url_imagem?: string;
}

interface AtividadeItem {
  id: number;
  nome: string;
  descricao: string;
  url_imagem?: string;
}

interface DicaLocalItem {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  url_imagem?: string;
}

const SugerirRotaPage: React.FC = () => {
  const [estados, setEstados] = useState<any[]>([]);
  const [cidades, setCidades] = useState<any[]>([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [comoChegarItens, setComoChegarItens] = useState<ComoChegarItem[]>([
    { id: Date.now(), nome: "", categoria: "", descricao: "" },
  ]);

  const [pontosTuristicos, setPontosTuristicos] = useState<PontoTuristicoItem[]>(
    [{ id: Date.now(), nome: "", descricao: "" }]
  );

  const [atividades, setAtividades] = useState<AtividadeItem[]>([
    { id: Date.now(), nome: "", descricao: "" },
  ]);

  const [dicasLocais, setDicasLocais] = useState<DicaLocalItem[]>([
    { id: Date.now(), nome: "", categoria: "", descricao: "" },
  ]);

  // Descrição da cidade
  const [descricaoCidade, setDescricaoCidade] = useState("");
  
  // Imagem de capa da cidade
  const [imagemCapaUrl, setImagemCapaUrl] = useState<string>("");
  
  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const { token } = useAuth();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((res) => res.json())
      .then((data) => setEstados(data));
  }, []);

  useEffect(() => {
    if (!estadoSelecionado) return;
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`
    )
      .then((res) => res.json())
      .then((data) => setCidades(data));
  }, [estadoSelecionado]);

  useEffect(() => {
    if (!cidadeSelecionada || !estadoSelecionado) return;
    const cidadeObj = cidades.find((c) => c.id == cidadeSelecionada);
    if (!cidadeObj) return;
    const cidadeNome = cidadeObj.nome;
    const estadoSigla = estados.find((e) => e.id == estadoSelecionado)?.sigla;

    fetch(
      `https://nominatim.openstreetmap.org/search?city=${cidadeNome}&state=${estadoSigla}&country=Brazil&format=json&limit=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.length > 0) {
          setLatitude(data[0].lat);
          setLongitude(data[0].lon);
        }
      });
  }, [cidadeSelecionada]);

  const addItem = <T extends { id: number }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    newItem: Omit<T, "id">
  ) => {
    setter((prev) => [...prev, { ...newItem, id: Date.now() } as T]);
  };

  const removeItem = <T extends { id: number }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: number
  ) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInputChange = <T extends { id: number }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [name]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // Validação básica
    if (!estadoSelecionado || !cidadeSelecionada) {
      setSubmitStatus({
        type: "error",
        message: "Selecione um estado e uma cidade.",
      });
      setSubmitting(false);
      return;
    }

    if (!token) {
      setSubmitStatus({
        type: "error",
        message: "Você precisa estar logado para sugerir uma rota.",
      });
      setSubmitting(false);
      return;
    }

    try {
      // Converte IDs do IBGE para nomes
      const estadoObj = estados.find((e) => e.id == estadoSelecionado);
      const cidadeObj = cidades.find((c) => c.id == cidadeSelecionada);
      const estadoNome = estadoObj?.nome || "";
      const cidadeNome = cidadeObj?.nome || "";

      const payload = {
        estado: estadoNome,
        nomeCidade: cidadeNome,
        latitude,
        longitude,
        descricaoCidade: descricaoCidade || null,
        imagemCapa: imagemCapaUrl || null,
        comoChegar: comoChegarItens.filter((item) => item.nome.trim()),
        pontosTuristicos: pontosTuristicos
          .filter((item) => item.nome.trim())
          .map((item) => ({
            nome: item.nome,
            descricao: item.descricao,
            ...(item.url_imagem ? { url_imagem: item.url_imagem } : {}),
          })),
        atividades: atividades
          .filter((item) => item.nome.trim())
          .map((item) => ({
            nome: item.nome,
            descricao: item.descricao,
            ...(item.url_imagem ? { url_imagem: item.url_imagem } : {}),
          })),
        dicas: dicasLocais
          .filter((item) => item.nome.trim())
          .map((item) => ({
            nome: item.nome,
            categoria: item.categoria,
            descricao: item.descricao,
            ...(item.url_imagem ? { url_imagem: item.url_imagem } : {}),
          })),
      };

      const response = await fetch(`${baseUrl}/api/sugerir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Sugestão enviada com sucesso! Agradecemos sua contribuição.",
        });

        // Reset form after success
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Erro ao enviar sugestão. Tente novamente.",
        });
      }
    } catch (err) {
      console.error("Erro ao enviar sugestão:", err);
      setSubmitStatus({
        type: "error",
        message: "Erro de conexão. Verifique sua internet e tente novamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="sugerir-rota-page">
        <Container>
          <h1 className="main-title">Sugestão de Rotas</h1>
          <form className="suggestion-form" onSubmit={handleSubmit}>
            {submitStatus.type && (
              <div
                className={`submit-feedback ${
                  submitStatus.type === "success"
                    ? "submit-feedback-success"
                    : "submit-feedback-error"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <FaCheckCircle size={24} />
                ) : (
                  <FaExclamationCircle size={24} />
                )}
                <span>{submitStatus.message}</span>
              </div>
            )}

            <div className="form-section">
              <h2 className="section-title">Informações Iniciais</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    value={estadoSelecionado}
                    onChange={(e) => {
                      setEstadoSelecionado(e.target.value);
                      setCidadeSelecionada("");
                    }}
                  >
                    <option value="">Selecionar o Estado</option>
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cidade">Cidade</label>
                  <select
                    id="cidade"
                    value={cidadeSelecionada}
                    onChange={(e) => setCidadeSelecionada(e.target.value)}
                  >
                    <option value="">Selecionar a Cidade</option>
                    {cidades.map((cidade) => (
                      <option key={cidade.id} value={cidade.id}>
                        {cidade.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="text" value={latitude} readOnly />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="text" value={longitude} readOnly />
                </div>
              </div>
              <div className="form-group">
                <label>Descrição da Cidade</label>
                <textarea
                  value={descricaoCidade}
                  onChange={(e) => setDescricaoCidade(e.target.value)}
                  placeholder="Descreva brevemente a cidade, sua importância turística e o que a torna especial..."
                  rows={4}
                />
              </div>
              <ImageUpload
                onUploadComplete={(url) => setImagemCapaUrl(url)}
                folder="cidades"
              />
            </div>

            {/* Como Chegar */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Como chegar</h2>
                <button
                  type="button"
                  className="add-button"
                  onClick={() =>
                    addItem(setComoChegarItens, {
                      nome: "",
                      categoria: "",
                      descricao: "",
                    })
                  }
                >
                  <FaPlusCircle />
                </button>
              </div>
              {comoChegarItens.map((item) => (
                <div key={item.id} className="dynamic-card-item">
                  {comoChegarItens.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeItem(setComoChegarItens, item.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        name="nome"
                        value={item.nome}
                        onChange={(e) =>
                          handleInputChange(setComoChegarItens, item.id, e)
                        }
                        placeholder="Ex: Saindo de Teresina"
                      />
                    </div>
                    <div className="form-group">
                      <label>Categoria</label>
                      <input
                        type="text"
                        name="categoria"
                        value={item.categoria}
                        onChange={(e) =>
                          handleInputChange(setComoChegarItens, item.id, e)
                        }
                        placeholder="Ex: De carro, Ônibus, Trilha"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Breve Descrição</label>
                    <textarea
                      name="descricao"
                      value={item.descricao}
                      onChange={(e) =>
                        handleInputChange(setComoChegarItens, item.id, e)
                      }
                      placeholder="Descreva aqui os detalhes de como chegar ao local"
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pontos Turísticos */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Pontos Turísticos</h2>
                <button
                  type="button"
                  className="add-button"
                  onClick={() =>
                    addItem(setPontosTuristicos, { nome: "", descricao: "" })
                  }
                >
                  <FaPlusCircle />
                </button>
              </div>
              {pontosTuristicos.map((item) => (
                <div key={item.id} className="dynamic-card-item">
                  {pontosTuristicos.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeItem(setPontosTuristicos, item.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                  <div className="form-group">
                    <label>Nome</label>
                    <input
                      type="text"
                      name="nome"
                      value={item.nome}
                      onChange={(e) =>
                        handleInputChange(setPontosTuristicos, item.id, e)
                      }
                      placeholder="Ex: Mirante do Cruzeiro"
                    />
                  </div>
                  <ImageUpload
                    onUploadComplete={(url) => {
                      setPontosTuristicos((prev) =>
                        prev.map((pt) =>
                          pt.id === item.id
                            ? { ...pt, url_imagem: url }
                            : pt
                        )
                      );
                    }}
                    folder="pontos-turisticos"
                  />
                  <div className="form-group">
                    <label>Breve Descrição</label>
                    <textarea
                      name="descricao"
                      value={item.descricao}
                      onChange={(e) =>
                        handleInputChange(setPontosTuristicos, item.id, e)
                      }
                      placeholder="Descreva aqui os detalhes sobre o ponto turístico"
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Atividades */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Atividades Sugeridas</h2>
                <button
                  type="button"
                  className="add-button"
                  onClick={() =>
                    addItem(setAtividades, { nome: "", descricao: "" })
                  }
                >
                  <FaPlusCircle />
                </button>
              </div>
              {atividades.map((item) => (
                <div key={item.id} className="dynamic-card-item">
                  {atividades.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeItem(setAtividades, item.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                  <div className="form-group">
                    <label>Nome</label>
                    <input
                      type="text"
                      name="nome"
                      value={item.nome}
                      onChange={(e) =>
                        handleInputChange(setAtividades, item.id, e)
                      }
                      placeholder="Ex: Trilha da cachoeira"
                    />
                  </div>
                  <ImageUpload
                    onUploadComplete={(url) => {
                      setAtividades((prev) =>
                        prev.map((a) =>
                          a.id === item.id
                            ? { ...a, url_imagem: url }
                            : a
                        )
                      );
                    }}
                    folder="atividades"
                  />
                  <div className="form-group">
                    <label>Breve Descrição</label>
                    <textarea
                      name="descricao"
                      value={item.descricao}
                      onChange={(e) =>
                        handleInputChange(setAtividades, item.id, e)
                      }
                      placeholder="Descreva aqui os detalhes sobre a atividade"
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Dicas */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Dicas do local</h2>
                <button
                  type="button"
                  className="add-button"
                  onClick={() =>
                    addItem(setDicasLocais, {
                      nome: "",
                      categoria: "",
                      descricao: "",
                    })
                  }
                >
                  <FaPlusCircle />
                </button>
              </div>
              {dicasLocais.map((item) => (
                <div key={item.id} className="dynamic-card-item">
                  {dicasLocais.length > 1 && (
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeItem(setDicasLocais, item.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        name="nome"
                        value={item.nome}
                        onChange={(e) =>
                          handleInputChange(setDicasLocais, item.id, e)
                        }
                        placeholder="Ex: Melhor restaurante"
                      />
                    </div>
                    <div className="form-group">
                      <label>Categoria</label>
                      <input
                        type="text"
                        name="categoria"
                        value={item.categoria}
                        onChange={(e) =>
                          handleInputChange(setDicasLocais, item.id, e)
                        }
                        placeholder="Ex: Restaurante, Bar, Loja"
                      />
                    </div>
                  </div>
                  <ImageUpload
                    onUploadComplete={(url) => {
                      setDicasLocais((prev) =>
                        prev.map((d) =>
                          d.id === item.id
                            ? { ...d, url_imagem: url }
                            : d
                        )
                      );
                    }}
                    folder="dicas"
                  />
                  <div className="form-group">
                    <label>Breve Descrição</label>
                    <textarea
                      name="descricao"
                      value={item.descricao}
                      onChange={(e) =>
                        handleInputChange(setDicasLocais, item.id, e)
                      }
                      placeholder="Descreva aqui a dica"
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </button>
            </div>
          </form>
        </Container>
      </main>

      <style>{`
        .sugerir-rota-page {
          padding: 40px 0;
        }
        .submit-feedback {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          font-size: 15px;
          font-weight: 500;
        }
        .submit-feedback-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .submit-feedback-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
          vertical-align: middle;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .main-title {
          text-align: center;
          color: #333;
          font-size: 32px;
          margin-bottom: 40px;
        }
        .suggestion-form {
          max-width: 800px;
          margin: 0 auto;
        }
        .form-section {
          background: #fff;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .section-title {
          color: #333;
          font-size: 20px;
          margin: 0;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--cor-primaria, #eb662b);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #555;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px;
          border: 2px solid var(--cor-cinza-principal, #e9e9e9);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--cor-primaria, #eb662b);
        }
        .dynamic-card-item {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
          position: relative;
        }
        .add-button {
          background: none;
          border: none;
          color: var(--cor-primaria, #eb662b);
          font-size: 24px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .add-button:hover {
          color: var(--cor-hover, #d84606);
        }
        .remove-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: var(--cor-erro, #dc3545);
          cursor: pointer;
          font-size: 16px;
        }
        .form-actions {
          text-align: center;
        }
        .submit-button {
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
        .submit-button:hover {
          background: var(--cor-hover, #d84606);
        }
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Footer />
    </>
  );
};

export default SugerirRotaPage;
