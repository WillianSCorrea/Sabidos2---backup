import React, { useState, useEffect } from 'react';
import './Perfil.css';
import { supabase } from '../../services/supabaseClient';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function PerfilUsuario() {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Observar autenticação e definir usuário
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, []);

  // Buscar imagem salva no Firestore após usuário estar logado
  useEffect(() => {
    const fetchFoto = async () => {
      if (!user?.uid) return;
      const userRef = doc(db, "usuarios", user.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.fotoPerfilUrl) {
          setFotoPerfilUrl(data.fotoPerfilUrl);
        }
      }
    };
    fetchFoto();
  }, [user]);

  const uploadImage = async () => {
    if (!image || !user?.uid) {
      alert("Selecione uma imagem e esteja logado!");
      return;
    }

    setLoading(true);

    const fileExt = image.name.split('.').pop();
    const fileName = `${user.uid}_${Date.now()}.${fileExt}`;

    // Upload da imagem no Supabase
    const { error: uploadError } = await supabase
      .storage
      .from('imagens')
      .upload(fileName, image);

    if (uploadError) {
      alert('Erro ao subir imagem: ' + uploadError.message);
      setLoading(false);
      return;
    }

    // Obter URL pública
    const { data } = supabase
      .storage
      .from('imagens')
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;
    setFotoPerfilUrl(publicUrl);

    // Salvar URL no Firestore
    const userRef = doc(db, 'usuarios', user.uid);

    try {
      await updateDoc(userRef, {
        fotoPerfilUrl: publicUrl
      });
      console.log('URL da imagem salva com sucesso no Firestore!');
      alert("Imagem enviada com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar URL da imagem no Firestore:', error);
    }

    setLoading(false);
  };

  return (
    <main className="Perfil">
      <div className="Perfil-container">
        <div className="box1">
          <figure>
            <img
              src={
                user?.photoURL ||
                fotoPerfilUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || "Usuário"}`
              }
              alt="Foto de Perfil"
              className="imgPerfil"
            />
            <img src="edit.svg" className="img2" alt="Editar" />
          </figure>
          <h1 className="NomePerfil">{user?.displayName || "Nome não definido"}</h1>
        </div>

        <div className="box2">
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
          <button onClick={uploadImage} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>

          <div className="info1">
            <h3 className="user">Usuário</h3>
            <p className="user2">{user?.displayName || "Não definido"}</p>
          </div>
          <div className="info2">
            <h3 className="email">Email</h3>
            <p className="email2">{user?.email}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
