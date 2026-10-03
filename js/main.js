(function () {
  "use strict";

  const lang = document.documentElement.lang === "en" ? "en" : "bg";

  const TEXT = {
    bg: { onRequest: "по запитване", perNight: "на нощувка", now: "сега", price: "Цена" },
    en: { onRequest: "on request", perNight: "per night", now: "now", price: "Price" },
  }[lang];

  const CURRENCY_SYMBOLS = { EUR: "€", BGN: "лв." };

  /* ---------- Prices (config lives in js/prices.js) ---------- */

  const config = window.BONITA_PRICES || {};
  const seasons = Array.isArray(config.seasons) ? config.seasons : [];

  function localize(value) {
    if (value && typeof value === "object") return value[lang] || value.bg || "";
    return value || "";
  }

  function formatPrice(value, currency) {
    if (typeof value !== "number") return TEXT.onRequest;
    const symbol = CURRENCY_SYMBOLS[currency] || currency || "";
    if (lang === "en" && symbol === "€") return symbol + value;
    return (value + " " + symbol).trim();
  }

  function isCurrentSeason(season) {
    const today = new Date();
    const monthDay =
      String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    return (season.ranges || []).some(function (range) {
      return range[0] <= monthDay && monthDay <= range[1];
    });
  }

  function createNowBadge() {
    const badge = document.createElement("span");
    badge.className = "badge-now";
    badge.textContent = TEXT.now;
    return badge;
  }

  function createPriceBox(label, value, isCurrent) {
    const box = document.createElement("div");
    box.className = "price" + (isCurrent ? " is-current" : "");

    const labelEl = document.createElement("span");
    labelEl.className = "price__label";
    labelEl.textContent = label;
    if (isCurrent) labelEl.appendChild(createNowBadge());

    const valueEl = document.createElement("strong");
    valueEl.className = "price__value";
    valueEl.textContent = formatPrice(value, config.currency);
    box.append(labelEl, valueEl);

    if (typeof value === "number") {
      const unit = document.createElement("span");
      unit.className = "price__unit";
      unit.textContent = TEXT.perNight;
      box.appendChild(unit);
    }
    return box;
  }

  function renderRoomPrices() {
    document.querySelectorAll("[data-room-prices]").forEach(function (container) {
      const roomPrices = (config.rooms || {})[container.dataset.roomPrices] || {};
      container.textContent = "";
      if (!seasons.length) {
        container.appendChild(createPriceBox(TEXT.price, null, false));
        return;
      }
      seasons.forEach(function (season) {
        container.appendChild(
          createPriceBox(localize(season.name), roomPrices[season.id], isCurrentSeason(season))
        );
      });
    });
  }

  function renderPriceTable() {
    const table = document.querySelector("[data-price-table]");
    if (!table) return;

    if (!seasons.length) {
      table.hidden = true;
      const fallback = document.querySelector("[data-prices-fallback]");
      if (fallback) fallback.hidden = false;
      return;
    }

    const headRow = table.tHead.rows[0];
    seasons.forEach(function (season) {
      const isCurrent = isCurrentSeason(season);
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = localize(season.name);
      if (isCurrent) {
        th.className = "is-current";
        th.appendChild(createNowBadge());
      }
      const dates = localize(season.dates);
      if (dates) {
        const small = document.createElement("small");
        small.textContent = dates;
        th.appendChild(small);
      }
      headRow.appendChild(th);
    });

    Array.from(table.tBodies[0].rows).forEach(function (row) {
      const roomPrices = (config.rooms || {})[row.dataset.room] || {};
      seasons.forEach(function (season) {
        const td = document.createElement("td");
        td.textContent = formatPrice(roomPrices[season.id], config.currency);
        if (isCurrentSeason(season)) td.className = "is-current";
        row.appendChild(td);
      });
    });

    const note = document.querySelector("[data-prices-note]");
    if (note && config.note) note.textContent = localize(config.note);
  }

  renderRoomPrices();
  renderPriceTable();

  /* ---------- Header + mobile navigation ---------- */

  const header = document.querySelector(".header");
  const nav = document.getElementById("nav");
  const navToggle = document.querySelector(".nav-toggle");

  function setNavOpen(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      setNavOpen(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNavOpen(false);
    });
  }

  if (header) {
    const onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Lightbox gallery ---------- */

  const lightbox = document.getElementById("lightbox");

  if (lightbox) {
    const imageEl = lightbox.querySelector(".lightbox__img");
    const captionEl = lightbox.querySelector(".lightbox__caption");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    let photos = [];
    let current = 0;
    let openedBy = null;
    let touchStartX = null;

    const show = function (index) {
      current = (index + photos.length) % photos.length;
      const photo = photos[current];
      imageEl.src = photo.src;
      imageEl.alt = photo.alt;
      captionEl.textContent = photo.alt + " · " + (current + 1) + " / " + photos.length;
    };

    const open = function (trigger) {
      const gallery = trigger.dataset.gallery;
      const triggers = Array.from(document.querySelectorAll('[data-gallery="' + gallery + '"]'));
      photos = triggers.map(function (el) {
        const img = el.querySelector("img");
        return { src: img.getAttribute("src"), alt: img.alt };
      });
      openedBy = trigger;
      lightbox.hidden = false;
      document.body.classList.add("no-scroll");
      show(triggers.indexOf(trigger));
      closeBtn.focus();
    };

    const close = function () {
      lightbox.hidden = true;
      document.body.classList.remove("no-scroll");
      imageEl.removeAttribute("src");
      if (openedBy) openedBy.focus();
    };

    document.addEventListener("click", function (event) {
      const trigger = event.target.closest("[data-gallery]");
      if (trigger) open(trigger);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target.closest(".lightbox__prev")) show(current - 1);
      else if (event.target.closest(".lightbox__next")) show(current + 1);
      else if (event.target.closest(".lightbox__close") || event.target === lightbox) close();
    });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") show(current - 1);
      else if (event.key === "ArrowRight") show(current + 1);
      else if (event.key === "Tab") {
        // keep keyboard focus inside the open gallery
        const buttons = Array.from(lightbox.querySelectorAll("button"));
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    lightbox.addEventListener(
      "touchstart",
      function (event) {
        touchStartX = event.changedTouches[0].clientX;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      "touchend",
      function (event) {
        if (touchStartX === null) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(deltaX) < 40) return;
        show(deltaX > 0 ? current - 1 : current + 1);
      },
      { passive: true }
    );
  }

  /* ---------- Small things ---------- */

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // When the page is opened straight from disk there is no server to resolve
  // "en/" to "en/index.html", so point the language links at the file itself.
  if (window.location.protocol === "file:") {
    document.querySelectorAll("a[data-lang-link]").forEach(function (link) {
      link.setAttribute("href", link.getAttribute("href") + "index.html");
    });
  }
})();
