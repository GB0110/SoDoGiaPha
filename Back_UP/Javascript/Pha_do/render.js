// render-chart.js
import { db } from '../fconfig.js';
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

let currentContainer = null;

// tải dữ liệu từ  firestore cụ thể là collection 'members'
async function fetchFamilyData() {

    console.log("📥 Bắt đầu fetch dữ liệu thành viên từ Firestore"); // <-- Debug

    const snapshot = await getDocs(collection(db, "members")); //lất tất cả dữ liệu members
    const data = [];

    snapshot.forEach(docSnap => {
        const item = docSnap.data(); //mỗi thành viên

        console.log("📦 Dữ liệu render:", data);

        const rels = item.rels || {};// rels là các mối quan hệ
        // ✅ Cảnh báo nếu thiếu "rels"
        if (!item.rels) {
            console.warn("⚠️ Document thiếu rels:", docSnap.id);
        }

        // mảng chứa thông tin đầy đủ từng thành viên
        data.push({
            id: docSnap.id,
            data: {
                id: docSnap.id,
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

//vẽ
function renderChart(data) {
    const cont = document.querySelector("#FamilyChart"); //lấy thẻ html sẽ hiển thị

    // 👉 Xoá cây cũ trước khi vẽ lại
    if (cont && cont.innerHTML !== "") {
        cont.innerHTML = "";
        console.log("🖼️ Đang render lại biểu đồ với", data.length, "thành viên"); // <-- Debug
    }

    //lưu dữ liệu và trạng thái của cây gia phả
    const store = f3.createStore({
        data,
        node_separation: 250,
        level_separation: 150
    });
    //phần nền hiển thị biểu đồ
    const svg = f3.createSvg(cont);
    //card hiển thị mỗi thành viên 
    const Card = f3.elements.Card({
        store,
        svg,
        card_dim: { w: 220, h: 70, text_x: 75, text_y: 15, img_w: 60, img_h: 60, img_x: 5, img_y: 5 }, //kích thước, vị trí chữ, ảnh    
        card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],// hiển thị tên
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
                Swal.fire('Chưa xử lý sửa', '', 'info');
            } else if (result.isDenied) {
                await deleteDoc(doc(db, "members", d.id));
                Swal.fire('Đã xoá', '', 'success');
                fetchFamilyData();
            }}
        });
        //vẽ lạilại
        store.setOnUpdate(props => f3.view(store.getTree(), svg, Card, props || {}));
        //khởi tạo lại  
        store.updateTree({ initial: true });
        window.f3 = f3;
        f3.store = store;
        console.log("Cây hiện tại:", f3.store.getTree());

        currentContainer = cont;
    }

    fetchFamilyData();

    export { fetchFamilyData }; // BẮT BUỘC PHẢI CÓ

