// insert-member.js
import { db } from "../JavaScript/firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { fetchFamilyData } from "../JavaScript/render_chart.js"; // ĐÚNG đường dẫn

const form = document.getElementById("addMemberForm");
if (form) {
document.getElementById("addMemberForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;

  const data = {
    "first name": form.firstName.value,
    "last name": form.lastName.value,
    "gender": form.gender.value,
    "avatar": form.avatar.value || "",
    "rels": {
      father: form.father.value || null,
      mother: form.mother.value || null,
      spouses: [],
      children: []
    }
  };

  try {
    const docRef = await addDoc(collection(db, "members"), data);
    alert("✅ Đã thêm thành viên! ID: " + docRef.id);
    form.reset();

    await fetchFamilyData(); // Gọi lại hàm vẽ cây

    
  } catch (err) {
    alert("❌ Lỗi: " + err.message);
  }
});
}

/*if (formValues) {
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
  });*/

if (formValues) {
  const newRef = await addDoc(...); // ✅ bạn phải tạo biến này trước đã
  const newId = newRef.id;

// 🔁 Cập nhật CHA
if (formValues.father) {
  const fatherRef = doc(db, "members", formValues.father);
  const fatherSnap = await getDoc(fatherRef);
  if (fatherSnap.exists()) {
    const fatherData = fatherSnap.data();
    const currentChildren = Array.isArray(fatherData?.rels?.children) ? fatherData.rels.children : [];
    if (!currentChildren.includes(newId)) {
      await updateDoc(fatherRef, {
        "rels.children": [...currentChildren, newId]
      });
    }
  }
}

// 🔁 Cập nhật MẸ
if (formValues.mother) {
  const motherRef = doc(db, "members", formValues.mother);
  const motherSnap = await getDoc(motherRef);
  if (motherSnap.exists()) {
    const motherData = motherSnap.data();
    const currentChildren = Array.isArray(motherData?.rels?.children) ? motherData.rels.children : [];
    if (!currentChildren.includes(newId)) {
      await updateDoc(motherRef, {
        "rels.children": [...currentChildren, newId]
      });
    }
  }
}

}

  Swal.fire('✅ Thành công!', 'Đã thêm thành viên.', 'success');
  fetchFamilyData(); // Vẽ lại cây
/*}*/

