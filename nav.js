// Navigation defaults used when JSON content cannot be loaded.
const DEFAULT_NAV_ITEMS = [
  // Main sections
  { label: "Journal", href: "index.html", position: "pos1" },

  // Resources
  { label: "Library", href: "library.html", position: "pos2" },

  // Contact & Links
 { label: "GitHub", href: "https://github.com/Prince-of-Nothing", external: true, position: "pos3" },

];

// Site defaults used when JSON content cannot be loaded.
const DEFAULT_SITE_CONFIG = {
  title: "shameless",
  titleSuffix: " — shameless.plesu.net",
  footerYear: "2026-2026",
  footerName: "",
};

const NAV_SCRIPT_SRC = document.currentScript && document.currentScript.src ? document.currentScript.src : "";

const THEME_STORAGE_KEY = "shameless-theme";
const THEME_ORDER = ["system", "dark", "light"];

function isThemeValue(value) {
  return THEME_ORDER.includes(value);
}

function getStoredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeValue(saved) ? saved : "system";
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(themeChoice) {
  return themeChoice === "system" ? getSystemTheme() : themeChoice;
}

function applyTheme(themeChoice) {
  const resolvedTheme = resolveTheme(themeChoice);
  document.documentElement.setAttribute("data-theme", resolvedTheme);
}

function getNextTheme(current) {
  const index = THEME_ORDER.indexOf(current);
  const nextIndex = (index + 1) % THEME_ORDER.length;
  return THEME_ORDER[nextIndex];
}

function buildThemeControl() {
  const footer = document.querySelector(".site-foot");
  if (!footer) return;

  const wrapper = document.createElement("div");
  wrapper.className = "theme-toggle";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle-button";

  const updateLabel = (themeChoice) => {
    const resolvedTheme = resolveTheme(themeChoice);
    button.textContent = `theme: ${themeChoice} (${resolvedTheme})`;
    button.setAttribute("aria-label", `Theme mode ${themeChoice}, effective ${resolvedTheme}`);
  };

  let currentTheme = getStoredTheme();
  updateLabel(currentTheme);

  button.addEventListener("click", () => {
    currentTheme = getNextTheme(currentTheme);
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    applyTheme(currentTheme);
    updateLabel(currentTheme);
  });

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const syncWithSystem = () => {
    const savedTheme = getStoredTheme();
    if (savedTheme === "system") {
      applyTheme(savedTheme);
      updateLabel(savedTheme);
    }
  };

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", syncWithSystem);
  } else if (typeof media.addListener === "function") {
    media.addListener(syncWithSystem);
  }

  wrapper.appendChild(button);
  footer.appendChild(wrapper);
}

function normalizeSiteConfig(site) {
  if (!site || typeof site !== "object") return DEFAULT_SITE_CONFIG;

  return {
    title: typeof site.title === "string" ? site.title : DEFAULT_SITE_CONFIG.title,
    titleSuffix: typeof site.titleSuffix === "string" ? site.titleSuffix : DEFAULT_SITE_CONFIG.titleSuffix,
    footerYear: typeof site.footerYear === "string" ? site.footerYear : DEFAULT_SITE_CONFIG.footerYear,
    footerName: typeof site.footerName === "string" ? site.footerName : DEFAULT_SITE_CONFIG.footerName,
  };
}

function normalizeNavItems(items) {
  if (!Array.isArray(items)) return DEFAULT_NAV_ITEMS;

  const parsePosition = (rawPosition) => {
    if (typeof rawPosition === "string") {
      const value = rawPosition.trim().toLowerCase();
      if (value === "pos1" || value === "1") return "pos1";
      if (value === "pos2" || value === "2") return "pos2";
      if (value === "pos3" || value === "3") return "pos3";
      if (value === "pos4" || value === "4") return "pos4";
    }

    if (typeof rawPosition === "number") {
      if (rawPosition === 1) return "pos1";
      if (rawPosition === 2) return "pos2";
      if (rawPosition === 3) return "pos3";
      if (rawPosition === 4) return "pos4";
    }

    return "pos1";
  };

  const isExternalHref = (href) => {
    if (typeof href !== "string") return false;
    return /^(https?:)?\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href);
  };

  const validItems = items
    .filter((item) => item && typeof item.label === "string" && typeof item.href === "string")
    .map((item) => ({
      ...item,
      position: parsePosition(item.position),
      external: typeof item.external === "boolean" ? item.external : isExternalHref(item.href),
    }));

  return validItems.length > 0 ? validItems : DEFAULT_NAV_ITEMS;
}

function getContentDataUrl() {
  const base = NAV_SCRIPT_SRC || window.location.href;
  return new URL("assets/data/content.json", base).href;
}

async function fetchJsonWithFetch(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function fetchJsonWithXhr(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;

      // Browsers can return status 0 for successful local file reads.
      const isSuccess = (xhr.status >= 200 && xhr.status < 300) || (window.location.protocol === "file:" && xhr.status === 0);
      if (!isSuccess) {
        reject(new Error(`XHR ${xhr.status}`));
        return;
      }

      try {
        resolve(JSON.parse(xhr.responseText));
      } catch (error) {
        reject(error);
      }
    };
    xhr.onerror = () => reject(new Error("XHR network error"));
    xhr.send();
  });
}

async function loadContentData() {
  const failures = [];
  const contentDataUrl = getContentDataUrl();

  // Optional inline fallback: <script id="content-data" type="application/json">...</script>
  const inlineData = document.getElementById("content-data");
  if (inlineData && inlineData.textContent) {
    try {
      const parsed = JSON.parse(inlineData.textContent);
      return {
        site: normalizeSiteConfig(parsed.site),
        navigation: normalizeNavItems(parsed.navigation),
      };
    } catch (error) {
      failures.push(`inline content-data (${error && error.message ? error.message : "parse failed"})`);
    }
  }

  try {
    const data = await fetchJsonWithFetch(contentDataUrl);
    return {
      site: normalizeSiteConfig(data.site),
      navigation: normalizeNavItems(data.navigation),
    };
  } catch (error) {
    failures.push(`${contentDataUrl} (${error && error.message ? error.message : "fetch failed"})`);
  }

  // Some browsers block fetch() on file:// but may still allow XHR.
  if (window.location.protocol === "file:") {
    try {
      const data = await fetchJsonWithXhr(contentDataUrl);
      return {
        site: normalizeSiteConfig(data.site),
        navigation: normalizeNavItems(data.navigation),
      };
    } catch (error) {
      failures.push(`${contentDataUrl} (${error && error.message ? error.message : "xhr failed"})`);
    }
  }

  console.error("Using default nav/site config because content JSON failed to load.", {
    failures,
    hint: "If you opened the page with file://, run a local server (for example: python -m http.server 8080).",
  });

  return {
    site: DEFAULT_SITE_CONFIG,
    navigation: DEFAULT_NAV_ITEMS,
  };
}

// Build navigation HTML
function buildNav(navItems) {
  const nav = document.getElementById("navigation");
  if (!nav) return;

  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop() || "index.html";

  const columnsWrapper = document.createElement("div");
  columnsWrapper.className = "nav-columns";

  const columnMap = {
    pos1: document.createElement("ul"),
    pos2: document.createElement("ul"),
    pos3: document.createElement("ul"),
    pos4: document.createElement("ul"),
  };

  Object.entries(columnMap).forEach(([position, column]) => {
    column.className = `nav-column ${position}`;
    columnsWrapper.appendChild(column);
  });

  navItems.forEach((item) => {
    const li = document.createElement("li");
    const isExternal = Boolean(item.external);
    const resolvedHref = isExternal ? item.href : new URL(item.href, window.location.href).pathname;
    const isCurrent = !isExternal && (item.href === currentPage || resolvedHref === currentPath);

    if (isCurrent) {
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

    const targetColumn = columnMap[item.position] || columnMap.pos1;
    targetColumn.appendChild(li);
  });

  nav.appendChild(columnsWrapper);
}

// Build footer HTML
function buildFooter(siteConfig) {
  const footer = document.querySelector(".site-foot");
  if (!footer) return;

  footer.innerHTML = `
    <hr>
    <p>&copy; ${siteConfig.footerYear} ${siteConfig.footerName}</p>
  `;
}

function applySiteBranding(siteConfig) {
  const logo = document.querySelector(".site-head-logo");
  if (logo && typeof siteConfig.title === "string" && siteConfig.title.trim()) {
    logo.textContent = siteConfig.title.trim().toUpperCase();
  }
}

function getBasePageTitle() {
  const pageHeadTitle = document.querySelector(".page-head-title");
  if (pageHeadTitle && pageHeadTitle.textContent && pageHeadTitle.textContent.trim()) {
    return pageHeadTitle.textContent.trim();
  }

  const currentTitle = (document.title || "").trim();
  if (!currentTitle) return "";

  const separatorIndex = currentTitle.indexOf(" — ");
  if (separatorIndex === -1) return currentTitle;
  return currentTitle.slice(0, separatorIndex).trim();
}

// Set page title
function setPageTitle(siteConfig) {
  const baseTitle = getBasePageTitle();
  const fallbackTitle = typeof siteConfig.title === "string" ? siteConfig.title : "";
  const titlePart = baseTitle || fallbackTitle;

  if (titlePart) {
    document.title = `${titlePart}${siteConfig.titleSuffix}`;
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  applyTheme(getStoredTheme());
  const contentData = await loadContentData();

  applySiteBranding(contentData.site);
  setPageTitle(contentData.site);
  buildNav(contentData.navigation);
  buildFooter(contentData.site);
  buildThemeControl();
});
