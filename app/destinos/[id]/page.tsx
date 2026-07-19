"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import Container from "@/components/layout/Container";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FaUserCircle } from "react-icons/fa";
import InfoCarousel from "@/components/destinations/InfoCarousel";
import { LeafletMap } from "@/components/map/MapLeaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/context/AuthContext";
import { FaRegEdit } from "react-icons/fa";
import { GoHeart, GoHeartFill } from "react-icons/go";
import type { InfoItem } from "@/components/destinations/GeneralCard";

interface Destino {
  id: string;
  nomeCidade: string;
  url_imagem: string;
  descricao?: string;
  estados?: {
    nome: string;
    sigla: string;
  };
  latitude?: number;
  longitude?: number;
  usuario?: {
    id: string;
    nomeCompleto: string;
  };
}

interface ComoChegarItem {
  id: number;
  tipo: string;
  titulo: string;
  descricao: string;
}

interface Comentario {
  id: number;
  mensagem: string;
  created_at: string;
  userID: string;
  usuario?: {
    nome: string;
  } | null;
}

const DestinationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [destino, setDestino] = useState<Destino | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [comoChegar, setComoChegar] = useState<ComoChegarItem[]>([]);
  const [pontosTuristicos, setPontosTuristicos] = useState<any[]>([]);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [dicas, setDicas] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(
        `${baseUrl}/api/comentarios/por-cidade/${id}`
      );
      const data = await response.json();
      setComentarios(data);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
    }
  }, [id, baseUrl]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (isAuthenticated && user && id) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${baseUrl}/api/favoritos/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          const favoriteIds = data.map(
            (fav: { cidadeID: number }) => fav.cidadeID
          );
          if (favoriteIds.includes(parseInt(id, 10))) {
            setIsFavorited(true);
          }
        } catch (err) {
          console.error("Erro ao verificar status de favorito:", err);
        }
      }
    };
    checkFavoriteStatus();
  }, [id, user, isAuthenticated, baseUrl]);

  useEffect(() => {
    async function fetchDestino() {
      if (!id) return;
      try {
        const [destinoRes, comoChegarRes, pontosRes, atividadesRes, dicasRes] =
          await Promise.all([
            fetch(`${baseUrl}/api/cidades/${id}`),
            fetch(`${baseUrl}/api/como-chegar/${id}`),
            fetch(`${baseUrl}/api/pontos/${id}`),
            fetch(`${baseUrl}/api/atividades/${id}`),
            fetch(`${baseUrl}/api/dicas/${id}`),
          ]);

        const destinoData = await destinoRes.json();
        setDestino(destinoData);

        if (comoChegarRes.ok) setComoChegar(await comoChegarRes.json());
        if (pontosRes.ok) setPontosTuristicos(await pontosRes.json());
        if (atividadesRes.ok) setAtividades(await atividadesRes.json());
        if (dicasRes.ok) setDicas(await dicasRes.json());

        await fetchComments();
      } catch (err) {
        console.error("Erro ao buscar destino:", err);
        setError("Destino não encontrado.");
      } finally {
        setLoading(false);
      }
    }

    fetchDestino();
  }, [id, fetchComments, baseUrl]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated || !user || !id) {
      alert("Você precisa estar logado para favoritar um destino.");
      return;
    }

    const token = localStorage.getItem("token");
    const cidadeID = parseInt(id, 10);
    const payload = { userID: user.id, cidadeID };

    try {
      if (isFavorited) {
        await fetch(`${baseUrl}/api/favoritos/remove`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        setIsFavorited(false);
      } else {
        await fetch(`${baseUrl}/api/favoritos/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Erro ao atualizar favorito:", err);
      alert("Não foi possível atualizar o status de favorito.");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user || !newCommentText.trim() || !id) {
      setCommentError(
        "Você precisa estar logado e o comentário não pode ser vazio."
      );
      return;
    }

    setCommentError("");
    const token = localStorage.getItem("token");

    try {
      await fetch(`${baseUrl}/api/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userID: user.id,
          cidadeID: parseInt(id, 10),
          mensagem: newCommentText,
        }),
      });

      setNewCommentText("");
      await fetchComments();
    } catch (err) {
      console.error("Erro ao adicionar comentário:", err);
      setCommentError("Erro ao adicionar comentário. Tente novamente.");
    }
  };

  const renderComoChegarItem = (item: ComoChegarItem) => (
    <div key={item.id} className="container-to-arrive">
      <div className="title">
        <h3>{item.titulo}</h3>
        <div className="icon-type">
          <span>{item.tipo}</span>
        </div>
      </div>
      <p>{item.descricao}</p>
    </div>
  );

  if (loading)
    return (
      <div>
        <Navbar />
        <div className="detail-container">
          <h2>Carregando destino...</h2>
        </div>
      </div>
    );

  if (error || !destino)
    return (
      <div>
        <Navbar />
        <div className="detail-container">
          <h2>{error || "Destino não encontrado!"}</h2>
        </div>
      </div>
    );

  return (
    <div>
      <Navbar />
      <div
        className="detail-hero"
        style={{ backgroundImage: `url(${destino.url_imagem})` }}
      >
        <h1>{destino.nomeCidade}</h1>
      </div>

      <div className="flex_area">
        <div style={{ width: "200px" }}>
          <p className="sugested_user">Rota sugerida por:</p>
          <div className="user">
            <FaUserCircle size={30} />
            <p>{destino.usuario?.nomeCompleto || "Usuário anônimo"}</p>
          </div>
        </div>
        <div className="icons">
          {isAuthenticated && (
            <div onClick={handleFavoriteClick} className="icons-favorite">
              {isFavorited ? <GoHeartFill size={30} /> : <GoHeart size={30} />}
            </div>
          )}
          {isAuthenticated && user?.funcao === "colaborador" && (
            <FaRegEdit size={28} />
          )}
        </div>
      </div>

      <Container>
        <main className="detail-container">
          <section className="description-section">
            <h2>Descrição</h2>
            <p>{destino.descricao}</p>
          </section>

          <div className="carousel-section">
            <InfoCarousel
              titulo="Pontos Turísticos"
              itens={pontosTuristicos.map(
                (pt): InfoItem => ({
                  id: String(pt.id),
                  imagem: pt.url_imagem,
                  nome: pt.titulo,
                  descricao: pt.descricao,
                })
              )}
            />

            <InfoCarousel
              titulo="Atividades"
              itens={atividades.map(
                (a): InfoItem => ({
                  id: String(a.id),
                  imagem: a.url_imagem,
                  nome: a.titulo,
                  descricao: a.descricao,
                })
              )}
            />

            <InfoCarousel
              titulo="Dicas"
              itens={dicas.map(
                (d): InfoItem => ({
                  id: String(d.id),
                  imagem: d.url_imagem,
                  nome: d.titulo,
                  descricao: d.descricao,
                })
              )}
            />
          </div>

          <div className="localization-grid">
            <section className="map-section">
              <h2>Destino</h2>
              {destino.latitude && destino.longitude ? (
                <LeafletMap
                  latitude={destino.latitude}
                  longitude={destino.longitude}
                  popupText={destino.nomeCidade}
                />
              ) : (
                <p>Carregando mapa...</p>
              )}
            </section>

            <section className="to-arrive">
              <h2>Como Chegar</h2>
              {comoChegar.map(renderComoChegarItem)}
            </section>
          </div>

          <section className="container_feedbacks">
            <h2>Feedbacks</h2>

            {isAuthenticated && user ? (
              <form onSubmit={handleCommentSubmit} className="commentForm">
                <textarea
                  className="commentInput"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Adicione seu comentário aqui..."
                  rows={4}
                  maxLength={500}
                />
                {commentError && (
                  <p className="commentError">{commentError}</p>
                )}
                <button type="submit" className="hero-button2">
                  Enviar Comentário
                </button>
              </form>
            ) : (
              <p>Faça login para adicionar um comentário.</p>
            )}

            {comentarios && comentarios.length > 0 ? (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="user_feedback">
                  <div className="info_user1">
                    <FaUserCircle size={45} />
                    <div>
                      <h3>
                        {comentario.usuario?.nome || "Usuário Anônimo"}
                      </h3>
                      <span>
                        {new Date(
                          comentario.created_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p>{comentario.mensagem}</p>
                </div>
              ))
            ) : (
              <p>Não há comentários ainda. Seja o primeiro a comentar!</p>
            )}
          </section>
        </main>
      </Container>

      <style>{`
        .detail-hero {
          height: 50vh;
          min-height: 300px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
          padding: 40px;
          position: relative;
        }
        .detail-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 50%, rgba(0,0,0,0.6));
        }
        .detail-hero h1 {
          position: relative;
          z-index: 1;
          color: #fff;
          font-size: 42px;
          margin: 0;
        }
        .flex_area {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          max-width: 1200px;
          margin: 30px auto;
          padding: 0 20px;
        }
        .user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sugested_user {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .icons {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .icons-favorite {
          cursor: pointer;
          color: var(--cor-primaria, #eb662b);
        }
        .detail-container {
          padding: 20px 0;
        }
        .description-section {
          margin-bottom: 40px;
        }
        .description-section h2 {
          color: #333;
          border-bottom: 2px solid var(--cor-primaria, #eb662b);
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        .description-section p {
          color: #555;
          line-height: 1.8;
          font-size: 16px;
        }
        .localization-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin: 40px 0;
        }
        @media (max-width: 768px) {
          .localization-grid {
            grid-template-columns: 1fr;
          }
        }
        .map-section h2, .to-arrive h2 {
          color: #333;
          border-bottom: 2px solid var(--cor-primaria, #eb662b);
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        .container-to-arrive {
          background: #fff;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .container-to-arrive .title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .container-to-arrive h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        .container-to-arrive p {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        .icon-type span {
          background: var(--cor-primaria, #eb662b);
          color: #fff;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
        }
        .container_feedbacks {
          margin: 40px 0;
        }
        .container_feedbacks h2 {
          color: #333;
          border-bottom: 2px solid var(--cor-primaria, #eb662b);
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        .commentForm {
          margin-bottom: 30px;
        }
        .commentInput {
          width: 100%;
          padding: 15px;
          border: 2px solid var(--cor-cinza-principal, #e9e9e9);
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .commentInput:focus {
          border-color: var(--cor-primaria, #eb662b);
        }
        .commentError {
          color: red;
          font-size: 14px;
          margin-top: 5px;
        }
        .hero-button2 {
          padding: 12px 24px;
          background: var(--cor-primaria, #eb662b);
          color: #fff;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.2s;
          font-family: inherit;
        }
        .hero-button2:hover {
          background: var(--cor-hover, #d84606);
        }
        .user_feedback {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .info_user1 {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
        }
        .info_user1 h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        .info_user1 span {
          font-size: 12px;
          color: #888;
        }
        .user_feedback p {
          color: #555;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default DestinationDetailPage;
