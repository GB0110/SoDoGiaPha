// =====================================================
// ✅ Chức năng: Thêm + Sửa thành viên (chọn ảnh từ tệp)
// =====================================================

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { app, db } from "../fconfig.js";
import { fetchFamilyData } from "../Pha_do/render.js";
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

const auth = getAuth(app);
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const role = docSnap.data().role;
      if (role === "user") {
        ["addMemberBtn", "editMemberBtn", "deleteMemberBtn"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = "none";
        });
      }
    }
  }
});

function buildOptions(members) {
  return members.map(m => `<option value="${m.id}">${m.name}</option>`).join("");
}

async function updateRelation(targetId, field, newId) {
  const ref = doc(db, "members", targetId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    const list = Array.isArray(data.rels?.[field]) ? data.rels[field] : [];
    if (!list.includes(newId)) {
      await updateDoc(ref, { [`rels.${field}`]: [...list, newId] });
    }
  }
}

function buildGenderRow(defaultVal = "M") {
  return `
    <div style="margin: 10px 0;">
      <label><input type="radio" name="gender" value="M" ${defaultVal === 'M' ? 'checked' : ''}> Nam</label>
      <label style="margin-left: 20px;"><input type="radio" name="gender" value="F" ${defaultVal === 'F' ? 'checked' : ''}> Nữ</label>
    </div>`;
}

function buildSelectRow(label, id, options, selected = "") {
  return `<select id="${id}" class="swal2-input">
    <option value="">-- ${label} --</option>
    ${options.map(o => `<option value="${o.id}" ${o.id === selected ? "selected" : ""}>${o.name}</option>`).join("")}
  </select>`;
}

// ===== Thêm =====
document.getElementById("addMemberBtn").addEventListener("click", async () => {
  const membersSnap = await getDocs(collection(db, "members"));
  const members = membersSnap.docs.map(docSnap => {
    const data = docSnap.data();
    return { id: docSnap.id, name: `${data["first name"]} ${data["last name"]}` };
  });

  const result = await Swal.fire({
    title: "Thêm thành viên",
    html: `
      <input id="firstName" class="swal2-input" placeholder="Tên">
      <input id="lastName" class="swal2-input" placeholder="Họ">
      <input id="birthday" type="date" class="swal2-input">
      <input type="file" id="avatarInput" accept="image/*" class="swal2-file">
      ${buildGenderRow()}
      ${buildSelectRow("Cha", "father", members)}
      ${buildSelectRow("Mẹ", "mother", members)}
      ${buildSelectRow("Vợ/Chồng", "spouse", members)}
    `,
    showCancelButton: true,
    confirmButtonText: 'Thêm',
    preConfirm: async () => {
      const file = document.getElementById("avatarInput").files[0];
      let avatar = "avatar-default.png";
      if (file) {
        avatar = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.onerror = err => reject(err);
          reader.readAsDataURL(file);
        });
      }

      return {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        birthday: document.getElementById("birthday").value.trim(),
        avatar,
        gender: document.querySelector('input[name="gender"]:checked').value,
        father: document.getElementById("father").value || null,
        mother: document.getElementById("mother").value || null,
        spouse: document.getElementById("spouse").value || null
      };
    }
  });

  if (!result.value) return;
  const data = result.value;

  const newRef = await addDoc(collection(db, "members"), {
    "first name": data.firstName,
    "last name": data.lastName,
    birthday: data.birthday,
    avatar: data.avatar,
    gender: data.gender,
    rels: {
      father: data.father,
      mother: data.mother,
      spouses: data.spouse ? [data.spouse] : [],
      children: []
    }
  });

  const newId = newRef.id;
  if (data.father) await updateRelation(data.father, "children", newId);
  if (data.mother) await updateRelation(data.mother, "children", newId);
  if (data.spouse) await updateRelation(data.spouse, "spouses", newId);

  await Swal.fire("✅ Đã thêm", "Thành viên mới đã được lưu", "success");
  fetchFamilyData();
});

// ===== Sửa =====
document.getElementById("editMemberBtn").onclick = async () => {
  const snapshot = await getDocs(collection(db, "members"));
  const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const options = members.map(m => `<option value="${m.id}">${m["first name"]} ${m["last name"]}</option>`).join("");

  const { value: selectedId } = await Swal.fire({
    title: "Chọn thành viên để sửa",
    html: `<select id="selectMember" class="swal2-input"><option value="">-- Chọn --</option>${options}</select>`,
    preConfirm: () => document.getElementById("selectMember").value
  });

  if (!selectedId) return;
  const m = members.find(m => m.id === selectedId);

  const result = await Swal.fire({
    title: `Sửa: ${m["first name"]} ${m["last name"]}`,
    html: `
      <input id="firstName" class="swal2-input" value="${m["first name"]}" placeholder="Tên">
      <input id="lastName" class="swal2-input" value="${m["last name"]}" placeholder="Họ">
      <input id="birthday" type="date" class="swal2-input" value="${m.birthday || ''}">
      <input type="file" id="avatarInput" accept="image/*" class="swal2-file">
      ${buildGenderRow(m.gender)}
    `,
    showCancelButton: true,
    confirmButtonText: "Lưu",
    preConfirm: async () => {
      let avatar = m.avatar;
      const file = document.getElementById("avatarInput").files[0];
      if (file) {
        avatar = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.onerror = err => reject(err);
          reader.readAsDataURL(file);
        });
      }

      return {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        birthday: document.getElementById("birthday").value.trim(),
        avatar,
        gender: document.querySelector('input[name="gender"]:checked').value
      };
    }
  });

  if (!result.value) return;

  await updateDoc(doc(db, "members", selectedId), {
    "first name": result.value.firstName,
    "last name": result.value.lastName,
    birthday: result.value.birthday,
    avatar: result.value.avatar,
    gender: result.value.gender
  });

  await Swal.fire("✔️ Đã lưu", "Thông tin đã cập nhật", "success");
  fetchFamilyData();
};