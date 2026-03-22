// Navigation configuration - edit this to update all pages
const NAV_ITEMS = [
  // Main sections
  { label: "Journal", href: "index.html", section: "main" },

  // Resources
  { label: "Library", href: "library.html", section: "resources" },

  // Contact & Links
 { label: "GitHub", href: "https://github.com/Prince-of-Nothing", section: "links", external: true },

];
// Site configuration - edit these with your info
const SITE_CONFIG = {
  title: "shameless",
  titleSuffix: " — shameless.plesu.net",
  footerYear: "2026-2026",
  footerName: "",
};

// Build navigation HTML
function buildNav() {
  const nav = document.getElementById("navigation");
  if (!nav) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  const ul = document.createElement("ul");

  NAV_ITEMS.forEach((item) => {
    const li = document.createElement("li");
    if (item.href === currentPage) {
      li.classList.add("active");
    }

    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.label;

    if (item.external) {
      a.target = "_blank";
      a.rel = "noopener";
    }

    li.appendChild(a);
    ul.appendChild(li);
  });

  nav.appendChild(ul);
}

// Build footer HTML
function buildFooter() {
  const footer = document.querySelector(".site-foot");
  if (!footer) return;

  footer.innerHTML = `
    <hr>
    <p>&copy; ${SITE_CONFIG.footerYear} ${SITE_CONFIG.footerName}</p>
  `;
}

// Set page title
function setPageTitle(title) {
  if (title) {
    document.title = title + SITE_CONFIG.titleSuffix;
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  buildNav();
  buildFooter();
});
