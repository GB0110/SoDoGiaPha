// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
  import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
  import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAH4tFSynGg_AbYPsuWQYsyGacphdiBYK8",
    authDomain: "giapha-afc2a.firebaseapp.com",
    projectId: "giapha-afc2a",
    storageBucket: "giapha-afc2a.firebasestorage.app",
    messagingSenderId: "258291985292",
    appId: "1:258291985292:web:987b68812d8744367684a9",
    measurementId: "G-5SEQYBPYGG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  const signUp = document.getElementById("btnRegister");
  signUp.addEventListener('click', (event)=>{
    event.preventDefault();
    const email = document.getElementById('remail').value;
    const password = document.getElementById('rpassword').value;
    const username = document.getElementById('rhoten').value;
    
    const auth = getAuth();
    const db = getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential)=>{
        const user = userCredential.user;
        const userData = {
            email: email,
            username: username
        };

        const docRef = doc (db, "users", user.uid);
        setDoc(docRef, userData)
        .then(()=>{
            window.location.href='web.html';
        })
        .catch((error)=>{
            console.error("error writing doc", error);

        })
    })
    /*.catch((error)=>{
        const errorCode = error.code;
        if(errorCode == 'auth/email-already-in-use'){
            
        }
    })*/
  })