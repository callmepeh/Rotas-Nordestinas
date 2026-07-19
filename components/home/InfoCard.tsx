import React from "react";
import "./InfoCard.css";

interface InfoCardProps {
  icon: string;
  title: string;
  text: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, text }) => {
  return (
    <div className="info-card">
      <img src={icon} alt={title} className="info-card-icon" />
      <h3 className="info-card-title">{title}</h3>
      <p className="info-card-text">{text}</p>
    </div>
  );
};

export default InfoCard;
