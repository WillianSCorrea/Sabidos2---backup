import React from 'react';
import './sobrenos.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      <ProfileSection
        imageUrl="SUA_IMAGEM_AQUI.jpg"
        name="SEU NOME"
        role="ADM e Coenetor no Solitário"
        tagline="DESCRICAO"
        since="09/08/2005"
        description="Participa-se para a início da criação de projetos na parte de despre participatividade e créditos cicloproletários."
        keywords="gm"
        instagram="@WSFS"
        email="gjm.talg@SGcz"
      />
    </div>
  );
};

const ProfileSection = ({ imageUrl, name, role, tagline, since, description, keywords, instagram, email }) => {
  return (
    <div className="profile-section">
      <div className="profile-pic">
        <img src={imageUrl} alt={name} />
      </div>
      
      <div className="profile-info">
        <h1>{name}</h1>
        <h2>{role}</h2>
        <p className="tagline">{tagline}</p>
        
        <div className="details">
          <p><strong>Desde:</strong> {since}</p>
          <p>{description}</p>
          <p className="keywords">{keywords}</p>
        </div>
        
        <div className="contact">
          <p>Instagram: {instagram}</p>
          <p>Email: {email}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
