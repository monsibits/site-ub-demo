const modal = document.getElementById("demo-modal");

function openDemoNotice(event) {
  if (event) {
    event.preventDefault();
  }

  if (modal && typeof modal.showModal === "function") {
    modal.showModal();
    return;
  }

  window.location.href = "demo-only.html";
}

function closeDemoNotice() {
  if (modal && typeof modal.close === "function") {
    modal.close();
  }
}

document.querySelectorAll("[data-demo-modal]").forEach((element) => {
  element.addEventListener("click", openDemoNotice);
});

document.querySelectorAll("form[data-demo-form]").forEach((form) => {
  form.addEventListener("submit", openDemoNotice);
});

document.querySelectorAll("[data-close-modal]").forEach((element) => {
  element.addEventListener("click", closeDemoNotice);
});

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeDemoNotice();
    }
  });
}
