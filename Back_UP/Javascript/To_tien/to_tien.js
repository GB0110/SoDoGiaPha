import { app, db } from "../fconfig.js";
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
  let currentUserRole = "user"; // mặc định

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role || "user";
        currentUserRole = role;
        localStorage.setItem("role", role);

        if (role === "user") {
          const hideAddBtn = document.getElementById("openForm");
          if (hideAddBtn) hideAddBtn.style.display = "none";
        }

        renderAncestors(); // chỉ gọi sau khi có role
      }
    }
  });

  // Mở form
  openFormBtn?.addEventListener("click", () => {
    resetForm();
    popupForm.style.display = "flex";
  });

  // Đóng form
  cancelBtn?.addEventListener("click", () => {
    popupForm.style.display = "none";
    editingDocId = null;
  });

  // Preview ảnh
  imgInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarURL = e.target.result;
        preview.src = avatarURL;
      };
      reader.readAsDataURL(file);
    }
  });

  // Thêm hoặc cập nhật tổ tiên
  createBtn?.addEventListener("click", async () => {
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
  });

  // Hiển thị danh sách tổ tiên
  async function renderAncestors(keyword = "", genderFilter = "") {
    const querySnapshot = await getDocs(collection(db, "ancestors"));
    ancestorList.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const nameMatch = data.name.toLowerCase().includes(keyword.toLowerCase());
      const genderMatch = !genderFilter || data.gender === genderFilter;

      if (!nameMatch || !genderMatch) return;

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

      // 🛑 Nếu là user thì ẩn 2 nút
      if (currentUserRole === "user") {
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
        const confirmDelete = window.confirm(`Xóa tổ tiên: ${data.name}?`);
        if (confirmDelete) {
          await deleteDoc(doc(db, "ancestors", id));
          renderAncestors(keyword, genderFilter);
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

  searchBtn?.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    const gender = filterGender.value;
    renderAncestors(keyword, gender);
  });

  applyFilter?.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    const gender = filterGender.value;
    renderAncestors(keyword, gender);
  });
});
