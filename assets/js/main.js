document.addEventListener("DOMContentLoaded", () => {
  /* ======================================================
     HELPERS
  ====================================================== */
  const body = document.body;
  const burger = document.querySelector(".burger");
  const topbar = document.querySelector(".topbar");
  const nav = document.querySelector(".nav");

  const mqDesktopHover = window.matchMedia("(hover: hover)");
  const mqMobile = window.matchMedia("(max-width: 860px)");
  const mqReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const isDesktopHover = () => mqDesktopHover.matches;
  const isMobile = () => mqMobile.matches;

  const closeDropdowns = () => {
    document.querySelectorAll(".nav-drop.open").forEach((item) => {
      item.classList.remove("open");
      item.querySelector(".pill")?.setAttribute("aria-expanded", "false");
    });
  };

  const closeMenu = () => {
    body.classList.remove("menu-open");
    burger?.setAttribute("aria-expanded", "false");
    closeDropdowns();
  };

  /* ======================================================
     BURGER TOGGLE
  ====================================================== */
  if (burger) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", String(open));
      if (!open) closeDropdowns();
    });
  }

  /* ======================================================
     COMPACT HEADER ON SCROLL
  ====================================================== */
  const handleScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle("compact", window.scrollY > 60);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  /* ======================================================
     MOBILE DROPDOWN (DOBLE TAP)
  ====================================================== */
  document.querySelectorAll(".nav-drop > .pill").forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      const parent = this.closest(".nav-drop");
      const dropMenu = parent?.querySelector(".drop-menu");
      if (!parent || !dropMenu) return;

      if (isDesktopHover()) return;
      if (!isMobile()) return;

      const alreadyOpen = parent.classList.contains("open");

      if (alreadyOpen) {
        closeMenu();
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      body.classList.add("menu-open");
      burger?.setAttribute("aria-expanded", "true");

      closeDropdowns();
      parent.classList.add("open");
      this.setAttribute("aria-expanded", "true");
    });
  });

  /* ======================================================
     CERRAR MENÚ AL TOCAR LINKS NORMALES
  ====================================================== */
  document
    .querySelectorAll(".nav a.pill:not(.nav-drop > .pill)")
    .forEach((link) => {
      link.addEventListener("click", () => {
        if (!isMobile()) return;
        closeMenu();
      });
    });

  /* ======================================================
     CERRAR AL TOCAR FUERA (MOBILE)
  ====================================================== */
  document.addEventListener("click", (e) => {
    if (!isMobile()) return;
    if (!body.classList.contains("menu-open")) return;

    const clickedBurger = e.target.closest(".burger");
    const clickedInsideNav = nav && nav.contains(e.target);

    if (clickedBurger || clickedInsideNav) return;

    closeMenu();
  });

  /* ======================================================
     ESC PARA CERRAR TODO
  ====================================================== */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMenu();
  });

  /* ======================================================
     RESIZE: limpia estados mobile
  ====================================================== */
  window.addEventListener(
    "resize",
    () => {
      if (!isMobile()) {
        closeMenu();
        document.querySelectorAll(".nav-drop > .pill").forEach((a) => {
          a.setAttribute("aria-expanded", "false");
        });
      }
    },
    { passive: true },
  );

  /* ======================================================
     HERO CAROUSEL
  ====================================================== */
  const initHeroCarousel = () => {
    const root = document.querySelector(".hero-carousel");
    if (!root) return;

    const track = root.querySelector(".carousel-track");
    const slides = Array.from(root.querySelectorAll(".carousel-slide"));
    const prevBtn = root.querySelector(".carousel-btn.prev");
    const nextBtn = root.querySelector(".carousel-btn.next");
    const dotsWrap = root.querySelector(".carousel-dots");

    if (!track || slides.length === 0) return;

    let index = 0;
    const AUTOPLAY_MS = 4500;
    let autoplayTimer = null;
    let userInteracted = false;

    const buildDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `carousel-dot${i === 0 ? " is-active" : ""}`;
        b.addEventListener("click", () => {
          userInteracted = true;
          stopAutoplay();
          goTo(i);
        });
        dotsWrap.appendChild(b);
      });
    };

    const syncDots = () => {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll(".carousel-dot").forEach((d, i) => {
        d.classList.toggle("is-active", i === index);
      });
    };

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;

      if (isMobile()) {
        slides[index].scrollIntoView({
          behavior: "smooth",
          inline: "start",
          block: "nearest",
        });
        syncDots();
        return;
      }

      track.style.transform = `translateX(-${index * 100}%)`;
      syncDots();
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const startAutoplay = () => {
      if (mqReducedMotion.matches) return;
      if (userInteracted) return;
      if (slides.length <= 1) return;

      stopAutoplay();
      autoplayTimer = window.setInterval(() => {
        if (document.hidden) return;
        next();
      }, AUTOPLAY_MS);
    };

    const stopAutoplay = () => {
      if (!autoplayTimer) return;
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    prevBtn?.addEventListener("click", () => {
      userInteracted = true;
      stopAutoplay();
      prev();
    });

    nextBtn?.addEventListener("click", () => {
      userInteracted = true;
      stopAutoplay();
      next();
    });

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);

    buildDots();
    goTo(0);
    startAutoplay();
  };

  initHeroCarousel();

  /* ======================================================
     SAFE YOUTUBE EMBED (Preview → Iframe)
  ====================================================== */
  const ytBlocks = document.querySelectorAll(".yt-embed");

  const buildIframe = (id) => {
    const iframe = document.createElement("iframe");
    iframe.className = "yt-embed__iframe";
    iframe.title = "YouTube video player";
    iframe.loading = "lazy";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(
      id,
    )}?autoplay=1&rel=0`;
    return iframe;
  };

  ytBlocks.forEach((wrap) => {
    const id = wrap.getAttribute("data-video-id");
    const previewBtn = wrap.querySelector(".yt-embed__preview");
    if (!id || !previewBtn) return;

    previewBtn.addEventListener("click", () => {
      const iframe = buildIframe(id);
      wrap.replaceChildren(iframe);
    });
  });
});
