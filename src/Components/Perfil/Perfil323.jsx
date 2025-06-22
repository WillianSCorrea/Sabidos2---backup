import React, { useState } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function ImageUploader() {
  const [image, setImage] = useState(null)
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const uploadImage = async () => {
    if (!image) return alert('Selecione uma imagem')
    
    setLoading(true)
    const fileExt = image.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase
      .storage
      .from('imagens') // mesmo nome do bucket
      .upload(fileName, image)

    if (error) {
      alert('Erro ao subir imagem:', error.message)
      setLoading(false)
      return
    }

    const { data } = supabase
      .storage
      .from('imagens')
      .getPublicUrl(fileName)

    setUrl(data.publicUrl)
    setLoading(false)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload de Imagem dfszxczxdf (Supabase)</h2>
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
      <button onClick={uploadImage} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
      {url && (
        <div>
          <p>Imagem enviada com sucesso:</p>
          <img src={url} alt="Imagem enviada" style={{ maxWidth: '300px' }} />
        </div>
      )}
    </div>
  )
}
