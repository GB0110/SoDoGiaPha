// hieu ung button menu
const btnOpen = document.getElementById('btn-open');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
 const btnIcon = btnOpen.querySelector('i');

  btnOpen.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    btnOpen.classList.toggle('rotated'); 

    //  // Đổi icon khi mở sidebar
    // if (sidebar.classList.contains('collapsed')) {
    //   btnIcon.classList.remove('fa-bars');
    //   btnIcon.classList.add('fa-xmark');
    // } else {
    //   btnIcon.classList.remove('fa-xmark');
    //   btnIcon.classList.add('fa-bars');
    // }
  });

/*  document.getElementById("create-button").addEventListener("click", function () {
    alert("Bài viết đã được tạo thành công!");
});*/

document.getElementById("cancel-button").addEventListener("click", function () {
    document.getElementById("post-title").value = "";
    document.getElementById("post-content").value = "";
    document.getElementById("image-upload").value = "";
});

//Chon Pha do
document.querySelectorAll(".menu-btn span").forEach(btn => {
  if (btn.innerText === "Phả đồ") {
    btn.parentElement.addEventListener("click", () => {
      window.location.href = "../Pages/editor_pha_do.html";
    });
  }
});


  