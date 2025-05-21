// ✅ Import Firebase Firestore & Authentication
import {
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { db, app } from "../fconfig.js";

// ============================ SIDEBAR TOGGLE ============================
const btnOpen = document.getElementById('btn-open');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

btnOpen.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  mainContent.classList.toggle('expanded');
  btnOpen.classList.toggle('rotated');
});

// ============================ HIGHLIGHT ACTIVE MENU ============================
const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll(".menu-btn").forEach(btn => {
  if (btn.dataset.page === currentPage) {
    btn.classList.add("active");
  }
});

// ============================ POPUP FUNCTIONS ============================
window.showPopup = function(id) {
  document.getElementById(id).classList.add("show");
};

window.closePopup = function(id) {
  document.getElementById(id).classList.remove("show");
};

let members = [];
let currentEditId = null;
let currentDeleteId = null;

async function loadUsersFromFirestore() {
  const snapshot = await getDocs(collection(db, "users"));
  members = snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.username || "(Không tên)",
      email: data.email || "",
      role: data.role || "",
      status: "Online"
    };
  });
  renderTable(members);
}

function renderTable(data) {
  const tbody = document.getElementById("memberBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  data.forEach((member, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${member.name}</td>
      <td>${member.email}</td>
      <td>${member.role}</td>
      <td><span class="status ${member.status.toLowerCase()}">${member.status}</span></td>
      <td>
        <i class="fa fa-edit" onclick="showEditPopup('${member.id}')"></i>
        <i class="fa fa-trash" onclick="showDeletePopup('${member.id}')"></i>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.handleSearch = function() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  const filtered = members.filter(m => m.name.toLowerCase().includes(keyword));
  renderTable(filtered);
};

window.showAllMembers = function() {
  document.getElementById("searchInput").value = "";
  renderTable(members);
};

window.handleAdd = async function() {
  const name = document.getElementById("addName").value.trim();
  const email = document.getElementById("addEmail").value.trim();
  const role = document.getElementById("addRole").value.trim();
  const password = document.getElementById("addPassword")?.value?.trim();

  if (!name || !email || !role || !password) {
    alert("⚠️ Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  const auth = getAuth(app);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
  username: name,
  email,
  role,
  uid: user.uid
});


    alert("✅ Tạo tài khoản thành công!");
    closePopup("popupAdd");
    await loadUsersFromFirestore();
  } catch (error) {
    console.error("❌ Lỗi tạo tài khoản:", error);
    alert("❌ Lỗi tạo tài khoản: " + error.message);
  }
};

window.showEditPopup = function(id) {
  const member = members.find(m => m.id === id);
  if (!member) return;

  document.getElementById("editName").value = member.name;
  document.getElementById("editEmail").value = member.email;
  document.getElementById("editRole").value = member.role.toLowerCase();
  currentEditId = id;
  showPopup("popupEdit");
};

window.handleUpdate = async function() {
  const name = document.getElementById("editName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const role = document.getElementById("editRole").value.trim();

  if (!name || !email || !role || !currentEditId) {
    alert("⚠️ Nhập thiếu hoặc lỗi khi cập nhật.");
    return;
  }

  await updateDoc(doc(db, "users", currentEditId), {
    username: name,
    email,
    role
  });

  closePopup("popupEdit");
  await loadUsersFromFirestore();
};

window.showDeletePopup = function(id) {
  const member = members.find(m => m.id === id);
  if (!member) return;
  document.getElementById("deleteName").textContent = member.name;
  currentDeleteId = id;
  showPopup("popupDelete");
};

window.confirmDelete = async function() {
  if (!currentDeleteId) return;
  await deleteDoc(doc(db, "users", currentDeleteId));
  closePopup("popupDelete");
  await loadUsersFromFirestore();
};

// Tải dữ liệu khi khởi động
loadUsersFromFirestore();
