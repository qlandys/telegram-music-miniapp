const tg = window.Telegram?.WebApp;
const APP_CONFIG = window.APP_CONFIG || { apiBaseUrl: "http://localhost:8001" };
const API_BASE_URL = (APP_CONFIG.apiBaseUrl || "http://localhost:8001").replace(/\/$/, "");

const CATEGORY_ORDER = ["top", "tracks", "artists", "podcasts", "audiobooks"];
const CATEGORY_LABELS = {
  top: "Популярное",
  tracks: "Треки",
  artists: "Артисты",
  podcasts: "Подкасты",
  audiobooks: "Аудиокниги",
};

const NAV_FALLBACK_ICONS = {
  home: "⌂",
  history: "↺",
  search: "⌕",
  collection: "★",
  profile: "☺",
};

const navAnimations = new Map();

const previewContainer = document.getElementById("previewContainer");
const previewTitle = document.getElementById("previewTitle");
const previewPlayer = document.getElementById("previewPlayer");

let searchAbortController = null;

const state = {
  user: tg?.initDataUnsafe?.user ?? null,
  categories: {
    top: [],
    tracks: [],
    artists: [],
    podcasts: [],
    audiobooks: [],
  },
  activeCategory: "top",
  view: "home",
  isSearching: false,
  errorMessage: "",
  selectedTrackId: null,
};

function initTelegramUI() {
  if (!tg) {
    return;
  }

  tg.expand();
  tg.MainButton.setParams({
    text: "Добавить выбранный трек",
    is_visible: false,
  });

  tg.onEvent("mainButtonClicked", () => {
    const active = findSelectedTrack();
    if (!active) {
      return;
    }
    tg.sendData(JSON.stringify({ trackId: active.id }));
    tg.showPopup({
      title: "Готово",
      message: `Трек «${active.title}» отправлен.`,
    });
  });
}

function findSelectedTrack() {
  const allTracks = state.categories.top.concat(state.categories.tracks);
  return allTracks.find((item) => item.id === state.selectedTrackId);
}

function formatDuration(durationSeconds) {
  if (typeof durationSeconds !== "number" || Number.isNaN(durationSeconds)) {
    return null;
  }
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = Math.floor(durationSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function clearPreview() {
  if (!previewContainer || !previewPlayer) {
    return;
  }
  previewPlayer.pause();
  previewPlayer.removeAttribute("src");
  previewPlayer.load();
  previewContainer.classList.remove("preview--visible");
  previewTitle.textContent = "";
}

function playPreview(track) {
  if (!previewContainer || !previewPlayer || !track?.streamUrl) {
    return;
  }
  if (state.view !== "search") {
    setView("search");
  }
  previewPlayer.pause();
  previewTitle.textContent = `Предпрослушивание: ${track.title}`;
  previewContainer.classList.add("preview--visible");

  const absoluteUrl = track.streamUrl.startsWith("http")
    ? track.streamUrl
    : `${API_BASE_URL}${track.streamUrl}`;
  previewPlayer.src = `${absoluteUrl}?ts=${Date.now()}`;
  previewPlayer.play().catch(() => {});
}

function selectTrack(trackId) {
  state.selectedTrackId = trackId;
  updateMainButton();
  renderResults();
}

function updateMainButton() {
  if (!tg) {
    return;
  }
  if (state.view !== "search") {
    tg.MainButton.hide();
    return;
  }
  const active = findSelectedTrack();
  if (active) {
    tg.MainButton.setParams({ text: "Добавить выбранный трек", is_visible: true });
  } else {
    tg.MainButton.hide();
  }
}

function clearCategories() {
  state.categories = {
    top: [],
    tracks: [],
    artists: [],
    podcasts: [],
    audiobooks: [],
  };
}

function renderCategoryTabs() {
  const tabs = document.getElementById("categories");
  if (!tabs) {
    return;
  }
  tabs.innerHTML = "";

  CATEGORY_ORDER.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-chip";
    if (category === state.activeCategory) {
      button.classList.add("category-chip--active");
    }
    const count = state.categories[category]?.length ?? 0;
    button.textContent = count ? `${CATEGORY_LABELS[category]} · ${count}` : CATEGORY_LABELS[category];
    if (!count) {
      button.classList.add("category-chip--empty");
    }
    button.addEventListener("click", () => {
      state.activeCategory = category;
      state.errorMessage = "";
      renderCategoryTabs();
      renderResults();
    });
    tabs.appendChild(button);
  });
}

function renderResults() {
  const container = document.getElementById("results");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  if (state.view !== "search") {
    clearPreview();
    return;
  }

  if (state.isSearching) {
    const loading = document.createElement("p");
    loading.className = "results__placeholder";
    loading.textContent = "Ищем музыку...";
    container.appendChild(loading);
    return;
  }

  if (state.errorMessage) {
    const error = document.createElement("p");
    error.className = "results__placeholder";
    error.textContent = state.errorMessage;
    container.appendChild(error);
    return;
  }

  const currentItems = state.categories[state.activeCategory] || [];
  if (!currentItems.length) {
    const empty = document.createElement("p");
    empty.className = "results__placeholder";
    empty.textContent = "Тут пока пусто. Попробуйте другой запрос.";
    container.appendChild(empty);
    return;
  }

  currentItems.forEach((item) => container.appendChild(buildCategoryItem(item)));
}

function buildCategoryItem(item) {
  const element = document.createElement("article");
  element.className = "result-item";

  const artwork = document.createElement("div");
  artwork.className = "result-item__artwork";
  if (item.thumbnail) {
    const img = document.createElement("img");
    img.src = item.thumbnail;
    img.alt = item.title ?? "";
    artwork.appendChild(img);
  } else {
    artwork.textContent = "♪";
  }

  const body = document.createElement("div");
  body.className = "result-item__body";

  const title = document.createElement("h3");
  title.className = "result-item__title";
  title.textContent = item.title || "Без названия";

  const subtitle = document.createElement("p");
  subtitle.className = "result-item__subtitle";
  subtitle.textContent = item.subtitle || "";

  const meta = document.createElement("div");
  meta.className = "result-item__meta";
  if (item.durationLabel) {
    const duration = document.createElement("span");
    duration.textContent = item.durationLabel;
    meta.appendChild(duration);
  }

  const actions = document.createElement("div");
  actions.className = "result-item__actions";

  const previewButton = document.createElement("button");
  previewButton.type = "button";
  previewButton.className = "result-item__button";
  previewButton.textContent = "▶";
  previewButton.addEventListener("click", () => {
    selectTrack(item.id);
    playPreview(item);
  });

  actions.appendChild(previewButton);
  body.appendChild(title);
  if (subtitle.textContent) {
    body.appendChild(subtitle);
  }
  if (meta.children.length) {
    body.appendChild(meta);
  }

  element.appendChild(artwork);
  element.appendChild(body);
  element.appendChild(actions);

  if (item.id === state.selectedTrackId) {
    element.classList.add("result-item--selected");
  }

  return element;
}

async function performSearch(rawQuery) {
  const query = rawQuery.trim();
  state.selectedTrackId = null;
  clearPreview();

  if (!query) {
    clearCategories();
    state.errorMessage = "";
    state.activeCategory = "top";
    renderCategoryTabs();
    renderResults();
    updateMainButton();
    return;
  }

  setView("search");
  state.isSearching = true;
  state.errorMessage = "";
  clearCategories();
  renderCategoryTabs();
  renderResults();
  updateMainButton();

  if (searchAbortController) {
    searchAbortController.abort();
  }
  searchAbortController = new AbortController();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`,
      { signal: searchAbortController.signal },
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    convertSearchResponse(payload || {});
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Search failed", error);
      state.errorMessage = "Не получилось найти треки. Попробуйте ещё раз.";
      clearCategories();
    }
  } finally {
    state.isSearching = false;
    renderCategoryTabs();
    renderResults();
    updateMainButton();
  }
}

function convertSearchResponse(payload) {
  clearCategories();
  CATEGORY_ORDER.forEach((category) => {
    const items = Array.isArray(payload[category]) ? payload[category] : [];
    state.categories[category] = items
      .filter((item) => item && item.id)
      .map((item) => ({
        id: item.id,
        type: item.type || "track",
        title: item.title || "Без названия",
        subtitle: item.subtitle || null,
        thumbnail: item.thumbnail || null,
        durationLabel: item.durationSeconds ? formatDuration(item.durationSeconds) : item.duration || null,
        streamUrl: item.streamUrl ? item.streamUrl.replace(/^\/?stream\//, `${API_BASE_URL}/stream/`) : null,
      }));
  });
  const firstNonEmpty = CATEGORY_ORDER.find((category) => state.categories[category].length);
  state.activeCategory = firstNonEmpty || "top";
  if (!firstNonEmpty) {
    state.errorMessage = "Ничего не найдено.";
  }
}

function wireEvents() {
  const input = document.getElementById("query");
  const button = document.getElementById("searchButton");
  if (!input || !button) {
    return;
  }
  button.addEventListener("click", () => performSearch(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      performSearch(input.value);
    }
  });
}

function greetUser() {
  if (!state.user) {
    return;
  }
  const subtitle = document.querySelector(".app__subtitle");
  if (!subtitle) {
    return;
  }
  subtitle.textContent = `Привет, ${state.user.first_name ?? state.user.username ?? "друг"}! Здесь можно слушать музыку из YouTube.`;
}

function playNavAnimation(target) {
  navAnimations.forEach((animation, key) => {
    if (!animation) {
      return;
    }
    animation.stop();
    animation.goToAndStop(0, true);
    if (key === target) {
      const frames = animation.totalFrames ?? 120;
      animation.playSegments([0, frames], true);
    }
  });
}

function setView(view) {
  state.view = view;
  document
    .querySelectorAll("[data-view]")
    .forEach((section) => section.classList.toggle("view--active", section.dataset.view === view));
  document
    .querySelectorAll("[data-view-target]")
    .forEach((navItem) => navItem.classList.toggle("nav-item--active", navItem.dataset.viewTarget === view));

  playNavAnimation(view);
  if (view === "search") {
    renderCategoryTabs();
    renderResults();
  } else {
    tg?.MainButton.hide();
    clearPreview();
  }
}

function initNavigation() {
  const navItems = document.querySelectorAll("[data-view-target]");
  navItems.forEach((item) => {
    const target = item.dataset.viewTarget;
    const iconContainer = item.querySelector(".nav-item__icon");
    const lottieSrc = item.dataset.lottie;

    if (window.lottie && lottieSrc && iconContainer) {
      try {
        const animation = window.lottie.loadAnimation({
          container: iconContainer,
          renderer: "svg",
          loop: false,
          autoplay: false,
          path: lottieSrc,
        });
        animation.addEventListener("DOMLoaded", () => {
          animation.goToAndStop(0, true);
          if (target === state.view) {
            playNavAnimation(target);
          }
        });
        navAnimations.set(target, animation);
      } catch (error) {
        console.warn("Не удалось воспроизвести анимацию навигации:", error);
      }
    } else if (iconContainer) {
      const fallback = document.createElement("span");
      fallback.className = "nav-item__fallback";
      fallback.textContent = NAV_FALLBACK_ICONS[target] ?? "?";
      iconContainer.appendChild(fallback);
    }

    item.addEventListener("click", () => setView(target));
  });

  setView(state.view);
}

function bootstrap() {
  initTelegramUI();
  wireEvents();
  greetUser();
  initNavigation();
  renderCategoryTabs();
  renderResults();
}

bootstrap();
