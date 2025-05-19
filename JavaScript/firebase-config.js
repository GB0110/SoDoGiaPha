// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAH4tFSynGg_AbYPsuWQYsyGacphdiBYK8",
  authDomain: "giapha-afc2a.firebaseapp.com",
  projectId: "giapha-afc2a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
