// cấu hình, khởi tạo firebase  
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";// getAuth xử lí đang nhập/đăng kí người dùng  
import { getFirestore, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAH4tFSynGg_AbYPsuWQYsyGacphdiBYK8",
  authDomain: "giapha-afc2a.firebaseapp.com",
  projectId: "giapha-afc2a",
  storageBucket: "giapha-afc2a.firebasestorage.app",
  messagingSenderId: "258291985292",
  appId: "1:258291985292:web:c4195f1e035b596e7684a9",
  measurementId: "G-2FRDB2XM50"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app); //xử lí thao tác liên quan đến tài khoản 
const db = getFirestore(app); // truy cập firestore - database lưu thông tin ngườ dùng  

// registerUser(e) --> Xử lý đăng kí 
//global function 
window.registerUser = async function (e) {
  e.preventDefault(); // ngăn cho không reload lại trang
  // lấy dữ liệu người dùng nhập vào form đăng kí 
  const name = document.querySelector("[name='reg-name']").value;
  const email = document.querySelector("[name='reg-email']").value;
  const password = document.querySelector("[name='reg-password']").value;
  const role = document.querySelector("[name='role']").value;

  console.log("Đang đăng ký:", name, email, role); //DEBUG

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password); // tạo tài khoản mới bằng firebase auth
    const user = userCredential.user; // lưu email/pass và trả lại user  

    console.log("Đã tạo tài khoản, UID:", user.uid); //DEBUG

    //    tạo hoặc ghi đè((firestore -> users -> uid) 
    // await sẽ chờ firestore lưu dữ liệu rồi mới chạy tiếp 
    await setDoc(doc(db, "users", user.uid), {
      username: name,
      email: email,
      role: role
    });

    console.log("Ghi dữ liệu vào Firestore thành công!"); //DEBUG
    
    // hiển thị thông báo 
    alert("Đăng ký thành công!");
  } 
  
  catch (error) {
    console.error("Lỗi:", error);
    alert("Lỗi đăng ký: " + error.message);
  }
};

// Xử lý đăng nhập  
window.loginUser = async function (e) {
  e.preventDefault(); //ngăn reload 

  // lấy thông tin từ form đăng nhập  
  const email = document.querySelector("[name='log-email']").value;
  const password = document.querySelector("[name='log-password']").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password); // kiểm tra coi có đúng với firebase auth không
    const user = userCredential.user; // có thì trả lại user

    const uid = user.uid;
    console.log("Đăng nhập thành công! UID:", uid); //DEBUG 

    // tham chiếu tới firestore 
    const docRef = doc(db, "users", uid);
    // lấy dữ liệu từ docRef  
    const docSnap = await getDoc(docRef);

    // nếu tồn tại 
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const role = userData.role;

      console.log("Vai trò:", role); //DEBUG 

      // xử lý theo vai trò
      if (role === "admin") {
        window.location.href = "quan_tri_vien.html";
      } else if (role === "editor") {
        window.location.href = "su_kien.html";
      } else {
        window.location.href = "pha_do.html";
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
