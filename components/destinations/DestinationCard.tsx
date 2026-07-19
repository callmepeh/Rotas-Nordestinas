import React from "react";
import type { Destino } from "@/types";
import Link from "next/link";
import "./DestinationCard.css";

interface DestinationCardProps {
  destino: Destino;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destino }) => {
  return (
    <Link href={`/destinos/${destino.id}`} className="destination-card-link">
      <div className="destination-card">
        <img
          src={destino.url_imagem}
          alt={`Foto de ${destino.nomeCidade}`}
          className="card-image"
        />
        <div className="card-overlay">
          <h3 className="card-title">{destino.nomeCidade}</h3>
        </div>
      </div>
    </Link>
  );
};

export default DestinationCard;
