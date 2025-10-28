const tg = window.Telegram?.WebApp;

const NAV_FALLBACK_ICONS = {
  home: "🏠",
  history: "🕑",
  search: "🔍",
  collection: "📁",
  profile: "👤",
};

const navAnimations = new Map();

const state = {
  user: tg?.initDataUnsafe?.user ?? null,
  results: [],
  view: "home",
};

function initTelegramUI() {
  if (!tg) {
    return;
  }

  tg.expand();
  tg.MainButton.setParams({
    text: "Отправить выбранный трек",
    is_visible: false,
  });
  tg.onEvent("mainButtonClicked", () => {
    const active = state.results.find((item) => item.isActive);
    if (active) {
      tg.sendData(JSON.stringify({ trackId: active.id }));
      tg.showPopup({
        title: "Отправлено боту",
        message: `Трек «${active.title}» уже в чате.`,
      });
    }
  });
}

function createTrackCard(track) {
  const wrapper = document.createElement("article");
  wrapper.className = "track-card";

  const cover = document.createElement("img");
  cover.className = "track-card__cover";
  cover.alt = track.title;
  cover.src = track.cover;

  const info = document.createElement("div");
  info.className = "track-card__info";

  const title = document.createElement("h2");
  title.className = "track-card__title";
  title.textContent = track.title;

  const meta = document.createElement("p");
  meta.className = "track-card__meta";
  meta.textContent = `${track.artist} · ${track.duration}`;

  const button = document.createElement("button");
  button.className = "track-card__button";
  button.type = "button";
  button.textContent = "Выбрать";
  button.addEventListener("click", () => {
    state.results.forEach((item) => {
      item.isActive = item.id === track.id;
    });
    updateMainButton();
    highlightSelection();
  });

  info.append(title, meta);
  wrapper.append(cover, info, button);
  wrapper.dataset.trackId = track.id;
  return wrapper;
}

function highlightSelection() {
  if (state.view !== "search") {
    return;
  }
  document.querySelectorAll(".track-card").forEach((card) => {
    const isActive = state.results.some(
      (item) => item.id === card.dataset.trackId && item.isActive,
    );
    card.style.borderColor = isActive
      ? "rgba(255, 77, 102, 0.8)"
      : "rgba(255, 255, 255, 0.06)";
  });
}

function updateMainButton() {
  if (!tg) {
    return;
  }
  if (state.view !== "search") {
    tg.MainButton.hide();
    return;
  }
  const active = state.results.find((item) => item.isActive);
  if (active) {
    tg.MainButton.setParams({
      text: `Отправить: ${active.title}`,
      is_visible: true,
    });
  } else {
    tg.MainButton.hide();
  }
}

function renderResults() {
  const container = document.getElementById("results");
  if (!container) {
    return;
  }
  container.innerHTML = "";

  if (!state.results.length) {
    const placeholder = document.createElement("p");
    placeholder.className = "results__placeholder";
    placeholder.textContent =
      "Результатов пока нет. Введи запрос и нажми «Найти».";
    container.appendChild(placeholder);
    return;
  }

  state.results.forEach((track) => {
    const card = createTrackCard(track);
    container.appendChild(card);
  });
  highlightSelection();
}

function mockSearch(query) {
  if (state.view !== "search") {
    setView("search");
  }
  const seed = query.trim();
  if (!seed) {
    state.results = [];
    renderResults();
    updateMainButton();
    return;
  }

  const sample = [
    {
      id: "demo-track-1",
      title: `${seed} — демо 1`,
      artist: "Demo Artist",
      duration: "3:12",
      cover:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "demo-track-2",
      title: `${seed} — демо 2`,
      artist: "Another Artist",
      duration: "4:06",
      cover:
        "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "demo-track-3",
      title: `${seed} — демо 3`,
      artist: "Third Artist",
      duration: "2:54",
      cover:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=80",
    },
  ];

  state.results = sample.map((item) => ({ ...item, isActive: false }));
  renderResults();
  updateMainButton();
}

function wireEvents() {
  const input = document.getElementById("query");
  const button = document.getElementById("searchButton");

  if (!input || !button) {
    return;
  }

  const search = () => mockSearch(input.value);

  button.addEventListener("click", search);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      search();
    }
  });
}

function greetUser() {
  if (!state.user) {
    return;
  }
  const subtitle = document.querySelector(".app__subtitle");
  subtitle.textContent = `Привет, ${
    state.user.first_name ?? state.user.username ?? "друг"
  }! Найди трек и отправь его боту.`;
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
    .forEach((section) =>
      section.classList.toggle("view--active", section.dataset.view === view),
    );
  document
    .querySelectorAll("[data-view-target]")
    .forEach((navItem) => {
      const isActive = navItem.dataset.viewTarget === view;
      navItem.classList.toggle("nav-item--active", isActive);
    });
  playNavAnimation(view);
  if (view === "search") {
    updateMainButton();
  } else {
    tg?.MainButton.hide();
  }
}

function initNavigation() {
  const navItems = document.querySelectorAll("[data-view-target]");
  navItems.forEach((item) => {
    const target = item.dataset.viewTarget;
    const iconContainer = item.querySelector(".nav-item__icon");
    const lottieSrc = item.dataset.lottie;

    if (window.lottie && lottieSrc) {
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
        console.warn("Failed to init lottie animation:", error);
      }
    } else {
      const fallback = document.createElement("span");
      fallback.className = "nav-item__fallback";
      fallback.textContent = NAV_FALLBACK_ICONS[target] ?? "•";
      iconContainer.appendChild(fallback);
    }

    item.addEventListener("click", () => {
      setView(target);
    });
  });

  setView(state.view);
}

function bootstrap() {
  initTelegramUI();
  wireEvents();
  greetUser();
  initNavigation();
  renderResults();
}

bootstrap();
