import React from "react";
import type { Destino } from "@/types";
import DestinationCard from "./DestinationCard";
import "./DestinationsCarousel.css";

interface DestinationsCarouselProps {
  estado: string;
  destinos: Destino[];
}

const DestinationsCarousel: React.FC<DestinationsCarouselProps> = ({
  estado,
  destinos,
}) => {
  return (
    <section className="carousel-section">
      <h2 className="carousel-title">{estado}</h2>
      <div className="carousel-container">
        {destinos.map((destino) => (
          <DestinationCard key={destino.id} destino={destino} />
        ))}
      </div>
    </section>
  );
};

export default DestinationsCarousel;
