// hieu ung button menu
const btnOpen = document.getElementById('btn-open');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
 const btnIcon = btnOpen.querySelector('i');

  btnOpen.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    btnOpen.classList.toggle('rotated'); 
  });

// Tạo thẻ tổ tiên
const openFormBtn = document.getElementById('openForm');
const popupForm = document.getElementById('popupForm');
const cancelBtn = document.getElementById('cancel');
const createBtn = document.getElementById('create');
const imgInput = document.getElementById('imgInput');
const preview = document.getElementById('preview');
const nameInput = document.getElementById('name');
const genderInput = document.getElementById('gender');
const birthInput = document.getElementById('birth');
const descInput = document.getElementById('desc');
const ancestorList = document.getElementById('ancestorList');
const searchBtn = document.getElementById('searchBtn');
const filterGender = document.getElementById('filterGender');
const applyFilter = document.getElementById('applyFilter');
// Khai báo thẻ đang chỉnh sửa
let editTarget = null;
// Mở form thông tin tổ tiên khi bấm thêm mới
openFormBtn.onclick = () => {
  popupForm.style.display = 'flex';
    resetForm(); //Xoá dữ liệu cũ
    };
// Đóng form tổ tiên khi bấm huỷ
cancelBtn.onclick = () => {
  popupForm.style.display = 'none';
    editTarget = null; // target sẽ không sửa gì
    };
// Chọn ảnh để xem trước
imgInput.onchange = (e) => {
  const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => preview.src = e.target.result;
      reader.readAsDataURL(file);
      }
    };
//Tạo tổ tiên khi bấm nút tạo
    createBtn.onclick = () => {
      const name = nameInput.value;
      const gender = genderInput.value;
      const birth = birthInput.value;
      const desc = descInput.value;
      const avatar = preview.src;
// Nếu bấm nút chỉnh sửa tổ tiên
      if (editTarget) {
        editTarget.querySelector('img').src = avatar;
        editTarget.querySelector('h4').textContent = name;
        editTarget.querySelectorAll('p')[0].textContent = birth;
        editTarget.querySelectorAll('p')[1].textContent = desc;
        editTarget = null;
      } else {
// hoặc thêm mới dữ liệu trong thẻ tổ tiên
        const card = document.createElement('div');
        card.className = 'ancestor-card';
        card.setAttribute('data-gender', gender);
        card.innerHTML = `
          <img src="${avatar}" />
          <h4>${name}</h4>
          <p>${birth}</p>
          <p>${desc}</p>
          <div class="actions">
            <button class="edit-btn"><i class="fa-regular fa-pen-to-square"></i></button>
            <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
          </div>
        `;

        card.querySelector('.delete-btn').onclick = () => {
          ancestorList.removeChild(card);
        };
        card.querySelector('.edit-btn').onclick = () => {
          editTarget = card;
          nameInput.value = card.querySelector('h4').textContent;
          genderInput.value = card.getAttribute('data-gender') || '';
          birthInput.value = card.querySelectorAll('p')[0].textContent;
          descInput.value = card.querySelectorAll('p')[1].textContent;
          preview.src = card.querySelector('img').src;
          popupForm.style.display = 'flex';
        };

        ancestorList.appendChild(card);
      }
      popupForm.style.display = 'none';
    };

    function resetForm() {
      nameInput.value = '';
      genderInput.value = '';
      birthInput.value = '';
      descInput.value = '';
      preview.src = 'https://via.placeholder.com/100';
      imgInput.value = '';
    }
    // Tìm kiếm tổ tiên theo tên
    searchBtn.addEventListener('click', () => {
      const keyword = searchInput.value.trim().toLowerCase(); // tên tổ tiên nhập vào
      const cards = ancestorList.querySelectorAll('.ancestor-card');
      
      cards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        if (name.includes(keyword)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
// Lọc theo giới tính
applyFilter.addEventListener('click', () => {
  const selectedGender = filterGender.value.toLowerCase();
  const cards = ancestorList.querySelectorAll('.ancestor-card');

  cards.forEach(card => {
    const gender = (card.getAttribute('data-gender') || '').toLowerCase();

    if (!selectedGender || gender === selectedGender) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});


  