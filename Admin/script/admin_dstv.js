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
    const popup = document.getElementById("addMemberPopup");
  const btnAdd = document.querySelector(".btn-add-member");
  const btnClose = document.querySelector(".btn-cancel");
  const btnSubmit = document.querySelector(".btn-submit");

  // Mở popup
function showPopup(id) {
    document.getElementById(id).classList.add("show");
  }

  function closePopup(id) {
    document.getElementById(id).classList.remove("show");
  }

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
   {id:1,name: "Trần Thị Mít", gender: "Nữ",birth: "01/01/1990",father: "Cha A",mother: "Mẹ A",spouse: "Chồng A"},
   {id:2,name: "Trần Thị ba", gender: "Nữ",birth: "03//1790",father: "Cha A",mother: "Mẹ A",spouse: "Chồng A"},
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
        <td>${member.gender}</td>
        <td>${member.birth}</td>
        <td>${member.father}</td>
        <td>${member.mother}</td>
        <td>${member.spouse}</td>
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
  const selectedGender = document.getElementById("genderFilter").value;

  const filtered = members.filter(member => {
    const matchKeyword =
      member.name.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword) ||
      member.role.toLowerCase().includes(keyword);

    const matchGender =
      !selectedGender || member.gender === selectedGender;

    return matchKeyword && matchGender;
  });

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
  const gender = document.getElementById("addGender").value;
  const birth = document.getElementById("addBirth").value;
  const father = document.getElementById("addFather").value.trim();
  const mother = document.getElementById("addMother").value.trim();
  const spouse = document.getElementById("addSpouse").value.trim();
  const file = document.getElementById("avatarInput").files[0];

  //  Kiểm tra dữ liệu trước
  if (!name || !gender || !birth|| !father|| !mother|| !spouse) {
    alert("⚠️ Vui lòng nhập đầy đủ thông tin.");
    return; // Dừng lại
  }

  let avatarUrl = "avatar-default.png";

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      avatarUrl = e.target.result;
      addMemberToList(name, gender, birth,father,mother,spouse, avatarUrl);
    };
    reader.readAsDataURL(file);
  } else {
    addMemberToList(name, gender, birth,father,mother,spouse, avatarUrl);
  }
}

//  Hàm riêng để thêm vào danh sách
function addMemberToList(name, gender, birth,father,mother,spouse, avatarUrl) {
  const newMember = {
    id: Date.now(),
    name,
    gender,
    birth,
    father,
    mother,
    spouse,
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
  document.getElementById("editGender").value = member.gender;
  document.getElementById("editBirth").value = member.birth;
  document.getElementById("editFather").value = member.father;
  document.getElementById("editMother").value = member.mother;
  document.getElementById("editSpouse").value = member.spouse;

    currentEditId = id;
    showPopup("popupEdit");
  }

  function handleUpdate() {
  const name = document.getElementById("editName").value.trim();
  const gender = document.getElementById("editGender").value;
  const birth = document.getElementById("editBirth").value;
  const father = document.getElementById("editFather").value.trim();
  const mother = document.getElementById("editMother").value.trim();
  const spouse = document.getElementById("editSpouse").value.trim();


    const member = members.find(m => m.id === currentEditId);
    if (member && name && gender && birth) {
      member.name = name;
      member.gender = gender;
      member.birth = birth;
      member.father = father;
      member.mother = mother;
      member.spouse = spouse;
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

  function confirmDelete() {
    members = members.filter(m => m.id !== currentDeleteId);
    renderTable(members);
    closePopup("popupDelete");
  }

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

  // Lần đầu hiển thị dữ liệu demo
  renderTable(members);