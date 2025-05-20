// totien.js
import { app, db } from "../JavaScript/firebase-config.js";
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const openFormBtn = document.getElementById("openForm");
  const popupForm = document.getElementById("popupForm");
  const cancelBtn = document.getElementById("cancel");
  const createBtn = document.getElementById("create");
  const ancestorList = document.getElementById("ancestorList");

  const nameInput = document.getElementById("name");
  const genderInput = document.getElementById("gender");
  const birthInput = document.getElementById("birth");
  const descInput = document.getElementById("desc");
  const imgInput = document.getElementById("imgInput");
  const preview = document.getElementById("preview");

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const filterGender = document.getElementById("filterGender");
  const applyFilter = document.getElementById("applyFilter");

  let avatarURL = "https://via.placeholder.com/100";
  let editingDocId = null;

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
        
        localStorage.setItem("role", role);

        // Nếu là user → ẩn form và tiêu đề
        if (role === "user") {
          const hide_totien_user = document.getElementById("openForm");
          if (hide_totien_user) hide_totien_user.style.display = "none";
        }
      }
    }
  });
  // Mở form
  openFormBtn.onclick = () => {
    resetForm();
    popupForm.style.display = "flex";
  };

  // Đóng form
  cancelBtn.onclick = () => {
    popupForm.style.display = "none";
    editingDocId = null;
  };

  // Ảnh preview
  imgInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarURL = e.target.result;
        preview.src = avatarURL;
      };
      reader.readAsDataURL(file);
    }
  };

  // Tạo hoặc cập nhật
  createBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const gender = genderInput.value;
    const birth = birthInput.value;
    const desc = descInput.value.trim();

    if (!name || !gender || !birth) {
      alert("❗ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const data = { name, gender, birth, desc, avatar: avatarURL };

    try {
      if (editingDocId) {
        await updateDoc(doc(db, "ancestors", editingDocId), data);
        alert("✅ Đã cập nhật!");
        editingDocId = null;
      } else {
        await addDoc(collection(db, "ancestors"), {
          ...data,
          createdAt: new Date()
        });
        alert("✅ Đã thêm mới!");
      }
      popupForm.style.display = "none";
      renderAncestors();
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      alert("Lỗi xảy ra!");
    }
  };

  // Hiển thị danh sách
  async function renderAncestors(keyword = "", genderFilter = "") {
  const querySnapshot = await getDocs(collection(db, "ancestors"));
  ancestorList.innerHTML = "";
  const currentRole = localStorage.getItem("role") || "user";

  querySnapshot.forEach((docSnap) => {

    const data = docSnap.data();
    const id = docSnap.id;

    const nameMatch = data.name.toLowerCase().includes(keyword.toLowerCase());
    const genderMatch = !genderFilter || data.gender === genderFilter;

    if (!nameMatch || !genderMatch) return; // nếu không khớp thì bỏ qua

    const card = document.createElement("div");
    card.className = "ancestor-card";
    card.setAttribute("data-gender", data.gender);
    card.innerHTML = `
      <img src="${data.avatar || 'https://via.placeholder.com/100'}" />
      <h4>${data.name}</h4>
      <p>${data.birth}</p>
      <p>${data.desc}</p>
      <div class="actions">
        <button class="edit-btn"><i class="fa-regular fa-pen-to-square"></i></button>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    if (currentRole === "user") {
      card.querySelector(".edit-btn").style.display = "none";
      card.querySelector(".delete-btn").style.display = "none";
    } 

    card.querySelector(".edit-btn").onclick = () => {
      nameInput.value = data.name;
      genderInput.value = data.gender;
      birthInput.value = data.birth;
      descInput.value = data.desc;
      preview.src = data.avatar;
      avatarURL = data.avatar;
      editingDocId = id;
      popupForm.style.display = "flex";
    };

    card.querySelector(".delete-btn").onclick = async () => {
      const confirm = window.confirm(`Xóa tổ tiên: ${data.name}?`);
      if (confirm) {
        await deleteDoc(doc(db, "ancestors", id));
        renderAncestors(keyword, genderFilter); // giữ lại filter khi xóa
        alert("🗑️ Đã xóa!");
      }
    };

    ancestorList.appendChild(card);
  });
}


  function resetForm() {
    nameInput.value = "";
    genderInput.value = "";
    birthInput.value = "";
    descInput.value = "";
    preview.src = "https://via.placeholder.com/100";
    avatarURL = "https://via.placeholder.com/100";
    editingDocId = null;
    imgInput.value = "";
  }

  searchBtn.onclick = () => {
  const keyword = searchInput.value.trim();
  const gender = filterGender.value;
  renderAncestors(keyword, gender);
};

applyFilter.onclick = () => {
  const keyword = searchInput.value.trim();
  const gender = filterGender.value;
  renderAncestors(keyword, gender);
};

  renderAncestors();
});