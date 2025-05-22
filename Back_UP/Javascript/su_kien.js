import { db } from "../Javascript/fconfig.js";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// DOM elements
const btnAddEvent = document.getElementById("btnAddEvent");
const eventFormContainer = document.getElementById("eventFormContainer");
const btnCancelEvent = document.getElementById("btnCancelEvent");
const eventForm = document.getElementById("eventForm");
const eventItems = document.getElementById("eventItems");

// Ẩn giao diện tạo sự kiện nếu là user
function restrictUIForUser(role) {
  if (role === "user") {
    btnAddEvent?.remove();
    eventFormContainer?.remove();
  }
}

// Kiểm tra role khi đăng nhập
const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;
    restrictUIForUser(role);
  }
});

// Hiển thị form
btnAddEvent?.addEventListener("click", () => {
  eventFormContainer.style.display = "block";
  btnAddEvent.style.display = "none";
});

// Ẩn form
btnCancelEvent?.addEventListener("click", () => {
  eventFormContainer.style.display = "none";
  btnAddEvent.style.display = "inline-block";
  eventForm.reset();
});

// Lưu sự kiện lên Firestore khi submit
eventForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = eventForm.eventName.value;
  const date = eventForm.eventDate.value;
  const location = eventForm.eventLocation.value;

  try {
    await addDoc(collection(db, "events"), {
      name,
      date,
      location,
      createdAt: serverTimestamp()
    });

    alert("✅ Đã thêm sự kiện thành công!");

    // Reset lại form
    eventFormContainer.style.display = "none";
    btnAddEvent.style.display = "inline-block";
    eventForm.reset();
  } catch (error) {
    console.error("❌ Lỗi khi thêm sự kiện:", error);
    alert("❌ Thêm sự kiện thất bại.");
  }
});

// Tự động cập nhật danh sách khi có thay đổi từ Firestore
const loadEvents = () => {
  const q = collection(db, "events");

  onSnapshot(q, (snapshot) => {
    eventItems.innerHTML = ""; // clear cũ

    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${data.name} - ${data.date} - ${data.location}`;
      eventItems.appendChild(li);
    });
  });
};

loadEvents(); // Gọi hàm khi load trang
