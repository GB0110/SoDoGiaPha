import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { app, db } from "../JavaScript/firebase-config.js";

const auth = getAuth(app);
//const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    console.log("Đang kiểm tra vai trò...");//debug
  if (user) {
    console.log("✅ Đã đăng nhập với UID:", user.uid); //debug
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const role = docSnap.data().role;
      console.log("Vai trò của người dùng là:", role);//debug

      // Nếu là user → ẩn form và tiêu đề
      if (role === "user") {
        const form = document.getElementById("addMemberForm");
        const title = document.getElementById("formTitle");
        if (form) form.style.display = "none";
        if (title) title.style.display = "none";
      }
    }
  }
});
