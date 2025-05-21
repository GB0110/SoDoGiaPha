const openFormBtn = document.getElementById('openForm');
const popupPost = document.getElementById('popupPost');
const btnCancelPost = document.getElementById('btnCancelPost');
const postForm = document.getElementById('postForm');

openFormBtn.addEventListener('click', () => {
  popupPost.style.display = 'flex';
});

btnCancelPost.addEventListener('click', () => {
  popupPost.style.display = 'none';
  postForm.reset();
  document.getElementById('imagePreview').style.display = 'none';
});

postForm.addEventListener('submit', function(e) {
  e.preventDefault(); // ngăn reload trang

  const title = document.getElementById('postTitle').value.trim();
  const author = document.getElementById('postAuthor').value.trim();
  const date = document.getElementById('postDate').value;
  const category = document.getElementById('postCategory').value;
  const imageInput = document.getElementById('postImage');
  const postsContainer = document.getElementById('postsContainer');

  // Tạo thẻ bài viết mới
  const postDiv = document.createElement('div');
  postDiv.classList.add('post-item');
  postDiv.style.border = '1px solid #ccc';
  postDiv.style.padding = '10px';
  postDiv.style.marginBottom = '10px';

  // Hàm thêm thông tin văn bản (tiêu đề, tác giả, ngày, chuyên mục)
  function addPostInfo() {
    // Tiêu đề
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    postDiv.appendChild(titleEl);

    // Tác giả
    const authorEl = document.createElement('p');
    authorEl.textContent = 'Tác giả: ' + author;
    postDiv.appendChild(authorEl);

    // Ngày đăng
    const dateEl = document.createElement('p');
    if (date) {
      // Đổi định dạng yyyy-mm-dd thành dd/mm/yyyy
      const formattedDate = date.split('-').reverse().join('/');
      dateEl.textContent = 'Ngày đăng: ' + formattedDate;
    } else {
      dateEl.textContent = 'Ngày đăng: N/A';
    }
    postDiv.appendChild(dateEl);

    // Chuyên mục
    const categoryEl = document.createElement('p');
    categoryEl.textContent = 'Chuyên mục: ' + category;
    postDiv.appendChild(categoryEl);

    // Thêm thẻ bài viết vào container
    postsContainer.appendChild(postDiv);

    // Reset form sau khi thêm
    postForm.reset();
    popupPost.style.display = 'none';
  }

  // Nếu có ảnh, đọc ảnh rồi thêm
  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.maxWidth = '300px';
      img.style.display = 'block';
      img.style.marginBottom = '10px';
      postDiv.appendChild(img);

      addPostInfo();
    }
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    // Không có ảnh thì chỉ thêm thông tin
    addPostInfo();
  }
});

//Nút xoá
const deleteBtn = document.getElementById('delete-card');
const postsContainer = document.getElementById('postsContainer');

let isDeleteMode = false;

deleteBtn.addEventListener('click', () => {
  if (!isDeleteMode) {
    // Bật chế độ chọn xoá
    isDeleteMode = true;
    deleteBtn.textContent = 'Xác nhận xoá';

    // Thêm checkbox vào từng bài viết
    const posts = postsContainer.querySelectorAll('.post-item');
    posts.forEach(post => {
      let checkbox = post.querySelector('.delete-checkbox');
      if (!checkbox) {
        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('delete-checkbox');
        // Style checkbox: position góc trên phải
        checkbox.style.position = 'absolute';
        checkbox.style.top = '5px';
        checkbox.style.right = '5px';
        checkbox.style.width = '18px';
        checkbox.style.height = '18px';
        post.style.position = 'relative'; // để checkbox đúng góc
        post.appendChild(checkbox);
      }
      checkbox.style.display = 'block';
    });

  } else {
    // Chế độ xoá đang bật -> xoá bài viết được chọn
    const checkboxes = postsContainer.querySelectorAll('.delete-checkbox:checked');
    checkboxes.forEach(cb => {
      const post = cb.closest('.post-item');
      if (post) {
        post.remove();
      }
    });

    // Ẩn checkbox và reset trạng thái
    const allCheckboxes = postsContainer.querySelectorAll('.delete-checkbox');
    allCheckboxes.forEach(cb => {
      cb.checked = false;
      cb.style.display = 'none';
    });

    isDeleteMode = false;
    deleteBtn.textContent = 'Xoá';
  }
});
//==============================================================
//Chức năng tìm kiếm theo tiêu đề

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Hàm tìm kiếm bài viết theo tiêu đề
function searchPosts() {
  const searchText = searchInput.value.toLowerCase();
  const posts = Array.from(postsContainer.querySelectorAll('.post-item'));

  posts.forEach(post => {
    const title = post.querySelector('h3')?.textContent.toLowerCase() || '';
    if (title.includes(searchText)) {
      post.style.display = 'flex';
    } else {
      post.style.display = 'none';
    }
  });
}

searchBtn.addEventListener('click', () => {
  searchPosts();
});

// Tìm kiếm realtime khi nhập
searchInput.addEventListener('input', () => {
  searchPosts();
});

//===========================================================
//Chức năng lọc theo ngày

const filterDate = document.getElementById('filterDate');
const applyFilterBtn = document.getElementById('applyFilter');

function getPostDate(post) {
  const pTags = post.querySelectorAll('p');
  for (const p of pTags) {
    if (p.textContent.startsWith('Ngày đăng:')) {
      const dateStr = p.textContent.replace('Ngày đăng:', '').trim(); // dd/mm/yyyy
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
  }
  return null;
}

function filterPostsByDate() {
  const filterValue = filterDate.value; // all, newest, oldest
  const posts = Array.from(postsContainer.querySelectorAll('.post-item'));

  // Nếu 'all' thì hiện hết mà không sắp xếp
  if (filterValue === 'all') {
    posts.forEach(post => post.style.display = 'flex');
    return;
  }

  // Sắp xếp bài viết theo ngày
  let sortedPosts = posts.slice(); // copy mảng

  sortedPosts.sort((a, b) => {
    const dateA = getPostDate(a) || new Date(0);
    const dateB = getPostDate(b) || new Date(0);
    return filterValue === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Ẩn hết trước
  posts.forEach(post => post.style.display = 'none');

  // Hiện theo thứ tự sắp xếp
  sortedPosts.forEach(post => post.style.display = 'flex');
}

applyFilterBtn.addEventListener('click', () => {
  filterPostsByDate();
});


