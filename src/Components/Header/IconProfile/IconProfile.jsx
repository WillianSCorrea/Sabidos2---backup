import './IconProfile.css'
import { Link } from 'react-router-dom';

import { logoutUsuario } from "../../../services/authService"; // ajuste o caminho conforme necessário
import { useNavigate } from "react-router-dom";

function IconProfile() {

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUsuario();
    navigate("/login"); 
  };

    return (
      <>
      <div className="oi">
  <div className="profile-icon-wrapper">
    <div className="animated-bg"></div>
    <img src="icon/sabidinho2.svg" alt="Perfil" className="IconProfile" />
  </div>

            <div className="ProfileModal">
  <div className='divmodal'>
    <div className="profile-icon-wrapper">
      <div className="animated-bg"></div>
      <img src="icon/sabidinho2.svg" alt="sasfasfasf" className='imgmodal' />
    </div>

    <Link to="/Perfil">
      <button className='gerBtn'>
        <img src="user.svg" alt="Sair" className="manage"/>
        <p className='textt'>Gerenciar sua Conta</p>
        </button>
    </Link>

    <button className='logoutBtn' onClick={handleLogout}>
      <img src="/exit.svg" alt="Sair" className="logout-icon" />
      <p className='sair'>Sair da Conta</p>
    </button>
  </div>
</div>
        </div>
      </>
    )
  }
  
  export default IconProfile ;