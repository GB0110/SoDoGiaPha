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
      img.style.maxWidth = '150px';
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
