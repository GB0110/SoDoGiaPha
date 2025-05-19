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
  appId: "1:258291985292:web:c4195f1e035b596e7684a9",
  measurementId: "G-2FRDB2XM50"
};

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);


// Hàm đăng ký → dùng Firestore để lưu
window.registerUser = async function (e) {
  e.preventDefault();

  const name = document.querySelector("[name='reg-name']").value;
  const email = document.querySelector("[name='reg-email']").value;
  const password = document.querySelector("[name='reg-password']").value;
  const role = document.querySelector("[name='role']").value;
 console.log("Đang đăng ký:", name, email, role);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
console.log("Đã tạo tài khoản, UID:", user.uid);
    // Lưu dữ liệu vào Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: name,
      email: email,
      role: role
    });
console.log("Ghi dữ liệu vào Firestore thành công!");

    alert("Đăng ký thành công!");
  } catch (error) {
    console.error("Lỗi:", error);
    alert("Lỗi đăng ký: " + error.message);
  }
};


  /*const signUp = document.getElementById("btnRegister");
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
    })
  })*/