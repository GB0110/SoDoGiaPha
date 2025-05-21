import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { app } from "../Javascript/fconfig.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUserUID = null;
let isLoggingOut = false;

// ================= POPUP =================
window.showPopup = function (id) {
  document.getElementById(id).classList.add("show");

  if (id === "popupUpdate") {
    document.getElementById("updateName").value = document.getElementById("nameInput").value;
    document.getElementById("updateEmail").value = document.getElementById("emailInput").value;
    document.getElementById("updatePhone").value = document.getElementById("phoneInput").value;
    document.getElementById("updateAvatarPreview").src = document.getElementById("profileAvatar").src;
  }
};

window.closePopup = function (id) {
  document.getElementById(id).classList.remove("show");
};

window.previewUpdateAvatar = function (event) {
  const file = event.target.files[0];
  const preview = document.getElementById("updateAvatarPreview");
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "avatar-default.png";
  }
};

// ================= LẤY DỮ LIỆU NGƯỜI DÙNG =================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserUID = user.uid;
    const docRef = doc(db, "users", currentUserUID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById("nameInput").value = data.username || "";
      document.getElementById("emailInput").value = data.email || "";
      document.getElementById("phoneInput").value = data.phone || "";
      if (data.avatar) {
        document.getElementById("profileAvatar").src = data.avatar;
      }
    } else {
      alert("Không tìm thấy thông tin người dùng.");
    }
  } else {
    if (!isLoggingOut) {
      alert("Bạn chưa đăng nhập.");
      window.location.href = "login_register.html";
    }
  }
});

// ================= CẬP NHẬT =================
window.handleUpdateInfo = async function () {
  const name = document.getElementById("updateName").value.trim();
  const email = document.getElementById("updateEmail").value.trim();
  const phone = document.getElementById("updatePhone").value.trim();
  const avatar = document.getElementById("updateAvatarPreview").src;

  if (!name || !email || !phone) {
    alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  try {
    await updateDoc(doc(db, "users", currentUserUID), {
      username: name,
      email: email,
      phone: phone,
      avatar: avatar
    });

    // Update lại giao diện
    document.getElementById("nameInput").value = name;
    document.getElementById("emailInput").value = email;
    document.getElementById("phoneInput").value = phone;
    document.getElementById("profileAvatar").src = avatar;

    alert("✅ Đã cập nhật thành công!");
    closePopup("popupUpdate");
  } catch (error) {
    console.error("❌ Lỗi cập nhật:", error);
    alert("❌ Cập nhật thất bại: " + error.message);
  }
};

// ================= ĐĂNG XUẤT =================
window.handleLogout = function () {
  isLoggingOut = true;
  signOut(auth)
    .then(() => {
      alert("✅ Bạn đã đăng xuất.");
      window.location.href = "login_register.html";
    })
    .catch((error) => {
      console.error("❌ Lỗi đăng xuất:", error);
    });
};
