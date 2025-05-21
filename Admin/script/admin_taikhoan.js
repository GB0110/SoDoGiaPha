// nút menu sidebar
const btnOpen = document.getElementById('btn-open');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
 

  btnOpen.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    btnOpen.classList.toggle('rotated');
  });
//trang nào sẽ sáng menu sidebar đó

   // Lấy tên file hiện tại từ URL
  const currentPage = window.location.pathname.split("/").pop();

  // Duyệt tất cả các menu-btn có data-page
  document.querySelectorAll(".menu-btn").forEach(btn => {
    if (btn.dataset.page === currentPage) {
      btn.classList.add("active");
    }
  });

  // POPPUP
  const btnClose = document.querySelector(".btn-cancel");
  const btnSubmit = document.querySelector(".btn-submit");

  // Mở popup
function showPopup(id) {
    document.getElementById(id).classList.add("show");
  // nếu 
    if (id === "popupUpdate") {
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;
    const phone = document.getElementById('phoneInput').value;
    const avatarSrc = document.getElementById('profileAvatar').src;

    // Nếu có dữ liệu thì gán, nếu rỗng thì không gán
    if (name && email && phone) {
      document.getElementById('updateName').value = name;
      document.getElementById('updateEmail').value = email;
      document.getElementById('updatePhone').value = phone;
      document.getElementById('updateAvatarPreview').src = avatarSrc;
    }
  }
  }
// đóng poppup
  function closePopup(id) {
    document.getElementById(id).classList.remove("show");
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
    // xem trước ảnh
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
// 
function handleUpdateInfo() {
    // Lấy dữ liệu
    const name = document.getElementById('updateName').value.trim();
    const email = document.getElementById('updateEmail').value.trim();
    const phone = document.getElementById('updatePhone').value.trim();
   const avatarSrc = document.getElementById('updateAvatarPreview').src;

    if (!name || !email || !phone) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    // Cập nhật dữ liệu ra form chính
    document.getElementById('nameInput').value = name;
    document.getElementById('emailInput').value = email;
    document.getElementById('phoneInput').value = phone;
    document.getElementById('profileAvatar').src = avatarSrc;

    alert('✅ Cập nhật thành công!');
    closePopup('popupUpdate');
  }

  // Xử lý đăng xuất (demo)
  function handleLogout() {
    alert('Bạn đã đăng xuất thành công!');
    closePopup('popupLogout');
    // Ở đây có thể thêm logic đăng xuất thật nếu có backend
    // VD: window.location.href = 'login.html';

     // Xóa thông tin hiển thị ngoài trang
  document.getElementById('nameInput').value = "";
  document.getElementById('emailInput').value = "";
  document.getElementById('phoneInput').value = "";
  document.getElementById('profileAvatar').src = "avatar-default.png";
  }
  // 
  function previewUpdateAvatar(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("updateAvatarPreview");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "avatar-default.png";
  }
}
