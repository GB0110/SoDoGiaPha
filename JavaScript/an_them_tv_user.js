import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { addDoc, collection, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { app, db } from "../JavaScript/firebase-config.js";


const auth = getAuth(app);
//const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    console.log("Đang kiểm tra vai trò...");//debug
  if (user) {
    console.log("✅ Đã đăng nhập với UID:", user.uid); //debug
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const role = docSnap.data().role;
      console.log("Vai trò của người dùng là:", role);//debug

      // Nếu là user → ẩn form và tiêu đề
      if (role === "user") {
        const form = document.getElementById("addMemberBtn");
        if (form) form.style.display = "none";
      }
    }
  }
});

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


const newMemberId = newRef.id;

// ✅ Nếu có cha
if (formValues.father) {
  const fatherRef = doc(db, "members", formValues.father);
  const fatherSnap = await getDoc(fatherRef);
  if (fatherSnap.exists()) {
    const fatherData = fatherSnap.data();
    const currentChildren = fatherData.rels?.children || [];
    if (!currentChildren.includes(newMemberId)) {
      await updateDoc(fatherRef, {
        "rels.children": [...currentChildren, newMemberId]
      });
    }
  }
}

// ✅ Nếu có mẹ
if (formValues.mother) {
  const motherRef = doc(db, "members", formValues.mother);
  const motherSnap = await getDoc(motherRef);
  if (motherSnap.exists()) {
    const motherData = motherSnap.data();
    const currentChildren = motherData.rels?.children || [];
    if (!currentChildren.includes(newMemberId)) {
      await updateDoc(motherRef, {
        "rels.children": [...currentChildren, newMemberId]
      });
    }
  }
}

