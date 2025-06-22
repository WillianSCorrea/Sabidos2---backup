import React from 'react'
import './PerfilPage.css'
import Header from '../../Components/Header/Header';
import Perfil from '../../Components/Perfil/perfilRefac';
import Footer from '../../Components/Footer/Footer';

const PrefilPage = () => {
  return (
    <>
      <Header title='Perfil'/>
      <Perfil/>
      <Footer></Footer>
    </>
  )
}

export default PrefilPage
