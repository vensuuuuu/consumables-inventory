export function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");

  function show(view) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.view === view));
    views.forEach(v => v.classList.remove("show"));
    document.getElementById(`view-${view}`)?.classList.add("show");
  }

  tabs.forEach(btn => {
    btn.addEventListener("click", () => show(btn.dataset.view));
  });

  show("inventory"); // default
}