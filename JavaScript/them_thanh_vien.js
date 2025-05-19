// insert-member.js
import { db } from "../JavaScript/firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { fetchFamilyData } from "../JavaScript/render_chart.js"; // ĐÚNG đường dẫn

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
