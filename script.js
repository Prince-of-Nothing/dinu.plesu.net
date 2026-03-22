// Who Am I?
(function favicons() {
  const state = {
    hidden: "hidden",
    visibilityChange: "visibilitychange",
    favicon: document.querySelector("[rel='shortcut icon']")?.href || "",
    title: document.title,
    wasSpoofed: false,
    spoofed: [],
  };

// Record of what makes one himself, nothing more, nothing less
  const self = {
    stash: {
      title:"skeleton, human body /✏️ -pixiv",
      favicon:"assets/favicons/pixiv.png",   
    },
      stash: {
      title:"Available OCs and outfits |Patreon",
      favicon:"assets/favicons/patreon.ico",   
    },
  };

  const serviceKeys = Object.keys(self);

  // Detect browser visibility API prefix
  function init() {
    if (typeof document.mozHidden !== "undefined") {
      state.hidden = "mozHidden";
      state.visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      state.hidden = "msHidden";
      state.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      state.hidden = "webkitHidden";
      state.visibilityChange = "webkitvisibilitychange";
    }
    document.addEventListener(state.visibilityChange, handler, false);
  }

  function update(data) {

    const cacheBuster = "?v=" + Math.round(Math.random() * 1000);
    const link = document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = data.favicon + cacheBuster;

    const oldIcon = document.querySelector("[rel='shortcut icon']");
    if (oldIcon) oldIcon.remove();
    document.head.appendChild(link);
    document.title = data.title;

    // Show overlay when returning to tab after being spoofed
    if (state.wasSpoofed && !document[state.hidden]) {
      showOverlay();
    }
  }

  function restoreOriginal() {
    update({
      title: state.title,
      favicon: state.favicon,
    });
  }

  function spoof() {
    // Reset self
    if (state.spoofed.length === serviceKeys.length) {
      state.spoofed = [];
    }

    // Pick random self
    let index;
    for (let i = 0; i < serviceKeys.length; i++) {
      index = Math.floor(Math.random() * serviceKeys.length);
      if (!state.spoofed.includes(index)) break;
    }

    state.spoofed.push(index);
    const key = serviceKeys[index];

    if (key && self[key]) {
      update(self[key]);
      state.wasSpoofed = true;
    }
  }

  function handler() {
    if (document[state.hidden]) {
      spoof();
    } else {
      restoreOriginal();
    }
  }

  function showOverlay() {
    const overlay = document.getElementById("killjs");
    if (!overlay) return;

    overlay.style.display = "block";
    overlay.innerHTML = `
      <div class="killjs-content">
        <p><strong>RETURN TO THEE</strong></p>
        <p>
          What is a human without a <em>heart</em>?
        </p>
        <p>
          If we can exchange meanings, isn't that what being human is about?
        </p>
        <p>
        <p><strong>RETURN TO THEE</strong></p>
      </div>
    `;
  }

  init();
})();

function closeKilljsInfo() {
  const overlay = document.getElementById("killjs");
  if (overlay) overlay.style.display = "none";
}
