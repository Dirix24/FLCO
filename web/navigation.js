"use strict";
(() => {
  const menu = document.getElementById("app-menu");
  if (!menu) return;
  menu.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener("click", () => {
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (target?.tagName === "DETAILS") target.open = true;
      menu.open = false;
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") menu.open = false;
  });
  document.addEventListener("click", event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
})();
