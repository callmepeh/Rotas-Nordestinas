"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { scroller } from "react-scroll";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";
import Container from "./Container";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const { showLoginModal, showRegisterModal, showCollaboratorModal } = useUI();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const handleNavAndScroll = (sectionId: string) => {
    setIsMenuOpen(false);

    if (pathname === "/") {
      scroller.scrollTo(sectionId, {
        duration: 500,
        smooth: true,
        offset: -80,
      });
    } else {
      router.push(`/?scrollTo=${sectionId}`);
    }
  };

  const renderUserActions = () => {
    if (isAuthenticated) {
      if (user?.funcao === "colaborador") {
        return (
          <div className="nav-actions">
            <Link href="/sugerir-rota" className="nav-link">
              Crie uma Rota
            </Link>
            <Link href="/perfil" className="nav-profile-icon">
              <FaUserCircle size={28} />
            </Link>
          </div>
        );
      } else {
        return (
          <div className="nav-actions">
            <button
              onClick={() => {
                showCollaboratorModal();
                setIsMenuOpen(false);
              }}
              className="nav-link as-button"
            >
              Seja um colaborador
            </button>
            <Link href="/perfil" className="nav-profile-icon">
              <FaUserCircle size={28} />
            </Link>
          </div>
        );
      }
    }

    return (
      <div className="nav-actions">
        <button
          onClick={() => {
            showLoginModal();
            setIsMenuOpen(false);
          }}
          className="nav-button"
        >
          Login
        </button>
        <button
          onClick={() => {
            showRegisterModal();
            setIsMenuOpen(false);
          }}
          className="nav-button primary"
        >
          Cadastre-se
        </button>
      </div>
    );
  };

  const navMenuLinks = (
    <>
      <Link href="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
        Home
      </Link>
      <button
        onClick={() => handleNavAndScroll("sobre")}
        className="nav-link as-button"
      >
        Sobre
      </button>
      <button
        onClick={() => handleNavAndScroll("destinos")}
        className="nav-link as-button"
      >
        Destinos
      </button>

      <Link
        href="/favoritos"
        className="nav-link"
        onClick={() => setIsMenuOpen(false)}
      >
        Favoritos
      </Link>

      {isAuthenticated && user?.funcao === "colaborador" && (
        <Link
          href="/sugerir-rota"
          className="nav-link"
          onClick={() => setIsMenuOpen(false)}
        >
          Sugerir Rota
        </Link>
      )}
    </>
  );

  return (
    <nav className="navbar">
      <Container>
        <div className="navbar-content">
          <Link href="/" className="navbar-logo">
            <img src="/icons/Logo.svg" alt="Rotas Nordestinas Logo" />
          </Link>
          <div className="nav-links">{navMenuLinks}</div>
          <div className="desktop-actions">{renderUserActions()}</div>
          <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </Container>
      {isMenuOpen && (
        <div className="mobile-nav-menu">
          {navMenuLinks}
          <div className="mobile-actions">{renderUserActions()}</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
