const tabs = document.querySelectorAll(".category-tab");
const cards = document.querySelectorAll(".menu-card");
const count = document.getElementById("menuCount");

function filterMenu(category) {
  let visible = 0;
  cards.forEach((card) => {
    const show = category === "all" || card.dataset.category === category;
    card.hidden = !show;
    if (show) visible++;
  });
  count.textContent = `${visible} menu item${visible === 1 ? "" : "s"}`;
  tabs.forEach((tab) => {
    const active = tab.dataset.category === category;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => filterMenu(tab.dataset.category));
});

document.getElementById("year").textContent = new Date().getFullYear();