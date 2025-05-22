function showForm (formID){
    document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active")); // xóa 'active' ở tất cả các form có class form-box 
    document.getElementById(formID).classList.add("active"); // thêm 'active' cho form có id là formID được truyền vào
}
