import React from "react";
import InfoCard from "./InfoCard";
import "./FeaturesSections.css";

const featuresData = [
  {
    icon: "/icons/ticket.svg",
    title: "Rotas Exclusivas",
    text: "Explore rotas personalizadas que vão desde os destinos mais conhecidos até os tesouros escondidos do Nordeste.",
  },
  {
    icon: "/icons/hot-air-balloon.svg",
    title: "Atividades e Experiências",
    text: "Mergulhe na cultura nordestina com atividades selecionadas para tornar sua viagem ainda mais inesquecível.",
  },
  {
    icon: "/icons/diamond.svg",
    title: "Colaboradores Locais",
    text: "Contamos com colaboradores em cada cidade, sempre atualizando nosso site.",
  },
  {
    icon: "/icons/medal.svg",
    title: "Feedbacks dos Viajantes",
    text: "Veja o que nossos visitantes têm a dizer sobre suas jornadas pelo Nordeste.",
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="features-section">
      <h2 className="features-main-title">
        Descubra o Nordeste além dos roteiros <br />
        convencionais
      </h2>
      <div className="features-grid">
        {featuresData.map((feature) => (
          <InfoCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            text={feature.text}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
