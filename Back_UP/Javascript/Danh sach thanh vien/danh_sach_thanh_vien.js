// danh_sach_thanh_vien.js
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { db } from "../fconfig.js";

let members = [];
let currentEditId = null;
let currentDeleteId = null;

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
    return {
      id: doc.id,
      name: `${data["first name"]} ${data["last name"]}`
    };
  });

  const options = allMembers.map(member => `<option value="${member.id}">${member.name}</option>`).join("");

  document.getElementById("addFather").innerHTML = `<option value="">-- Không chọn --</option>` + options;
  document.getElementById("addMother").innerHTML = `<option value="">-- Không chọn --</option>` + options;
  document.getElementById("addSpouse").innerHTML = `<option value="">-- Không chọn --</option>` + options;
}

async function getMemberNameById(id) {
  if (!id) return "";
  const ref = doc(db, "members", id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    return `${data["first name"]} ${data["last name"]}`;
  }
  return "(không rõ)";
}

async function loadMembersFromFirestore() {
  const snapshot = await getDocs(collection(db, "members"));
  members = await Promise.all(snapshot.docs.map(async docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: `${data["first name"]} ${data["last name"]}`,
      gender: data.gender === "M" ? "Nam" : data.gender === "F" ? "Nữ" : "Khác",
      birth: data.birthday,
      father: await getMemberNameById(data.rels?.father),
      mother: await getMemberNameById(data.rels?.mother),
      spouse: data.rels?.spouses?.[0] ? await getMemberNameById(data.rels.spouses[0]) : "",
      avatar: data.avatar || "avatar-default.png"
    };
  }));
  renderTable(members);
}

function renderTable(data) {
  const tbody = document.getElementById("memberBody");
  tbody.innerHTML = "";
  data.forEach((member, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${member.name}</td>
      <td>${member.gender}</td>
      <td>${member.birth}</td>
      <td>${member.father}</td>
      <td>${member.mother}</td>
      <td>${member.spouse}</td>
      <td>
        <i class="fa fa-edit" onclick="showEditPopup('${member.id}')"></i>
        <i class="fa fa-trash" onclick="showDeletePopup('${member.id}')"></i>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.showEditPopup = function(id) {
  const member = members.find(m => m.id === id);
  if (!member) return;
  document.getElementById("editName").value = member.name;
  document.getElementById("editGender").value = member.gender;
  document.getElementById("editBirth").value = member.birth;
  document.getElementById("editFather").value = member.father;
  document.getElementById("editMother").value = member.mother;
  document.getElementById("editSpouse").value = member.spouse;
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
        father,
        mother,
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

  // Cập nhật cha, mẹ: thêm con vào danh sách children
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

  // Cập nhật ngược lại cho spouse
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
};

window.showAllMembers = function() {
  document.getElementById("searchInput").value = "";
  renderTable(members);
};

loadMembersFromFirestore();