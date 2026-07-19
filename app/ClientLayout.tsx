"use client";

import React from "react";
import { useUI } from "@/context/UIContext";
import Modal from "@/components/common/Modal";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import CollaboratorForm from "@/components/auth/CollaboratorForm";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openModal } = useUI();

  return (
    <>
      {children}

      {openModal === "login" && (
        <Modal>
          <LoginForm />
        </Modal>
      )}

      {openModal === "register" && (
        <Modal>
          <RegisterForm />
        </Modal>
      )}

      {openModal === "collaborator" && (
        <Modal>
          <CollaboratorForm />
        </Modal>
      )}
    </>
  );
}
