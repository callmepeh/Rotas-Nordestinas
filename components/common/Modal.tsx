"use client";

import React from "react";
import { useUI } from "@/context/UIContext";

interface ModalProps {
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ children }) => {
  const { closeModal } = useUI();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={closeModal}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
