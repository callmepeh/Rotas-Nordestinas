"use client";

import React, { createContext, useState, useContext } from "react";

type ModalType = "login" | "register" | "collaborator" | null;

interface UIContextType {
  openModal: ModalType;
  showLoginModal: () => void;
  showRegisterModal: () => void;
  showCollaboratorModal: () => void;
  closeModal: () => void;
}

const UIContext = createContext<UIContextType>(null!);

export const useUI = () => {
  return useContext(UIContext);
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const showLoginModal = () => setOpenModal("login");
  const showRegisterModal = () => setOpenModal("register");
  const showCollaboratorModal = () => setOpenModal("collaborator");
  const closeModal = () => setOpenModal(null);

  const value = {
    openModal,
    showLoginModal,
    showRegisterModal,
    showCollaboratorModal,
    closeModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
