// Import module từ Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js"; // Khởi tạo ứng dụng Firebase 
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js"; //Dùng để truy cập Firestore (cơ sở dữ liệu)

// Thông tin lấy từ Firebase console 
const firebaseConfig = {
  apiKey: "AIzaSyAH4tFSynGg_AbYPsuWQYsyGacphdiBYK8",
  authDomain: "giapha-afc2a.firebaseapp.com",
  projectId: "giapha-afc2a"
};

const app = initializeApp(firebaseConfig); // khởi tạo với cấu hình trên 
const db = getFirestore(app); // khởi tạo firestore từ firebase đã tạo

export { app, db }; // export để các file khác có thể import và dùng chung 