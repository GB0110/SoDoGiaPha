// nút menu bật tắt sidebar
const btnOpen = document.getElementById('btn-open');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
 

  btnOpen.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    btnOpen.classList.toggle('rotated');
  });
 // đánh dấu trang đang mở sideabar

   // Lấy tên file hiện tại từ URL
  const currentPage = window.location.pathname.split("/").pop();

  // Duyệt tất cả các menu-btn có data-page
  document.querySelectorAll(".menu-btn").forEach(btn => {
    if (btn.dataset.page === currentPage) {
      btn.classList.add("active");
    }
  });

  // POPPUP
    const popup = document.getElementById("addMemberPopup");
  const btnAdd = document.querySelector(".btn-add-member");
  const btnClose = document.querySelector(".btn-cancel");
  const btnSubmit = document.querySelector(".btn-submit");

  // Mở popup
function showPopup(id) {
    document.getElementById(id).classList.add("show");
  }
 // đóng popup
  function closePopup(id) {
    document.getElementById(id).classList.remove("show");
  }
// kiểm tra nhập thông tin
  function handleAdd() {
    const name = document.getElementById("addName").value.trim();
    const email = document.getElementById("addEmail").value.trim();
    const role = document.getElementById("addRole").value.trim();

    if (name && email && role) {
      alert("✅ Thêm thành viên thành công!");
      closePopup('popupAdd');
    } else {
      alert("⚠️ Vui lòng nhập đầy đủ!");
    }
  }

  function handleUpdate() {
    // Giả định xử lý dữ liệu
    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const role = document.getElementById("editRole").value.trim();
    if (name && email && role) {
      alert("✅ Cập nhật thành công!");
       closePopup('popupEdit');
    } else {
      alert("⚠️ Vui lòng nhập đầy đủ!");
    }
  }

  function handleDelete() {
    alert("🗑️ Đã xóa thành viên!");
    closePopup('popupDelete');
  }
  
 // Dữ liệu demo
  let members = [
    {id:1, name: "Trần Thị Mít", email: "mit@example.com", role: "Admin", status: "Offline" },
    {id:2, name: "Nguyễn Văn A", email: "a@gmail.com", role: "Editor", status: "Online" },
    {id:3, name: "Lê Thị B", email: "b@gmail.com", role: "Viewer", status: "Online" },
    {id:4, name: "Hồ Văn C", email: "c@gmail.com", role: "Editor", status: "Offline" },
  ];

   let currentEditId = null;
  let currentDeleteId = null;
  // Render danh sách vào bảng
  function renderTable(data) {
    const tbody = document.getElementById("memberBody");
    tbody.innerHTML = ""; // Xóa nội dung cũ

    data.forEach((member,index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${member.name}</td>
        <td>${member.email}</td>
        <td>${member.role}</td>
        <td><span class="status ${member.status.toLowerCase()}">${member.status}</span></td>
        <td>
          <i class="fa fa-edit" onclick="showEditPopup(${member.id})"></i>
          <i class="fa fa-trash"  onclick="showDeletePopup(${member.id})"></i>
        </td>
      `;

      tbody.appendChild(row);
    });
  }
  // Tìm kiếm
  function handleSearch() {
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();

    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(keyword)
      //  ||
      // member.email.toLowerCase().includes(keyword) ||
      // member.role.toLowerCase().includes(keyword)
    );

    renderTable(filtered);
  }
  // hiển thì danh sách
  function showAllMembers() {
  document.getElementById("searchInput").value = "";
  renderTable(members);
}
 // === Thêm thành viên ===
function handleAdd() {
  const name = document.getElementById("addName").value.trim();
  const email = document.getElementById("addEmail").value.trim();
  const role = document.getElementById("addRole").value.trim();
  const file = document.getElementById("avatarInput").files[0];

  //  Kiểm tra dữ liệu trước
  if (!name || !email || !role) {
    alert("⚠️ Vui lòng nhập đầy đủ thông tin.");
    return; // Dừng lại
  }

  let avatarUrl = "avatar-default.png";

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      avatarUrl = e.target.result;
      addMemberToList(name, email, role, avatarUrl);
    };
    reader.readAsDataURL(file);
  } else {
    addMemberToList(name, email, role, avatarUrl);
  }
}

//  Hàm riêng để thêm vào danh sách
function addMemberToList(name, email, role, avatarUrl) {
  const newMember = {
    id: Date.now(),
    name,
    email,
    role,
    status: "Online",
    avatar: avatarUrl
  };
  members.push(newMember);
  renderTable(members);
  closePopup('popupAdd');
}


  // === Hiện popup sửa ===
  function showEditPopup(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;

    document.getElementById("editName").value = member.name;
    document.getElementById("editEmail").value = member.email;
    document.getElementById("editRole").value = member.role;

    currentEditId = id;
    showPopup("popupEdit");
  }
 // sửa thành viên
  function handleUpdate() {
    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const role = document.getElementById("editRole").value.trim();

    const member = members.find(m => m.id === currentEditId);
    if (member && name && email && role) {
      member.name = name;
      member.email = email;
      member.role = role;

      renderTable(members);
      closePopup('popupEdit');
    } else {
      alert("⚠️ Nhập thiếu hoặc lỗi khi cập nhật.");
    }
  }

  // === Hiện popup xóa ===
  function showDeletePopup(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;

    document.getElementById("deleteName").textContent = member.name;
    currentDeleteId = id;
    showPopup("popupDelete");
  }
 // xác nhận xóa thành viên
  function confirmDelete() {
    console.log("Đang xóa ID:", currentDeleteId);
    members = members.filter(m => m.id !== currentDeleteId);
    renderTable(members);
    closePopup("popupDelete");
  }

    // xem trước ảnh trước khi chọn file
    function previewAvatar(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("avatarPreview");

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "avatar-default.png"; // reset nếu bỏ chọn
  }
}

  // Lần đầu hiển thị dữ liệu demo
  renderTable(members);