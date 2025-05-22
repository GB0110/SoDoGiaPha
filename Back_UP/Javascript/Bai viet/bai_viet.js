import { db } from "../fconfig.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

let currentUserRole = null;
const auth = getAuth();
const openFormBtn = document.getElementById('openForm');
const popupPost = document.getElementById('popupPost');
const btnCancelPost = document.getElementById('btnCancelPost');
const postForm = document.getElementById('postForm');
const deleteBtn = document.getElementById('delete-card');
const postsContainer = document.getElementById('postsContainer');

// ==== Check Role ====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentUserRole = userDoc.data().role;

      // Nếu là user thì ẩn nút thêm, xoá, popup form
      if (currentUserRole === "user") {
        openFormBtn?.remove();
        deleteBtn?.remove();
        popupPost?.remove();
      }
    }
    renderPosts();
  }
});

// ==== Mở form thêm ====
openFormBtn?.addEventListener('click', () => {
  popupPost.style.display = 'flex';
  document.getElementById("editingPostId").value = "";
});

// ==== Hủy form ====
btnCancelPost?.addEventListener('click', () => {
  popupPost.style.display = 'none';
  postForm.reset();
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById("editingPostId").value = "";
});

// ==== Thêm/Sửa ====
postForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const author = document.getElementById('postAuthor').value.trim();
  const date = document.getElementById('postDate').value;
  const category = document.getElementById('postCategory').value;
  const imageInput = document.getElementById('postImage');
  const editingPostId = document.getElementById('editingPostId').value;

  let imageUrl = "";

  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      imageUrl = e.target.result;
      await savePost(editingPostId);
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    await savePost(editingPostId);
  }
//lưu bài viết 
  async function savePost(id) {
    const postData = { title, content, author, date, category, imageUrl };
    try {
      if (id) {
        await updateDoc(doc(db, "posts", id), postData);
        alert("Đã cập nhật bài viết!");
      } else {
        await addDoc(collection(db, "posts"), postData);
        alert("Đã thêm bài viết!");
      }

      popupPost.style.display = 'none';
      postForm.reset();
      document.getElementById('imagePreview').style.display = 'none';
      document.getElementById('editingPostId').value = '';
      renderPosts();
    } catch (error) {
      console.error("Lỗi lưu bài viết:", error);
      alert("Không thể lưu bài viết.");
    }
  }
});

// ==== Xoá ====
let isDeleteMode = false;
deleteBtn?.addEventListener('click', async () => {
  if (!isDeleteMode) {
    isDeleteMode = true;
    deleteBtn.textContent = 'Xác nhận xoá';
    postsContainer.querySelectorAll('.post-item').forEach(post => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('delete-checkbox');
      checkbox.style.position = 'absolute';
      checkbox.style.top = '5px';
      checkbox.style.right = '5px';
      post.style.position = 'relative';
      post.appendChild(checkbox);
    });
  } else {
    const checkboxes = postsContainer.querySelectorAll('.delete-checkbox:checked');
    for (const cb of checkboxes) {
      const postId = cb.closest('.post-item').getAttribute("data-id");
      try {
        await deleteDoc(doc(db, "posts", postId));
      } catch (error) {
        console.error("Lỗi khi xoá bài viết:", error);
        alert("Không thể xoá bài viết: " + postId);
      }
    }
    isDeleteMode = false;
    deleteBtn.textContent = 'Xoá';
    renderPosts();
  }
});

// ==== Hiển thị bài viết ====
async function renderPosts() {
  if (!postsContainer) return;
  postsContainer.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "posts"));

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const postId = docSnap.id;

    const postDiv = document.createElement("div");
    postDiv.classList.add("post-item");
    postDiv.setAttribute("data-id", postId);
    postDiv.setAttribute("data-category", data.category?.toLowerCase() || "");
    postDiv.style.border = "1px solid #ccc";
    postDiv.style.padding = "10px";
    postDiv.style.marginBottom = "10px";

    if (data.imageUrl) {
      const img = document.createElement("img");
      img.src = data.imageUrl;
      img.style.maxWidth = "300px";
      img.style.display = "block";
      img.style.marginBottom = "10px";
      postDiv.appendChild(img);
    }

    postDiv.innerHTML += `
      <h3>${data.title}</h3>
      <p>${data.content}</p>
      <p>Tác giả: ${data.author}</p>
      <p>Ngày đăng: ${data.date?.split('-').reverse().join('/')}</p>
      <p>Chuyên mục: ${data.category}</p>
    `;
//role ko là user -> có nút sửa 
    if (currentUserRole !== "user") {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Sửa";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        popupPost.style.display = "flex";
        document.getElementById("postTitle").value = data.title;
        document.getElementById("postContent").value = data.content;
        document.getElementById("postAuthor").value = data.author;
        document.getElementById("postDate").value = data.date;
        document.getElementById("postCategory").value = data.category;
        document.getElementById("editingPostId").value = postId;

        if (data.imageUrl) {
          const preview = document.getElementById("imagePreview");
          preview.src = data.imageUrl;
          preview.style.display = "block";
        }
      };
      postDiv.appendChild(editBtn);
    }
//click xem bài viết 
    postDiv.style.cursor = "pointer";
    postDiv.addEventListener("click", () => {
      window.location.href = `xem_bai_viet.html?id=${postId}`;
    });

    postsContainer.appendChild(postDiv);
  });
}
if (document.getElementById("postDetail")) {
  renderPostDetail();
}

// ==== Tìm kiếm và lọc ====
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

searchInput?.addEventListener("input", filterAndSearchPosts);
filterCategory?.addEventListener("change", filterAndSearchPosts);

function filterAndSearchPosts() {
  const keyword = searchInput?.value.toLowerCase() || "";
  const selectedCategory = filterCategory?.value.toLowerCase() || "all";

  const posts = postsContainer?.querySelectorAll(".post-item") || [];

  posts.forEach(post => {
    const title = post.querySelector("h3")?.textContent.toLowerCase() || "";
    const categoryText = post.getAttribute("data-category");
    const matchesTitle = title.includes(keyword);
    const matchesCategory = selectedCategory === "all" || categoryText === selectedCategory;
    post.style.display = matchesTitle && matchesCategory ? "block" : "none";
  });
}


// ==== Chi tiết bài viết (dùng cho xem_bai_viet.html) ====
async function renderPostDetail() {
  const postId = new URLSearchParams(window.location.search).get("id");
  if (!postId) return;

  const docSnap = await getDoc(doc(db, "posts", postId));
  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("detailTitle").textContent = data.title;
    document.getElementById("detailContent").textContent = data.content;
    document.getElementById("detailAuthor").textContent = data.author;
    document.getElementById("detailDate").textContent = data.date.split("-").reverse().join("/");
    document.getElementById("postDetail").style.display = "block";

    const btnBack = document.getElementById("btnBackToList");
    if (btnBack) {
      btnBack.addEventListener("click", () => {
        window.location.href = "bai_viet.html";
      });
    }
  } else {
    document.getElementById("postDetail").innerHTML = "<p>❌ Không tìm thấy bài viết.</p>";
  }
}
