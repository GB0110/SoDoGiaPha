// Lấy các phần tử cần dùng
const btnAddEvent = document.getElementById("btnAddEvent");
const eventFormContainer = document.getElementById("eventFormContainer");
const btnCancelEvent = document.getElementById("btnCancelEvent");
const eventForm = document.getElementById("eventForm");
const eventItems = document.getElementById("eventItems");

// Khi bấm nút "Tạo sự kiện", hiện form và ẩn nút
btnAddEvent.onclick = function() {
  eventFormContainer.style.display = "block";
  btnAddEvent.style.display = "none";
};

// Khi bấm nút "Hủy", ẩn form và hiện lại nút
btnCancelEvent.onclick = function() {
  eventFormContainer.style.display = "none";
  btnAddEvent.style.display = "inline-block";
  eventForm.reset();
};

// Khi gửi form (bấm Lưu)
eventForm.onsubmit = function(event) {
  event.preventDefault(); // ngăn form gửi lên server

  // Lấy giá trị từ form
  const name = eventForm.eventName.value;
  const date = eventForm.eventDate.value;
  const location = eventForm.eventLocation.value;

  // Tạo nội dung cho sự kiện mới
  const text = name + " - " + date + " - " + location;

  // Tạo một thẻ li mới và thêm vào danh sách
  const li = document.createElement("li");
  li.textContent = text;
  eventItems.appendChild(li);

  // Đóng form, hiện lại nút và reset form
  eventFormContainer.style.display = "none";
  btnAddEvent.style.display = "inline-block";
  eventForm.reset();
};
