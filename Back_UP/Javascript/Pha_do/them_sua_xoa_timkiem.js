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
      if (role === "user" || role === "editor") {
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
    showCancelButton: true,
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

// ===== Xoá thành viên =====
document.getElementById("deleteMemberBtn").addEventListener("click", async () => {
  // Lấy danh sách tất cả thành viên từ Firestore
  const snapshot = await getDocs(collection(db, "members"));
  const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Tạo select để người dùng chọn thành viên muốn xoá
  const options = members.map(m =>
    `<option value="${m.id}">${m["first name"]} ${m["last name"]}</option>`).join("");

  const { value: selectedId } = await Swal.fire({
    title: "🗑️ Xoá thành viên",
    html: `<select id="selectDelete" class="swal2-input"><option value="">-- Chọn --</option>${options}</select>`,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    preConfirm: () => document.getElementById("selectDelete").value
  });

  if (!selectedId) return;

  // Xác nhận xoá lần cuối
  const confirm = await Swal.fire({
    title: "⚠️ Bạn có chắc chắn?",
    text: "Thành viên sẽ bị xoá.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ"
  });

  if (!confirm.isConfirmed) return;

  try {
    const updates = [];

    // Duyệt lại toàn bộ thành viên để cập nhật các liên kết liên quan
    for (const docSnap of snapshot.docs) {
      const m = docSnap.data();
      const id = docSnap.id;
      const rels = m.rels || {};
      let updateNeeded = false;
      const newRels = { ...rels };

      // Xoá liên kết nếu có
      if (rels.father === selectedId) {
        newRels.father = null;
        updateNeeded = true;
      }
      if (rels.mother === selectedId) {
        newRels.mother = null;
        updateNeeded = true;
      }
      if (Array.isArray(rels.spouses) && rels.spouses.includes(selectedId)) {
        newRels.spouses = rels.spouses.filter(id => id !== selectedId);
        updateNeeded = true;
      }
      if (Array.isArray(rels.children) && rels.children.includes(selectedId)) {
        newRels.children = rels.children.filter(id => id !== selectedId);
        updateNeeded = true;
      }

      // Nếu có thay đổi thì cập nhật
      if (updateNeeded) {
        updates.push(updateDoc(doc(db, "members", id), { rels: newRels }));
      }
    }

    // Chờ cập nhật tất cả liên kết xong
    await Promise.all(updates);

    // Cuối cùng xoá thành viên chính
    await deleteDoc(doc(db, "members", selectedId));

    await Swal.fire("✅ Đã xoá", "success");
    fetchFamilyData(); // Refresh lại sơ đồ
  } catch (error) {
    console.error("❌ Lỗi khi xoá:", error);
    await Swal.fire("Lỗi", "Không thể xoá thành viên", "error");
  }
});


// ================= TÌM KIẾM THÀNH VIÊN =================
document.getElementById("searchBtn").addEventListener("click", async () => {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!keyword) return;

  const snapshot = await getDocs(collection(db, "members"));
  const members = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const matched = members.filter(m => {
    const fullName = `${m["first name"]} ${m["last name"]}`.toLowerCase();
    return fullName.includes(keyword);
  });

  if (matched.length === 0) {
    return Swal.fire("Không tìm thấy", "Không có thành viên nào khớp từ khóa.", "info");
  }

  const firstMatch = matched[0];
  const fullName = `${firstMatch["first name"]} ${firstMatch["last name"]}`;
  Swal.fire("✅ Đã tìm thấy", `Thành viên: ${fullName}`, "success");
});
