document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("btn-open");
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");

    btn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      mainContent.classList.toggle("expanded");
    });
});

