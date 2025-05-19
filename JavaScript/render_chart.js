// render-chart.js
import { db } from "../JavaScript/firebase-config.js";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

let currentContainer = null;

async function fetchFamilyData() {
  console.log("📥 Bắt đầu fetch dữ liệu thành viên từ Firestore"); // <-- Debug
  const snapshot = await getDocs(collection(db, "members"));
  const data = [];

  snapshot.forEach(docSnap => {
    const item = docSnap.data();
    console.log("📦 Dữ liệu render:", data); // ✅ in ở đây mới đúng

    // ✅ Cảnh báo nếu thiếu "rels"
  if (!item.rels) {
    console.warn("⚠️ Document thiếu rels:", docSnap.id);
  }

    data.push({
      id: docSnap.id,
      data: {
        "first name": item["first name"],
        "last name": item["last name"],
        "avatar": item.avatar || "",
        "gender": item.gender
      },
       rels: {
      father: item.rels?.father ?? null,
      mother: item.rels?.mother ?? null,
      spouses: item.rels?.spouses ?? [],
      children: item.rels?.children ?? []
    }
    });
  });

  console.log("✅ Số thành viên lấy được:", data.length); // <-- Debug
  renderChart(data);
}

function renderChart(data) {
  const cont = document.querySelector("#FamilyChart");

  // 👉 Xoá cây cũ trước khi vẽ lại
  if (cont && cont.innerHTML !== "") {
    cont.innerHTML = "";
    
    console.log("🖼️ Đang render lại biểu đồ với", data.length, "thành viên"); // <-- Debug
  }

  const store = f3.createStore({
    data,
    node_separation: 250,
    level_separation: 150
  });
  const svg = f3.createSvg(cont);
  const Card = f3.elements.Card({
    store,
    svg,
    card_dim: { w: 220, h: 70, text_x: 75, text_y: 15, img_w: 60, img_h: 60, img_x: 5, img_y: 5 },
    card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],
    mini_tree: false,
    link_break: false,

    onClick: async (d) => {
    const result = await Swal.fire({
      title: 'Thông tin thành viên',
      html: `<b>${d.data["first name"]} ${d.data["last name"]}</b><br>ID: ${d.id}`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Sửa',
      denyButtonText: 'Xoá'
    });

    if (result.isConfirmed) {
      // TODO: mở form sửa (nếu cần)
      Swal.fire('Chưa xử lý sửa', '', 'info');
    } else if (result.isDenied) {
      await deleteDoc(doc(db, "members", d.id));
      Swal.fire('Đã xoá', '', 'success');
      fetchFamilyData(); // cập nhật lại biểu đồ
    }}
  });

  store.setOnUpdate(props => f3.view(store.getTree(), svg, Card, props || {}));
  store.updateTree({ initial: true });

  currentContainer = cont;
}

fetchFamilyData();

export { fetchFamilyData }; // BẮT BUỘC PHẢI CÓ

