// popup_them_thanh_vien.js
import { db } from "../JavaScript/firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { fetchFamilyData } from "../JavaScript/render_chart.js";

document.getElementById("addMemberBtn").addEventListener("click", async () => {
  const members = await getDocs(collection(db, "members"));
  const options = [];
  members.forEach(docSnap => {
    const data = docSnap.data();
    options.push({ id: docSnap.id, name: `${data["first name"]} ${data["last name"]}` });
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
    customClass: {
      popup: 'rounded-xl p-6'
    },
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
    "birthday": formValues.birthday,
    "avatar": formValues.avatar,
    "gender": formValues.gender,
    rels: {
      father: formValues.father,
      mother: formValues.mother,
      spouses: formValues.spouse ? [formValues.spouse] : [],
      children: []
    }
  });

  const newId = newRef.id;

  // 🔁 Cập nhật cha
  if (formValues.father) {
    const fatherRef = doc(db, "members", formValues.father);
    const fatherSnap = await getDoc(fatherRef);
    if (fatherSnap.exists()) {
      const fatherData = fatherSnap.data();
      const children = Array.isArray(fatherData.rels?.children) ? fatherData.rels.children : [];
      if (!children.includes(newId)) {
        await updateDoc(fatherRef, { "rels.children": [...children, newId] });
      }
    }
  }

  // 🔁 Cập nhật mẹ
  if (formValues.mother) {
    const motherRef = doc(db, "members", formValues.mother);
    const motherSnap = await getDoc(motherRef);
    if (motherSnap.exists()) {
      const motherData = motherSnap.data();
      const children = Array.isArray(motherData.rels?.children) ? motherData.rels.children : [];
      if (!children.includes(newId)) {
        await updateDoc(motherRef, { "rels.children": [...children, newId] });
      }
    }
  }

  // 🔁 Nếu có spouse → cập nhật ngược lại
  if (formValues.spouse) {
    const spouseRef = doc(db, "members", formValues.spouse);
    const spouseSnap = await getDoc(spouseRef);
    if (spouseSnap.exists()) {
      const spouseData = spouseSnap.data();
      const spouses = Array.isArray(spouseData.rels?.spouses) ? spouseData.rels.spouses : [];
      if (!spouses.includes(newId)) {
        await updateDoc(spouseRef, { "rels.spouses": [...spouses, newId] });
      }
    }
  }

  await Swal.fire('✅ Thành công', 'Thành viên đã được thêm.', 'success');
  fetchFamilyData();
});
