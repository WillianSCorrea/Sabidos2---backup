import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SlideBar.css';

function SlideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar o dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sidebar-container">
      <div className="menu-trigger" onClick={toggleDropdown}>
        <img src='./icon/Barras.svg' alt="Menu" className="menu-icon"/>
      </div>
      
      <div 
        ref={dropdownRef}
        className={`dropdown-menu ${isOpen ? 'open' : ''}`}
      >
        <div className="menu-header">
          <img src='./icon/Barras.svg' alt="Menu" className="menu-icon"/>
        </div>
        
        <div className="menu-links">
          <Link to="/dashboard" className="menu-link" onClick={() => setIsOpen(false)}>
            <img src='icon/House.svg' className="link-icon" alt="Home"/>
            <span>Home</span>
          </Link>
          
          <Link to="/Agenda" className="menu-link" onClick={() => setIsOpen(false)}>
            <img src='icon/Agend.svg' className="link-icon" alt="Agenda"/>
            <span>Agenda</span>
          </Link>
          
          <Link to="/Resumo" className="menu-link" onClick={() => setIsOpen(false)}>
            <img src='icon/Pen.svg' className="link-icon" alt="Resumos"/>
            <span>Resumos</span>
          </Link>
          
          <Link to="/Pomodoro" className="menu-link" onClick={() => setIsOpen(false)}>
            <img src='icon/Time.svg' className="link-icon" alt="Pomodoro"/>
            <span>Pomodoro</span>
          </Link>
          
          <Link to="/Flashcard" className="menu-link" onClick={() => setIsOpen(false)}>
            <img src='icon/Cards.svg' className="link-icon" alt="Flashcards"/>
            <span>Flashcards</span>
          </Link>
          
        </div>
        
        <div className="menu-footer">
          <Link to="/sobrenos" className="menu-link" onClick={() => setIsOpen(false)}>
            <img src='icon/About.svg' className="link-icon" alt="Sobre nós"/>
            <span>Sobre nós</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SlideBar;