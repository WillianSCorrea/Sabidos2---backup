import React, { useState, useEffect } from 'react';
import './Flashcard.css';
import { db } from '../../firebase/config';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const Flashcard = () => {
    const [cards, setCards] = useState([]);
    const [titulo, setTitulo] = useState("");
    const [frente, setFrente] = useState("");
    const [verso, setVerso] = useState("");
    const [cardsVirados, setCardsVirados] = useState([]);
    const [activeCard, setActiveCard] = useState(null);
    const [carregando, setCarregando] = useState(true);
    
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user?.uid;

    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, "flashcards"), 
            where("userId", "==", userId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const loadedCards = [];
            querySnapshot.forEach((doc) => {
                loadedCards.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            // Ordena por data de criação (mais novos primeiro)
            loadedCards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setCards(loadedCards);
            setCarregando(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const salvarFlashcard = async (e) => {
        e.preventDefault();

        if (!titulo.trim() && !frente.trim() && !verso.trim()) {
            alert("Por favor, adicione conteúdo ao seu flashcard!");
            return;
        }

        if (!titulo.trim()) {
            alert("Por favor, insira um título para seu flashcard!");
            return;
        }

        if (!frente.trim()) {
            alert("Por favor, insira o conteúdo da frente!");
            return;
        }

        if (!verso.trim()) {
            alert("Por favor, insira o conteúdo do verso!");
            return;
        }

        try {
            await addDoc(collection(db, "flashcards"), {
                userId: userId,
                titulo: titulo,
                frente: frente,
                verso: verso,
                data: formatarData(new Date()),
                createdAt: new Date().toISOString()
            });

            // Limpa os campos
            setTitulo("");
            setFrente("");
            setVerso("");
            
        } catch (error) {
            console.error("Erro ao salvar Flashcard: ", error);
            alert("Ocorreu um erro ao salvar o flashcard!");
        }
    }

    const deletarFlashcard = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Tem certeza que deseja excluir este flashcard?")) {
            try {
                await deleteDoc(doc(db, "flashcards", id));
            } catch (error) {
                console.error("Erro ao deletar flashcard: ", error);
                alert("Ocorreu um erro ao excluir o flashcard!");
            }
        }
    }

    const virarCard = (indexVirar, e) => {
        e.stopPropagation();
        setCardsVirados(prev => 
            prev.includes(indexVirar) 
                ? prev.filter(i => i !== indexVirar) 
                : [...prev, indexVirar]
        );
    };

    const formatarData = (date) => {
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${dia}/${mes}`;
    };

    const handleCardClick = (card) => {
        setActiveCard(card);
    };

    const handleBackToList = () => {
        setActiveCard(null);
    };

    return (
        <div className="flashcard-app">
            <header className="app-header">
                <h1>Meus Flashcards</h1>
                <p className="subtitulo">Crie e revise seus conhecimentos</p>
            </header>

            <div className="flashcard-container">
                <aside className="lista-flashcards">
                    {carregando ? (
                        <div className="carregando">Carregando flashcards...</div>
                    ) : activeCard ? (
                        <div className="visualizacao-detalhada">
                            <button onClick={handleBackToList} className="btn-voltar">
                                ← Voltar para lista
                            </button>
                            <div className="card-detalhado">
                                <h2>{activeCard.titulo}</h2>
                                <div className="lados-card">
                                    <div className="lado-card">
                                        <h3>Frente</h3>
                                        <div className="conteudo-card">{activeCard.frente}</div>
                                    </div>
                                    <div className="lado-card">
                                        <h3>Verso</h3>
                                        <div className="conteudo-card">{activeCard.verso}</div>
                                    </div>
                                </div>
                                <div className="card-metadata">
                                    <span>Criado em: {activeCard.data}</span>
                                </div>
                            </div>
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="nenhum-flashcard">
                            <p>Nenhum flashcard encontrado</p>
                            <p>Comece criando seu primeiro flashcard!</p>
                        </div>
                    ) : (
                        <div className="grid-flashcards">
                            {cards.map((card, index) => (
                                <div 
                                    className={`card ${cardsVirados.includes(index) ? 'virado' : ''}`} 
                                    key={card.id}
                                    onClick={() => handleCardClick(card)}
                                >
                                    <div className="card-cabecalho">
                                        <h3>{card.titulo}</h3>
                                        <span className="card-data">{card.data}</span>
                                    </div>
                                    <div className="card-conteudo">
                                        {cardsVirados.includes(index) ? card.verso : card.frente}
                                    </div>
                                    <div className="card-acoes">
                                        <button 
                                            className="btn-virar" 
                                            onClick={(e) => virarCard(index, e)}
                                            aria-label="Virar card"
                                        >
                                            🔄
                                        </button>
                                        <button 
                                            className="btn-excluir" 
                                            onClick={(e) => deletarFlashcard(card.id, e)}
                                            aria-label="Excluir card"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
                
                <section className="editor-flashcard">
                    <h2 className="editor-titulo">Criar Novo Flashcard</h2>
                    <form onSubmit={salvarFlashcard} className="form-flashcard">
                        <div className="form-group">
                            <textarea
                                className="input-titulo"
                                placeholder="Título do flashcard"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                maxLength={50}
                                rows={2}
                            />
                            <small className="contador-caracteres">{titulo.length}/50</small>
                        </div>
                        
                        <div className="form-group">
                            <label>Frente</label>
                            <textarea
                                className="input-conteudo"
                                placeholder="Conteúdo da frente"
                                value={frente}
                                onChange={(e) => setFrente(e.target.value)}
                                rows={5}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Verso</label>
                            <textarea
                                className="input-conteudo"
                                placeholder="Conteúdo do verso"
                                value={verso}
                                onChange={(e) => setVerso(e.target.value)}
                                rows={5}
                            />
                        </div>
                        
                        <div className="form-acoes">
                            <button type="submit" className="btn-salvar">
                                Salvar Flashcard
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default Flashcard;