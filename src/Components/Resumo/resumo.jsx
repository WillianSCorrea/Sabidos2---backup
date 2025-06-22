import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './Resumo.css';

const Resumo = () => {
  const [resumos, setResumos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idEdicao, setIdEdicao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user?.uid;

  useEffect(() => {
    if (userId) {
      carregarResumos();
    }
  }, [userId]);

  const carregarResumos = async () => {
    try {
      setCarregando(true);
      const q = query(collection(db, "resumos"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const resumosCarregados = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setResumos(resumosCarregados);
    } catch (error) {
      console.error("Erro ao carregar resumos: ", error);
      alert("Ocorreu um erro ao carregar seus resumos");
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      alert("Por favor, insira um título para seu resumo");
      return;
    }

    if (!descricao.trim()) {
      alert("Por favor, insira o conteúdo do resumo");
      return;
    }

    const dataAtual = formatarData(new Date());

    try {
      if (modoEdicao && idEdicao) {
        await updateDoc(doc(db, "resumos", idEdicao), {
          titulo,
          descricao,
          data: dataAtual,
          atualizadoEm: new Date().toISOString()
        });

        setResumos(resumos.map(resumo =>
          resumo.id === idEdicao ? { ...resumo, titulo, descricao, data: dataAtual } : resumo
        ));
      } else {
        const docRef = await addDoc(collection(db, "resumos"), {
          userId,
          titulo,
          descricao,
          data: dataAtual,
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        });

        setResumos([...resumos, {
          id: docRef.id,
          titulo,
          descricao,
          data: dataAtual
        }]);
      }

      resetarFormulario();
    } catch (error) {
      console.error("Erro ao salvar resumo: ", error);
      alert("Ocorreu um erro ao salvar seu resumo");
    }
  };

  const deletarResumo = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este resumo?")) return;

    try {
      await deleteDoc(doc(db, "resumos", id));
      setResumos(resumos.filter(resumo => resumo.id !== id));
    } catch (error) {
      console.error("Erro ao deletar resumo: ", error);
      alert("Ocorreu um erro ao excluir o resumo");
    }
  };

  const editarResumo = (id) => {
    const resumo = resumos.find(r => r.id === id);
    if (resumo) {
      setTitulo(resumo.titulo);
      setDescricao(resumo.descricao);
      setModoEdicao(true);
      setIdEdicao(id);
      document.querySelector('.editor-container').scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatarData = (data) => {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
  };

  const resetarFormulario = () => {
    setTitulo("");
    setDescricao("");
    setModoEdicao(false);
    setIdEdicao(null);
  };

  // CONFIGURAÇÃO DO RECONHECIMENTO DE VOZ
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Este navegador não suporta a Web Speech API');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setDescricao((prev) => prev + ' ' + transcript);
        } else {
          interimTranscript += transcript;
        }
      }
      const liveTextDiv = document.getElementById('live-text');
      if (liveTextDiv) liveTextDiv.innerText = interimTranscript;
    };

    recognitionRef.current = recognition;
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const liveTextDiv = document.getElementById('live-text');
      if (liveTextDiv) liveTextDiv.innerText = '';
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="resumo-app">
      <header className="app-header">
        <h1>Meus Resumos</h1>
        <p className="subtitulo">{modoEdicao ? 'Editando resumo' : 'Adicione novos conhecimentos'}</p>
      </header>

      <div className="resumo-container">
        <aside className="lista-resumos">
          <h2 className="lista-titulo">Seus Resumos</h2>

          {carregando ? (
            <div className="carregando">Carregando...</div>
          ) : resumos.length === 0 ? (
            <div className="nenhum-resumo">
              <p>Nenhum resumo encontrado</p>
              <button onClick={resetarFormulario} className="btn-novo">
                Criar primeiro resumo
              </button>
            </div>
          ) : (
            <div className="resumos-grid">
              {resumos.map((resumo) => (
                <article className="resumo-card" key={resumo.id}>
                  <div className="resumo-cabecalho">
                    <h3>{resumo.titulo}</h3>
                    <span className="resumo-data">{resumo.data}</span>
                  </div>
                  <div className="resumo-conteudo">
                    <p>{resumo.descricao}</p>
                  </div>
                  <div className="resumo-acoes">
                    <button
                      onClick={() => editarResumo(resumo.id)}
                      className="btn-editar"
                      aria-label="Editar resumo"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => deletarResumo(resumo.id)}
                      className="btn-excluir"
                      aria-label="Excluir resumo"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>

        <section className="editor-container">
          <h2 className="editor-titulo">
            {modoEdicao ? 'Editar Resumo' : 'Novo Resumo'}
          </h2>

          <form onSubmit={handleSubmit} className="resumo-form">
            <div className="form-group">
              <input
                type="text"
                className="titulo-input"
                placeholder="Título do resumo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={100}
              />
              <small className="contador-caracteres">{titulo.length}/100</small>
            </div>

            <div className="form-group">
              <textarea
                className="descricao-textarea"
                placeholder="Digite o conteúdo do resumo aqui..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={12}
              />
            </div>

            {/* BOTÃO DO MICROFONE */}
            <button
              type="button"
              onClick={handleMicClick}
              style={{
                padding: '10px 20px',
                backgroundColor: isListening ? '#f44336' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              {isListening ? 'Parar 🎤' : 'Iniciar 🎤'}
            </button>

            {/* Texto ao vivo da transcrição - Só aparece quando o microfone estiver ligado */}
            {isListening && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#333' }}>
                <strong className='strong'>Texto ao vivo:</strong>
                <p id="live-text" style={{ background: '#eee', padding: '5px', minHeight: '20px', color: 'black' }}></p>
              </div>
            )}

            <div className="form-acoes">
              <button type="submit" className="btn-salvar">
                {modoEdicao ? 'Atualizar' : 'Salvar'} Resumo
              </button>

              {modoEdicao && (
                <button
                  type="button"
                  onClick={resetarFormulario}
                  className="btn-cancelar"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Resumo;
