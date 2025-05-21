document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById('openForm');
  const postEditOverlay = document.getElementById('postOverlay');
  const cancelBtn = document.getElementById('cancel');
  const createBtn = document.getElementById('create');
  const saveDraftBtn = document.getElementById('saveDraft');
  const postTableBody = document.getElementById('postTableBody');

  const postTitle = document.getElementById('post-title');
  const postContent = document.getElementById('post-content');
  const category = document.getElementById('category');
  const newCategory = document.getElementById('newCategory');

  let editingRow = null;

  openBtn?.addEventListener('click', () => {
    postEditOverlay?.classList.add('active');
    editingRow = null;
    clearForm();
  });

  cancelBtn?.addEventListener('click', () => {
    postEditOverlay?.classList.remove('active');
    clearForm();
    editingRow = null;
  });

  postEditOverlay?.addEventListener('click', (e) => {
    if (e.target === postEditOverlay) {
      postEditOverlay.classList.remove('active');
      clearForm();
      editingRow = null;
    }
  });

  // ✅ Tạo hoặc cập nhật bài viết (dùng chung cho "Tạo" và "Bản nháp")
  function addOrUpdatePost(status) {
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    const selectedCategory = category.value || newCategory.value.trim();
    const date = new Date().toLocaleDateString('vi-VN');

    if (!title || !selectedCategory || !content) {
      alert("Vui lòng nhập đầy đủ thông tin bài viết.");
      return;
    }

    if (editingRow) {
      editingRow.cells[1].textContent = title;
      editingRow.cells[2].textContent = selectedCategory;
      editingRow.cells[3].textContent = date;
      editingRow.cells[4].textContent = status;
      editingRow = null;
    } else {
      const row = document.createElement("tr");
      const rowHTML = `
        <td>${postTableBody.children.length + 1}</td>
        <td>${title}</td>
        <td>${selectedCategory}</td>
        <td>${date}</td>
        <td>${status}</td>
        <td>
          <button class="edit-btn">Sửa</button>
          <button class="delete-btn">Xoá</button>
        </td>
      `;
      row.innerHTML = rowHTML;
      postTableBody.appendChild(row);
    }

    postEditOverlay.classList.remove("active");
    clearForm();
  }

  createBtn?.addEventListener('click', () => {
    addOrUpdatePost("Đã đăng");
  });

  saveDraftBtn?.addEventListener('click', () => {
    addOrUpdatePost("Bản nháp");
  });

  // ✅ Sửa và xoá dòng
  postTableBody.addEventListener("click", (e) => {
    const target = e.target;
    const row = target.closest("tr");

    // Sửa
    if (target.classList.contains("edit-btn")) {
      editingRow = row;
      postTitle.value = row.cells[1].textContent;
      category.value = row.cells[2].textContent;
      postContent.value = "";
      newCategory.value = "";
      postEditOverlay.classList.add("active");
    }

    // Xoá
    if (target.classList.contains("delete-btn")) {
      if (confirm("Bạn có chắc chắn muốn xoá bài viết này không?")) {
        row.remove();
        updateSTT();
      }
    }
  });

  function clearForm() {
    postTitle.value = '';
    postContent.value = '';
    category.selectedIndex = 0;
    newCategory.value = '';
    document.getElementById('image-upload').value = '';
  }

  function updateSTT() {
    const rows = postTableBody.getElementsByTagName("tr");
    Array.from(rows).forEach((row, index) => {
      row.cells[0].textContent = index + 1;
    });
  }

  document.getElementById("addCategoryBtn").addEventListener("click", () => {
    const newCat = newCategory.value.trim();
    if (newCat) {
      const option = document.createElement("option");
      option.value = newCat;
      option.textContent = newCat;
      category.appendChild(option);
      category.value = newCat;
      newCategory.value = '';
    }
  });

  document.getElementById("applyFilter").addEventListener("click", () => {
    const searchKeyword = document.getElementById("searchInput").value.toLowerCase();
    const filterType = document.getElementById("filterDate").value;
    const rows = Array.from(postTableBody.getElementsByTagName("tr"));

    let filteredRows = rows.filter(row => {
      const title = row.cells[1].textContent.toLowerCase();
      return title.includes(searchKeyword);
    });

    filteredRows.sort((a, b) => {
      const dateA = new Date(a.cells[3].textContent.split("/").reverse().join("-"));
      const dateB = new Date(b.cells[3].textContent.split("/").reverse().join("-"));
      if (filterType === "newest") return dateB - dateA;
      if (filterType === "oldest") return dateA - dateB;
      return 0;
    });

    postTableBody.innerHTML = "";
    filteredRows.forEach((row, index) => {
      row.cells[0].textContent = index + 1;
      postTableBody.appendChild(row);
    });
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    const searchKeyword = document.getElementById("searchInput").value.toLowerCase();
    const rows = Array.from(postTableBody.getElementsByTagName("tr"));

    const filteredRows = rows.filter(row => {
      const title = row.cells[1].textContent.toLowerCase();
      return title.includes(searchKeyword);
    });

    postTableBody.innerHTML = "";
    filteredRows.forEach((row, index) => {
      row.cells[0].textContent = index + 1;
      postTableBody.appendChild(row);
    });
  });
});
