"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Favorito {
  id: number;
  cidadeID: number;
  nomeCidade: string;
  url_imagem?: string;
}

export default function Favourites() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{
    cidadeID: number;
    nomeCidade: string;
  } | null>(null);
  const { user, token, isAuthenticated } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const carregarFavoritos = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/favoritos/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        setError(errBody.error || "Erro ao carregar favoritos.");
        setFavoritos([]);
        return;
      }

      const data = await response.json();
      setFavoritos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
      setError("Erro ao carregar favoritos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const removerFavorito = async (rotaID: number) => {
    if (!user || !token) return;

    setRemovingId(rotaID);
    try {
      const response = await fetch(`${baseUrl}/api/favoritos/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userID: user.id, cidadeID: rotaID }),
      });

      if (response.ok) {
        setFavoritos((prev) => prev.filter((f) => f.cidadeID !== rotaID));
      } else {
        const result = await response.json();
        alert(result.error || "Erro ao remover favorito.");
      }
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
      alert("Erro ao remover favorito. Tente novamente.");
    } finally {
      setRemovingId(null);
      setConfirmRemove(null);
    }
  };

  useEffect(() => {
    carregarFavoritos();
  }, [user, token]);

  return (
    <div className="favourites-page">
      <Navbar />

      <Container>
        <div className="fav-container">
          <h1 className="fav-title">Meus Favoritos</h1>

          {!isAuthenticated ? (
            <div className="fav-login-prompt">
              <p>Faça login para ver seus destinos favoritos.</p>
            </div>
          ) : loading ? (
            <p className="fav-loading">Carregando...</p>
          ) : error ? (
            <p className="fav-error">{error}</p>
          ) : favoritos.length === 0 ? (
            <div className="fav-empty">
              <p>Você ainda não tem rotas favoritas.</p>
              <Link href="/" className="fav-explore-link">
                Explorar destinos
              </Link>
            </div>
          ) : (
            <div className="fav-list">
              {favoritos.map((fav) => (
                <div
                  key={fav.id}
                  className="fav-card"
                  style={{
                    backgroundImage: fav.url_imagem
                      ? `url(${fav.url_imagem})`
                      : "url('/images/hero.jpg')",
                    opacity: removingId === fav.cidadeID ? 0.5 : 1,
                  }}
                >
                  <Link
                    href={`/destinos/${fav.cidadeID}`}
                    className="fav-card-link"
                  >
                    <div className="fav-info">
                      <h2 className="fav-name">{fav.nomeCidade}</h2>
                    </div>
                  </Link>

                  <button
                    className="fav-remove"
                    onClick={() =>
                      setConfirmRemove({
                        cidadeID: fav.cidadeID,
                        nomeCidade: fav.nomeCidade,
                      })
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* Confirmation Modal */}
      {confirmRemove && (
        <div
          className="confirm-overlay"
          onClick={() => setConfirmRemove(null)}
        >
          <div
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="confirm-title">Remover favorito?</h3>
            <p className="confirm-text">
              Tem certeza que deseja remover{" "}
              <strong>{confirmRemove.nomeCidade}</strong> dos seus favoritos?
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-btn cancel"
                onClick={() => setConfirmRemove(null)}
              >
                Cancelar
              </button>
              <button
                className="confirm-btn confirm"
                onClick={() => removerFavorito(confirmRemove.cidadeID)}
                disabled={removingId === confirmRemove.cidadeID}
              >
                {removingId === confirmRemove.cidadeID
                  ? "Removendo..."
                  : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fav-container {
          padding: 40px 0;
          min-height: 60vh;
        }
        .fav-title {
          text-align: center;
          color: #333;
          font-size: 28px;
          margin-bottom: 40px;
        }
        .fav-loading {
          text-align: center;
          color: #888;
          font-size: 16px;
        }
        .fav-error {
          text-align: center;
          color: var(--cor-erro, #dc3545);
          font-size: 16px;
        }
        .fav-empty {
          text-align: center;
          color: #888;
          font-size: 16px;
        }
        .fav-login-prompt {
          text-align: center;
          color: #888;
          font-size: 16px;
          padding: 60px 20px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .fav-explore-link {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 28px;
          background: var(--cor-primaria, #eb662b);
          color: #fff;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.2s;
        }
        .fav-explore-link:hover {
          background: var(--cor-hover, #d84606);
        }
        .fav-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .fav-card {
          height: 220px;
          background-size: cover;
          background-position: center;
          border-radius: 12px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px;
          overflow: hidden;
          transition: transform 0.2s, opacity 0.2s;
        }
        .fav-card:hover {
          transform: translateY(-4px);
        }
        .fav-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 40%, rgba(0,0,0,0.75));
        }
        .fav-card-link {
          position: relative;
          z-index: 1;
          text-decoration: none;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .fav-info {
          position: relative;
          z-index: 1;
        }
        .fav-name {
          color: #fff;
          margin: 0;
          font-size: 22px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .fav-remove {
          position: relative;
          z-index: 2;
          margin-top: 12px;
          padding: 8px 20px;
          background: rgba(220, 53, 69, 0.9);
          color: #fff;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-family: inherit;
          transition: background 0.2s;
          align-self: flex-start;
        }
        .fav-remove:hover:not(:disabled) {
          background: rgb(220, 53, 69);
        }
        .fav-remove:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Confirmation Modal */
        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .confirm-modal {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .confirm-title {
          margin: 0 0 12px;
          font-size: 20px;
          color: #333;
        }
        .confirm-text {
          margin: 0 0 28px;
          font-size: 15px;
          color: #666;
          line-height: 1.5;
        }
        .confirm-text strong {
          color: #333;
        }
        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .confirm-btn {
          padding: 10px 24px;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, opacity 0.2s;
        }
        .confirm-btn.cancel {
          background: var(--cor-cinza-principal, #e9e9e9);
          color: #555;
        }
        .confirm-btn.cancel:hover {
          background: var(--cor-cinza-secundario, #adadad);
          color: #fff;
        }
        .confirm-btn.confirm {
          background: var(--cor-erro, #dc3545);
          color: #fff;
        }
        .confirm-btn.confirm:hover:not(:disabled) {
          background: #c82333;
        }
        .confirm-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .fav-list {
            grid-template-columns: 1fr;
          }
          .confirm-modal {
            padding: 24px;
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}
