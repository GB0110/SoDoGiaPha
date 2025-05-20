
// =====================================================
// ✅ Chức năng: Thêm, sửa, xoá thành viên + phân quyền role từ Firebase
// =====================================================

// --------- [1] Import các thư viện Firebase và SweetAlert2 ----------
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

// --------- [2] Ẩn nút thêm nếu người dùng có role là 'user' ----------
const auth = getAuth(app);
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const role = docSnap.data().role;
      if (role === "user") {
        const addBtn = document.getElementById("addMemberBtn");
        if (addBtn) addBtn.style.display = "none";
        const ediBtn = document.getElementById("editMemberBtn");
        if (ediBtn) ediBtn.style.display = "none";
        const delBtn = document.getElementById("addMemberBtn");
        if (delBtn) delBtn.style.display = "none";
      }
    }
  }
});

// --------- [3] Thêm thành viên ----------
document.getElementById("addMemberBtn").addEventListener("click", async () => {
  const members = await getDocs(collection(db, "members"));
  const options = members.docs.map(docSnap => {
    const data = docSnap.data();
    return { id: docSnap.id, name: `${data["first name"]} ${data["last name"]}` };
  });

  const selectRow = (label, name, options) => `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <label style="width: 100px;">${label}:</label>
      <select name="${name}" class="swal2-input" style="width: 70%;">
        <option value="">-- Không chọn --</option>
        ${options.map(o => `<option value="${o.id}">${o.name}</option>`).join("")}
      </select>
    </div>
  `;

  const genderRow = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <label style="width: 100px;">Giới tính:</label>
      <div style="flex: 1;">
        <label style="margin-right: 20px;"><input type="radio" name="gender" value="M" checked> Nam</label>
        <label><input type="radio" name="gender" value="F"> Nữ</label>
      </div>
    </div>
  `;

  const { value: formValues } = await Swal.fire({
    title: '<strong class="text-2xl">Thêm thành viên</strong>',
    html: `
      <input placeholder="Tên" id="firstName" class="swal2-input">
      <input placeholder="Họ" id="lastName" class="swal2-input">
      <input placeholder="Ngày sinh" id="birthday" class="swal2-input">
      <input placeholder="Link ảnh" id="avatar" class="swal2-input">
      ${genderRow}
      ${selectRow("Cha", "father", options)}
      ${selectRow("Mẹ", "mother", options)}
      ${selectRow("Vợ/Chồng", "spouse", options)}
    `,
    showCancelButton: true,
    confirmButtonText: 'Thêm',
    cancelButtonText: 'Hủy',
    focusConfirm: false,
    customClass: { popup: 'rounded-xl p-6' },
    preConfirm: () => {
      return {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        birthday: document.getElementById("birthday").value.trim(),
        avatar: document.getElementById("avatar").value.trim(),
        gender: document.querySelector('input[name="gender"]:checked').value,
        father: document.querySelector('select[name="father"]').value || null,
        mother: document.querySelector('select[name="mother"]').value || null,
        spouse: document.querySelector('select[name="spouse"]').value || null,
      };
    }
  });

  if (!formValues) return;

  const newRef = await addDoc(collection(db, "members"), {
    "first name": formValues.firstName,
    "last name": formValues.lastName,
    birthday: formValues.birthday,
    avatar: formValues.avatar,
    gender: formValues.gender,
    rels: {
      father: formValues.father,
      mother: formValues.mother,
      spouses: formValues.spouse ? [formValues.spouse] : [],
      children: []
    }
  });

  const newId = newRef.id;
  const updates = [];

  async function updateRelation(targetId, field) {
    const ref = doc(db, "members", targetId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const list = Array.isArray(data.rels?.[field]) ? data.rels[field] : [];
      if (!list.includes(newId)) {
        updates.push(updateDoc(ref, { [`rels.${field}`]: [...list, newId] }));
      }
    }
  }

  if (formValues.father) await updateRelation(formValues.father, 'children');
  if (formValues.mother) await updateRelation(formValues.mother, 'children');
  if (formValues.spouse) await updateRelation(formValues.spouse, 'spouses');

  await Promise.all(updates);
  await Swal.fire('✅ Thành công', 'Thành viên đã được thêm.', 'success');
  await fetchFamilyData(newId);
});

// --------- [4] Sửa thành viên ----------
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
  const memberDoc = members.find(m => m.id === selectedId);

  await Swal.fire({
    title: `Sửa: ${memberDoc["first name"]} ${memberDoc["last name"]}`,
    html: `
      <input id="firstName" class="swal2-input" value="${memberDoc["first name"]}" placeholder="Tên">
      <input id="lastName" class="swal2-input" value="${memberDoc["last name"]}" placeholder="Họ">
      <input id="birthday" class="swal2-input" value="${memberDoc.birthday || ""}" placeholder="Ngày sinh">
      <input id="avatar" class="swal2-input" value="${memberDoc.avatar}" placeholder="Ảnh đại diện (URL)">
      <select id="gender" class="swal2-input">
        <option value="M" ${memberDoc.gender === 'M' ? 'selected' : ''}>Nam</option>
        <option value="F" ${memberDoc.gender === 'F' ? 'selected' : ''}>Nữ</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: "Lưu",
    preConfirm: async () => {
      const updated = {
        "first name": document.getElementById("firstName").value.trim(),
        "last name": document.getElementById("lastName").value.trim(),
        birthday: document.getElementById("birthday").value.trim(),
        avatar: document.getElementById("avatar").value.trim(),
        gender: document.getElementById("gender").value
      };
      await updateDoc(doc(db, "members", selectedId), updated);
      Swal.fire("✔️ Đã cập nhật!", "", "success");
      fetchFamilyData(selectedId);
    }
  });
};

// --------- [5] Xoá thành viên ----------
document.getElementById("deleteMemberBtn").onclick = async () => {
  const snapshot = await getDocs(collection(db, "members"));
  const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const options = members.map(m => `<option value="${m.id}">${m["first name"]} ${m["last name"]}</option>`).join("");

  const { value: selectedId } = await Swal.fire({
    title: "Chọn thành viên để xoá",
    html: `<select id="selectMember" class="swal2-input"><option value="">-- Chọn --</option>${options}</select>`,
    showCancelButton: true,
    confirmButtonText: "Xoá",
    preConfirm: () => document.getElementById("selectMember").value
  });

  if (!selectedId) return;

  const confirm = await Swal.fire({
    title: "Xác nhận xoá?",
    text: "Bạn không thể hoàn tác!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xoá"
  });

  if (confirm.isConfirmed) {
    const updates = [];
    for (const member of members) {
      const rels = member.rels || {};
      const newRels = { ...rels };
      let changed = false;

      if (rels.father === selectedId) newRels.father = null, changed = true;
      if (rels.mother === selectedId) newRels.mother = null, changed = true;
      if (rels.spouses?.includes(selectedId)) newRels.spouses = rels.spouses.filter(id => id !== selectedId), changed = true;
      if (rels.children?.includes(selectedId)) newRels.children = rels.children.filter(id => id !== selectedId), changed = true;

      if (changed) {
        const ref = doc(db, "members", member.id);
        updates.push(updateDoc(ref, { rels: newRels }));
      }
    }

    await Promise.all(updates);
    await deleteDoc(doc(db, "members", selectedId));
    await Swal.fire("🗑️ Đã xoá!", "", "success");
    await fetchFamilyData();
  }
};

document.getElementById("searchBtn").addEventListener("click", async () => {
  const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!keyword) {
    Swal.fire("⚠️ Vui lòng nhập từ khoá để tìm kiếm", "", "warning");
    return;
  }

  const snapshot = await getDocs(collection(db, "members"));
  const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const found = members.find(m => {
    const fullName = `${m["first name"]} ${m["last name"]}`.toLowerCase();
    return fullName.includes(keyword);
  });

  if (!found) {
    Swal.fire("❌ Không tìm thấy", "Không có thành viên nào khớp!", "info");
    return;
  }

  Swal.fire("✅ Đã tìm thấy", `👤 ${found["first name"]} ${found["last name"]}`, "success");

  // ✅ Tìm node trong cây với id nằm trong tree.data.id
  function findNodeInTree(tree, targetId) {
    if (tree.data?.id === targetId) return tree;
    if (!tree.children) return null;
    for (const child of tree.children) {
      const result = findNodeInTree(child, targetId);
      if (result) return result;
    }
    return null;
  }

  if (window.f3 && f3.store) {
    const root = f3.store.getTree();
    const targetNode = findNodeInTree(root, found.id);
    if (targetNode) {
      f3.store.centerNode(targetNode.data.id);
    } else {
      console.warn("❗ Không tìm thấy node trong cây:", found.id);
    }
  }
});


