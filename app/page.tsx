"use client";

import { useState, useEffect, useMemo } from "react";
import { scroller } from "react-scroll";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import DestinationsCarousel from "@/components/destinations/DestinationsCarousel";
import FeaturesSection from "@/components/home/FeaturesSections";
import ValuesSection from "@/components/home/ValuesSection";
import type { Destino } from "@/types";

interface DestinoData extends Omit<Destino, 'estados'> {
  estados?: {
    id: number;
    nome: string;
    sigla: string;
  };
}

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [destinos, setDestinos] = useState<DestinoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const fetchAllDestinos = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${baseUrl}/api/cidades`);
      const data = await response.json();
      setDestinos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar destinos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchByNome = async (nome: string) => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(
        `${baseUrl}/api/cidades/buscar?nome=${nome}`
      );
      const data = await response.json();
      setDestinos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar destinos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDestinos();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") return;

    const delay = setTimeout(() => {
      fetchByNome(searchTerm);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Handle scrollTo from URL params (when navigating from other pages)
  useEffect(() => {
    const scrollTo = searchParams.get("scrollTo");
    if (scrollTo) {
      setTimeout(() => {
        scroller.scrollTo(scrollTo, {
          duration: 500,
          smooth: true,
          offset: -80,
        });
      }, 500);
    }
  }, [searchParams]);

  const groupedDestinos = useMemo(() => {
    if (!Array.isArray(destinos)) return {};
    return destinos.reduce((acc: Record<string, DestinoData[]>, destino) => {
      const estado = destino.estados?.nome || "Desconhecido";
      if (!acc[estado]) acc[estado] = [];
      acc[estado].push(destino);
      return acc;
    }, {});
  }, [destinos]);

  return (
    <div>
      <Navbar />

      <header id="Home" className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-bg">
          <Container>
            <div className="hero-content">
              <h1>
                Explore a essência <br /> do Nordeste
              </h1>
              <p>Um universo de cultura e paisagens únicas</p>

              <button
                onClick={() =>
                  scroller.scrollTo("destinos", {
                    duration: 500,
                    smooth: true,
                    offset: -80,
                  })
                }
                className="hero-button"
              >
                Descubra o que o Nordeste tem a oferecer
              </button>
            </div>
          </Container>
        </div>
      </header>

      <style>{`
        .hero-section {
          position: relative;
          height: 80vh;
          min-height: 500px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('/images/hero.jpg');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          color: #fff;
          max-width: 600px;
        }
        .hero-content h1 {
          font-size: 48px;
          margin: 0 0 15px;
          line-height: 1.2;
        }
        .hero-content p {
          font-size: 20px;
          margin-bottom: 30px;
          opacity: 0.9;
        }
        .hero-button {
          display: inline-block;
          padding: 14px 32px;
          background: var(--cor-primaria, #eb662b);
          color: #fff;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
          font-family: inherit;
        }
        .hero-button:hover {
          background: var(--cor-hover, #d84606);
        }
        .home-content {
          padding: 40px 0;
        }
        .destinations-section {
          padding: 40px 0;
        }
        .destinations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .destinations-header h2 {
          font-size: 28px;
          color: #333;
          margin: 0;
        }
        .search-bar {
          padding: 12px 20px;
          border: 2px solid var(--cor-cinza-principal, #e9e9e9);
          border-radius: 25px;
          font-size: 16px;
          width: 300px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .search-bar:focus {
          border-color: var(--cor-primaria, #eb662b);
        }
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 32px;
          }
          .hero-content p {
            font-size: 16px;
          }
          .hero-section {
            height: 60vh;
            min-height: 400px;
          }
          .search-bar {
            width: 100%;
          }
        }
      `}</style>

      <Container>
        <FeaturesSection />
      </Container>

      <Container>
        <div id="sobre">
          <ValuesSection />
        </div>
      </Container>

      <Container>
        <main className="home-content">
          <section id="destinos" className="destinations-section">
            <div className="destinations-header">
              <h2>Destinos</h2>
              <input
                type="text"
                placeholder="Pesquise por uma cidade"
                className="search-bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <p>Carregando destinos...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : (
              <div className="destinations-list">
                {Object.entries(groupedDestinos).map(([estado, cidades]) => (
                  <DestinationsCarousel
                    key={estado}
                    estado={estado}
                    destinos={cidades}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </Container>

      <Footer />
    </div>
  );
};

export default HomePage;
