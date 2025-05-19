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

<<<<<<< HEAD:JavaScript/script.js
/*  document.getElementById("create-button").addEventListener("click", function () {
    alert("Bài viết đã được tạo thành công!");
});*/

=======
// SCRIPT CỦA TRANG BÀI VIẾT
// Tạo bài viết
  document.getElementById("create-button").addEventListener("click", function () {
    alert("Bài viết đã được tạo thành công!");
});
// Huỷ tạo bài viết
>>>>>>> 3e01b89 (Trang to tien):JavaScript/baiviet.js
document.getElementById("cancel-button").addEventListener("click", function () {
    document.getElementById("post-title").value = "";
    document.getElementById("post-content").value = "";
    document.getElementById("image-upload").value = "";
<<<<<<< HEAD:JavaScript/script.js
});

//Chon Pha do
document.querySelectorAll(".menu-btn span").forEach(btn => {
  if (btn.innerText === "Phả đồ") {
    btn.parentElement.addEventListener("click", () => {
      window.location.href = "../Pages/editor_pha_do.html";
    });
  }
});


  
=======
});
>>>>>>> 3e01b89 (Trang to tien):JavaScript/baiviet.js
