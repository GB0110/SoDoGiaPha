import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import { db } from "../fconfig.js";

let members = [];
let currentEditId = null;
let currentDeleteId = null;
let currentUserRole = null;

const auth = getAuth();

const memberIdToName = new Map();

async function getCurrentUserRole(uid) {
  if (!uid) return null;
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) return userDoc.data().role || null;
  return null;
}

// Ẩn/hiện UI theo role: ẩn nút thêm, cột chỉnh sửa tiêu đề và ô chỉnh sửa
function handleRoleUI() {
  const addBtn = document.querySelector(".btn-add-member");
  const editColumn = document.querySelector("th.edit-column");
  const tbody = document.getElementById("memberBody");

  if (currentUserRole === "user") {
    if (addBtn) addBtn.style.display = "none";
    if (editColumn) editColumn.style.display = "none";
    tbody.querySelectorAll("td.edit-cell").forEach(td => td.style.display = "none");
  } else {
    if (addBtn) addBtn.style.display = "";
    if (editColumn) editColumn.style.display = "";
    tbody.querySelectorAll("td.edit-cell").forEach(td => td.style.display = "");
  }
}

async function loadMembersFromFirestore() {
  const snapshot = await getDocs(collection(db, "members"));

  memberIdToName.clear();

  members = snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;
    const fullName = `${data["first name"]} ${data["last name"]}`;
    memberIdToName.set(id, fullName);

    return {
      id,
      name: fullName,
      gender: data.gender === "M" ? "Nam" : data.gender === "F" ? "Nữ" : "Khác",
      birth: data.birthday,
      rels: data.rels || {},
      avatar: data.avatar || "avatar-default.png"
    };
  });

  renderTable(members);
  handleRoleUI();
}

function renderTable(data) {
  const tbody = document.getElementById("memberBody");
  tbody.innerHTML = "";

  data.forEach((member, index) => {
    const fatherName = memberIdToName.get(member.rels.father) || "";
    const motherName = memberIdToName.get(member.rels.mother) || "";
    const spouseName = (member.rels.spouses && member.rels.spouses[0])
      ? memberIdToName.get(member.rels.spouses[0]) || ""
      : "";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${member.name}</td>
      <td>${member.gender}</td>
      <td>${member.birth}</td>
      <td>${fatherName}</td>
      <td>${motherName}</td>
      <td>${spouseName}</td>
      <td class="edit-cell">
        <i class="fa fa-edit" onclick="showEditPopup('${member.id}')"></i>
        <i class="fa fa-trash" onclick="showDeletePopup('${member.id}')"></i>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.showPopup = async function(id) {
  document.getElementById(id).classList.add("show");
  if (id === "popupAdd") {
    await populateDropdowns();
  }
};

window.closePopup = function(id) {
  document.getElementById(id).classList.remove("show");
};

async function populateDropdowns() {
  const snapshot = await getDocs(collection(db, "members"));
  const allMembers = snapshot.docs.map(doc => {
    const data = doc.data();
    return { id: doc.id, name: `${data["first name"]} ${data["last name"]}` };
  });

  const options = allMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join("");

  document.getElementById("addFather").innerHTML = `<option value="">-- Không chọn --</option>${options}`;
  document.getElementById("addMother").innerHTML = `<option value="">-- Không chọn --</option>${options}`;
  document.getElementById("addSpouse").innerHTML = `<option value="">-- Không chọn --</option>${options}`;
}

window.showEditPopup = function(id) {
  const member = members.find(m => m.id === id);
  if (!member) return;

  document.getElementById("editName").value = member.name;
  document.getElementById("editGender").value = member.gender;
  document.getElementById("editBirth").value = member.birth;
  document.getElementById("editFather").value = member.rels.father || "";
  document.getElementById("editMother").value = member.rels.mother || "";
  document.getElementById("editSpouse").value = (member.rels.spouses && member.rels.spouses[0]) || "";

  currentEditId = id;
  showPopup("popupEdit");
};

window.handleUpdate = async function() {
  const name = document.getElementById("editName").value.trim();
  const gender = document.getElementById("editGender").value;
  const birth = document.getElementById("editBirth").value;
  const father = document.getElementById("editFather").value.trim();
  const mother = document.getElementById("editMother").value.trim();
  const spouse = document.getElementById("editSpouse").value.trim();

  if (currentEditId && name) {
    const [lastName, ...firstName] = name.split(" ").reverse();
    await updateDoc(doc(db, "members", currentEditId), {
      "first name": firstName.reverse().join(" "),
      "last name": lastName,
      birthday: birth,
      gender: gender === "Nam" ? "M" : gender === "Nữ" ? "F" : "O",
      rels: {
        father: father || null,
        mother: mother || null,
        spouses: spouse ? [spouse] : [],
        children: []
      }
    });
    closePopup("popupEdit");
    await loadMembersFromFirestore();
  }
};

window.showDeletePopup = function(id) {
  const member = members.find(m => m.id === id);
  if (!member) return;
  document.getElementById("deleteName").textContent = member.name;
  currentDeleteId = id;
  showPopup("popupDelete");
};

window.confirmDelete = async function() {
  if (currentDeleteId) {
    await deleteDoc(doc(db, "members", currentDeleteId));
    closePopup("popupDelete");
    await loadMembersFromFirestore();
  }
};

window.handleAdd = async function() {
  const name = document.getElementById("addName").value.trim();
  const gender = document.getElementById("addGender").value;
  const birth = document.getElementById("addBirth").value;
  const father = document.getElementById("addFather").value;
  const mother = document.getElementById("addMother").value;
  const spouse = document.getElementById("addSpouse").value;
  const file = document.getElementById("avatarInput").files[0];

  if (!name || !gender || !birth) {
    alert("⚠️ Vui lòng nhập đầy đủ.");
    return;
  }

  let avatar = "avatar-default.png";
  if (file) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      avatar = e.target.result;
      await addToFirestore(name, gender, birth, father, mother, spouse, avatar);
    };
    reader.readAsDataURL(file);
  } else {
    await addToFirestore(name, gender, birth, father, mother, spouse, avatar);
  }
};

async function addToFirestore(name, gender, birth, father, mother, spouse, avatar) {
  const [lastName, ...firstName] = name.split(" ").reverse();
  const newRef = await addDoc(collection(db, "members"), {
    "first name": firstName.reverse().join(" "),
    "last name": lastName,
    birthday: birth,
    gender: gender === "Nam" ? "M" : gender === "Nữ" ? "F" : "O",
    avatar,
    rels: {
      father: father || null,
      mother: mother || null,
      spouses: spouse ? [spouse] : [],
      children: []
    }
  });

  const newId = newRef.id;

  // Cập nhật quan hệ cha mẹ (thêm con vào children)
  async function updateRelation(targetId, field) {
    const ref = doc(db, "members", targetId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const list = Array.isArray(data.rels?.children) ? data.rels.children : [];
      if (!list.includes(newId)) {
        await updateDoc(ref, { "rels.children": [...list, newId] });
      }
    }
  }
  if (father) await updateRelation(father, 'children');
  if (mother) await updateRelation(mother, 'children');

  // Cập nhật quan hệ vợ/chồng ngược lại
  if (spouse) {
    const spouseRef = doc(db, "members", spouse);
    const spouseSnap = await getDoc(spouseRef);
    if (spouseSnap.exists()) {
      const spouseData = spouseSnap.data();
      const spouseList = spouseData.rels?.spouses || [];
      if (!spouseList.includes(newId)) {
        await updateDoc(spouseRef, {
          "rels.spouses": [...spouseList, newId]
        });
      }
    }
  }

  alert("✅ Thêm thành viên thành công!");
  closePopup("popupAdd");
  await loadMembersFromFirestore();
}

window.previewAvatar = function(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("avatarPreview");
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "avatar-default.png";
  }
};

window.handleSearch = function() {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  const selectedGender = document.getElementById("genderFilter").value;
  const filtered = members.filter(member => {
    const matchKeyword = member.name.toLowerCase().includes(keyword);
    const matchGender = !selectedGender || member.gender === selectedGender;
    return matchKeyword && matchGender;
  });
  renderTable(filtered);
  handleRoleUI(); // Gọi ẩn/hiện lại cột chỉnh sửa sau khi lọc
};

window.showAllMembers = function() {
  document.getElementById("searchInput").value = "";
  renderTable(members);
  handleRoleUI(); // Gọi ẩn/hiện lại cột chỉnh sửa khi hiển thị tất cả
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserRole = await getCurrentUserRole(user.uid);
    handleRoleUI();  // ẩn/hiện UI ngay khi có role
    await loadMembersFromFirestore();
  } else {
    alert("Vui lòng đăng nhập để sử dụng chức năng này.");
  }
});
