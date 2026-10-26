import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-gcSc02g34Y8wHjqAgtwy9sHyFnzZws",
  authDomain: "agrogestionzeta.firebaseapp.com",
  projectId: "agrogestionzeta",
  storageBucket: "agrogestionzeta.firebasestorage.app",
  messagingSenderId: "281593743147",
  appId: "1:281593743147:web:72254b9b212dc2f23ba76e",
  measurementId: "G-BKTNFM002R"
};

// Inicializar Firebase de forma directa
const app = initializeApp(firebaseConfig);

// Exportar Firestore conectado al proyecto agrogestionzeta
export const db = getFirestore(app);