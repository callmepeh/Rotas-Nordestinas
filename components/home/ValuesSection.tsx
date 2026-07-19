import React from "react";
import "./ValuesSection.css";

const valuesData = [
  {
    icon: "/icons/Goal.svg",
    title: "Missão",
    text: "Promover o turismo no Nordeste, valorizando a cultura, história e o comércio local, conectando viajantes a experiências únicas e verdadeiras.",
  },
  {
    icon: "/icons/Eye.svg",
    title: "Visão",
    text: "Ser o principal guia de turismo do Nordeste, reconhecido por destacar a riqueza cultural da região e apoiar empreendedores locais.",
  },
  {
    icon: "/icons/diamond-head.svg",
    title: "Valores",
    text: "Valorização cultural, apoiar os comerciantes locais, promover a sustentabilidade, e Inovação.",
  },
];

const ValuesSection: React.FC = () => {
  return (
    <section id="sobre" className="values-section">
      <h2 className="values-main-title">Conheça nossos valores</h2>
      <div className="values-grid">
        {valuesData.map((value) => (
          <div className="value-card1" key={value.title}>
            <div className="value-card-icon-wrapper">
              <img
                src={value.icon}
                alt={value.title}
                className="value-card-icon"
              />
            </div>
            <h3 className="value-card-title">{value.title}</h3>
            <p className="value-card-text">{value.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValuesSection;
