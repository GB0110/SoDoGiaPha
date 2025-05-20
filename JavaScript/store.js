// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

//db_editor.html, db_user.html

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
  console.log("Đang đăng ký:", name, email, role); //DEBUG
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Đã tạo tài khoản, UID:", user.uid); //DEBUG
    // Lưu dữ liệu vào Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: name,
      email: email,
      role: role
    });
    console.log("Ghi dữ liệu vào Firestore thành công!"); //DEBUG

    alert("Đăng ký thành công!");
  } 
  
  catch (error) {
    console.error("Lỗi:", error);
    alert("Lỗi đăng ký: " + error.message);
  }
};

// Hàm đăng nhập → dùng Firestore để lưu
window.loginUser = async function (e) {
  e.preventDefault();

  const email = document.querySelector("[name='log-email']").value;
  const password = document.querySelector("[name='log-password']").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;
    console.log("Đăng nhập thành công! UID:", uid); //DEBUG 
    // 🔥 Lấy thông tin người dùng từ Firestore
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const role = userData.role;
      console.log("Vai trò:", role); //DEBUG 
      // 👉 Redirect hoặc xử lý theo vai trò
      if (role === "admin") {
        window.location.href = "web.html";
      } else if (role === "editor") {
        window.location.href = "db_editor.html";
      } else {
        window.location.href = "db_user.html";
      }
    } else {
      alert("Không tìm thấy thông tin người dùng trong Firestore.");
    }
  } 

  catch (error) {
    console.error("Lỗi đăng nhập:", error);
    alert("Email hoặc mật khẩu không đúng.");
  }
};
