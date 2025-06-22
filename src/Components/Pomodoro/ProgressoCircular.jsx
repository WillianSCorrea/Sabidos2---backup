import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from '../../firebase/config'; 
import './CircularTimer.css'; // Certifique-se de ter um arquivo CSS para estilos

const ProgressoCircular = () => {
  const [tempo, setTempo] = useState(0);
  const [tempoMaximo, setTempoMaximo] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [entrada, setEntrada] = useState('15:00'); // Valor padrão de 15 minutos
  const [modoDescanso, setModoDescanso] = useState(false);
  const [ciclos, setCiclos] = useState(3);
  const [cicloAtual, setCicloAtual] = useState(0);
  const [tempoDescansoCurto, setTempoDescansoCurto] = useState('5:00');
  const [tempoDescansoLongo, setTempoDescansoLongo] = useState(15);
  const [quantTempoTrbalho, setQuantTempoTrabalho] = useState(0);  


  const audioFoco = useRef(null);
  const audioDescanso = useRef(null);
  const audioLongo = useRef(null);
      const auth = getAuth();
      const user = auth.currentUser;
      const userId = user?.uid;

useEffect(() => {
  let intervalo = null;

  if (ativo && !pausado && tempo > 0) {
    intervalo = setInterval(() => {
      setTempo((t) => t - 1);

      // Atualiza contadores conforme o modo
      if (!modoDescanso) {
        setQuantTempoTrabalho((prev) => prev + 1);
      } else if (tempoMaximo === tempoDescansoCurto * 60) {
        setQuantTempoDescanso((prev) => prev + 1);
      } else if (tempoMaximo === tempoDescansoLongo * 60) {
        setQuantTempoDescansoLongo((prev) => prev + 1);
      }
    }, 1000);
  } else if (tempo === 0 && ativo && !pausado) {
    if (!modoDescanso) {
      // Fim do tempo de trabalho
      audioFoco.current?.play();
      iniciarDescanso();
    } else {
      // Fim de descanso
      const proximoCiclo = cicloAtual + 1;

      if (proximoCiclo < ciclos) {
        // Descanso curto → próximo ciclo
        audioDescanso.current?.play();
        iniciarFoco();
        setCicloAtual(proximoCiclo);
      } else {
        // Descanso longo → fim dos ciclos
        audioLongo.current?.play();
        iniciarDescansoLongo();

        // ✅ Salvar no Firestore somente após o descanso longo
        if (modoDescanso && tempoMaximo === tempoDescansoLongo * 60) {
          salvarDadosPomodoro();
          setAtivo(false);
          resetar();
        }
      }
    }
  }

  return () => clearInterval(intervalo);
}, [ativo, pausado, tempo]);

  const iniciarFoco = () => {
    const partes = entrada.split(':');
    const minutos = parseInt(partes[0], 10) || 0;
    const segundos = parseInt(partes[1], 10) || 0;
    const total = minutos * 60 + segundos;

    setTempo(total);
    setTempoMaximo(total);
    setModoDescanso(false);
    setAtivo(true);
  };

  const iniciarDescanso = () => {
    // const segundos = tempoDescansoCurto * 60;

       const partes = entrada.split(':');
    const minutos = parseInt(partes[0], 10) || 0;
    const segundos = parseInt(partes[1], 10) || 0;
    const total = minutos * 60 + segundos;

    setTempo(total);
    setTempoMaximo(total);
    setModoDescanso(true);
  };

  const iniciarDescansoLongo = () => {
    const segundos = tempoDescansoLongo * 60;
    setTempo(segundos);
    setTempoMaximo(segundos);
    setModoDescanso(true);
    setAtivo(true);
    // setCicloAtual(0); // Resetar
  };

  const resetar = () => {
    setAtivo(false);
    setTempo(0);
    setTempoMaximo(0);
    setEntrada('');
    setModoDescanso(false);
    setCicloAtual(0);
    setPausado(false);
  setQuantTempoTrabalho(0);
  setQuantTempoDescanso(0);
  setQuantTempoDescansoLongo(0);
  };

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progresso = tempoMaximo > 0 ? (tempo / tempoMaximo) * 100 : 0;
  const corFundo = modoDescanso ? '#1E90FF' : '#C52333';
  const corProgresso = modoDescanso ? '#A8D3FF' : '#ECB5B9';

const salvarDadosPomodoro = async () => {
  const totalTrabalho = quantTempoTrbalho ;
  const dataFormatada = new Date().toLocaleDateString('pt-BR');

  try {
    await addDoc(collection(db, "pomodoro"), {
      userId,
      totalTrabalho,
      ciclosConcluidos: ciclos,
      data: dataFormatada,
      createdAt: new Date().toISOString()
    });
    console.log("✅ Pomodoro salvo com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao salvar pomodoro:", error);
  }
};


  return (
    <>
    <div className='pomo-container' style={{ display: 'flex', alignItems: 'center', height: '80vh' ,justifyContent: 'space-around'}}>
      <div style={{ display: 'flex', alignItems: 'center', height: '80vh' ,justifyContent: 'space-around', flexDirection: 'column'}}>
      <div className='Cfg_Blocos_Laterais' style={{display: 'flex', flexDirection: "column",alignItems: 'center'}}><label className='Txt_Blocos_Laterais' >Trabalho Focado</label>
      <input
          type="text"
          placeholder="MM:SS"
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}
        /></div>
        <div className='Cfg_Blocos_Laterais' style={{display: 'flex', flexDirection: "column",alignItems: 'center'} }><label className='Txt_Blocos_Laterais'  >Nº de Ciclo</label>
        <input
          type="number"
          value={ciclos}
          onChange={(e) => setCiclos(Number(e.target.value))}
          placeholder="Ciclos"
          
          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}

        /></div>

        <div className='Cfg_Blocos_Laterais' style={{display: 'flex', flexDirection: "column",alignItems: 'center'}}><label className='Txt_Blocos_Laterais' >Descanso Curto</label>
        <input
          type="text"
          placeholder="MM:SS"
          value={tempoDescansoCurto}
          onChange={(e) => setTempoDescansoCurto((e.target.value))}
          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}

        />
        </div>
        <div className='Cfg_Blocos_Laterais' style={{display: 'flex', flexDirection: "column",alignItems: 'center'}}><label className='Txt_Blocos_Laterais' >Descanso Longo</label>
        <input
          type="number"
          value={tempoDescansoLongo}
          onChange={(e) => setTempoDescansoLongo(Number(e.target.value))}
          placeholder="Descanso Longo"
          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}

        /></div>

    </div>
    <div style={{ textAlign: 'center' }}>
      <audio ref={audioFoco} src="/som-foco.mp3" />
      <audio ref={audioDescanso} src="/som-descanso.mp3" />
      <audio ref={audioLongo} src="/som-descanso-longo.mp3" />

      <svg width="230" height="230" viewBox="0 0 130 130">
        <g transform="translate(65, 65)">
          <circle cx="0" cy="0" r="45" fill={corFundo} />
          <circle
            cx="0"
            cy="0"
            r="55"
            fill="none"
            stroke={corProgresso}
            strokeWidth="8"
            strokeDasharray="345.6"
            strokeDashoffset={(1 - progresso / 100) * 345.6}
            strokeLinecap="round"
            transform="rotate(-90)"
          />
          <text x="0" y="-20" textAnchor="middle" style={{ fill: '#6E1C1C', stroke: '#601717', strokeWidth: 1.38, fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700 }}>
            {formatarTempo(tempo)}
          </text>
          <text x="0" y="16" textAnchor="middle" style={{ fill: '#6E1C1C', stroke: '#601717', strokeWidth: 1.38, fontFamily: 'Inter, sans-serif', fontSize: '40px', fontWeight: 700 }}>
            {modoDescanso ? '😌' : '🍅'}
          </text>
        </g>
      </svg>

      <div style={{ marginTop: '1rem' }}>
       
        <button onClick={iniciarFoco} style={{ marginRight: '0.5rem' }}>
          Iniciar
        </button>
        <button onClick={() => setPausado(!pausado)} style={{ marginRight: '0.5rem' }}>
          {pausado ? 'Continuar' : 'Pausar'}
        </button>
        <button onClick={resetar}>Resetar</button>
      </div>
    </div>


{/* Abaixo coloque caixas que brilhem referente ao modo em que está se forem feitos 3 ciclos apareceram3 de trabalho e 3 Descanso alternadamente mais um que é o Descanso longo e assim seguindo essa lógica */}
    <div>
      <div          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}
      ></div>
      <div          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}
      ></div>
      <div          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}
      ></div>
      <div          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}
      ></div>
      <div          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}
      ></div>
      <div          style={{ padding: '0.5rem', marginRight: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '80px', textAlign: 'center' }}
      ></div>
    </div>
    </div>
    </>
     );
};

export default ProgressoCircular;
