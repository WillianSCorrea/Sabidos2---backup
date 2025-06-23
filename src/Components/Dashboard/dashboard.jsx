import React, { useEffect, useState } from 'react';
import './dashboard.css';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { contarDocumentosPorUsuario, SomaTempoDasSeçõesPomo } from "../../services/firebaseService";

const Dashboard = () => {
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    resumos: 0,
    eventos: 0,
    flashcards: 0,
    tempoEstudo: 0
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const buscarDados = async () => {
      if (!userId) return;

      try {
        const [eventos, resumos, flashcards, tempoEstudo] = await Promise.all([
          contarDocumentosPorUsuario("events", userId),
          contarDocumentosPorUsuario("resumos", userId),
          contarDocumentosPorUsuario("flashcards", userId),
          SomaTempoDasSeçõesPomo(userId)
        ]);

        setStats({
          resumos,
          eventos,
          flashcards,
          tempoEstudo: formatarTempo(tempoEstudo)
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [userId]);

  const formatarTempo = (minutos) => {
    if (!minutos) return "0 min";
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  if (carregando) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className='dashboard-container'>
      {/* Saudação */}
      <div className='dashboard-header'>
        <div className='welcome-message'>
          <img src='sabidoOfechado.svg' alt="Sabido" className='welcome-image' />
          <div className='welcome-text'>
            <h2>Opa sabido!</h2>
            <p>Já checou suas notas hoje?</p>
            <p>Bons estudos, mantenha o foco.</p>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='dashboard-content'>
        {/* Atalhos rápidos */}
        <div className="quick-access">
          <div className="access-circle main-circle">
            <img src="sabidoOutline.svg" alt="Menu" />
          </div>
          <Link to='/Agenda' className="access-circle circle-1">
            <img src="diario.svg" alt="Agenda" />
          </Link>
          <Link to='/Resumo' className="access-circle circle-2">
            <img src="notas.svg" alt="Resumos" />
          </Link>
          <Link to='/Pomodoro' className="access-circle circle-3">
            <img src="ampulheta.svg" alt="Pomodoro" />
          </Link>
          <Link to='/Flashcard' className="access-circle circle-4">
            <img src="caarta.svg" alt="Flashcards" />
          </Link>
          <Link to='/grupo' className="access-circle circle-5">
            <img src="grupo.svg" alt="Grupo" />
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="stats-container">
          {/* Tempo de estudo */}
          <div className="study-time-card">
            <div className="time-icon">
              <img src='clock.svg' alt="Relógio" />
            </div>
            <div className="time-info">
              <h3>Tempo de estudo</h3>
              <p className="time-value">{stats.tempoEstudo}</p>
            </div>
          </div>

          {/* Cards de estatísticas */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <img src='notas.svg' alt="Notas" />
              </div>
              <h4>Resumos</h4>
              <p>{stats.resumos}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <img src='diario.svg' alt="Eventos" />
              </div>
              <h4>Eventos</h4>
              <p>{stats.eventos}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <img src='caarta.svg' alt="Flashcards" />
              </div>
              <h4>Flashcards</h4>
              <p>{stats.flashcards}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;