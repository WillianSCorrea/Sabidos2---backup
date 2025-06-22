import { getFirestore, collection, query, where, getCountFromServer, getDocs } from "firebase/firestore";

const db = getFirestore();

/**
 * Conta a quantidade de documentos de um usuário em uma coleção.
 * @param {string} nomeDaColecao - Nome da coleção.
 * @param {string} userId - ID do usuário.
 * @returns {Promise<number>}
 */
export const contarDocumentosPorUsuario = async (nomeDaColecao, userId) => {
  try {
    const colecaoRef = collection(db, nomeDaColecao);
    const filtro = query(colecaoRef, where("userId", "==", userId));
    const snapshot = await getCountFromServer(filtro);
    return snapshot.data().count;
  } catch (error) {
    console.error(`Erro ao contar documentos da coleção "${nomeDaColecao}" para o usuário "${userId}":`, error);
    return 0;
  }
};


export const SomaTempoDasSeçõesPomo = async () => {
  try {
    const colecaoRef = collection(db, "pomodoro"); // Nome da coleção
    const snapshot = await getDocs(colecaoRef);

    let soma = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      soma += data.totalTrabalho || 0; // Se não tiver "likes", soma 0
    });

    return soma;
  } catch (error) {
    console.error("Erro ao somar Tempo de Trabalho :", error);
    return 0;
  }
};