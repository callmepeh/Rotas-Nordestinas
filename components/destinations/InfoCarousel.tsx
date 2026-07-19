import React from "react";
import InfoCard from "./GeneralCard";
import type { InfoItem } from "./GeneralCard";
import "./InfoCarousel.css";

interface InfoCarouselProps {
  titulo: string;
  itens: InfoItem[];
}

const InfoCarousel: React.FC<InfoCarouselProps> = ({ titulo, itens }) => {
  return (
    <section className="info-carousel-section">
      <h2 className="info-carousel-title">{titulo}</h2>
      <div className="info-carousel-container">
        {itens.map((item) => (
          <InfoCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default InfoCarousel;
