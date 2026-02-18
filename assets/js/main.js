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
     1er tap: abre dropdown (no navega)
     2do tap: navega al href
  ====================================================== */
  document.querySelectorAll(".nav-drop > .pill").forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      const parent = this.closest(".nav-drop");
      const dropMenu = parent?.querySelector(".drop-menu");
      if (!parent || !dropMenu) return;

      // Desktop: hover manda
      if (isDesktopHover()) return;

      // Solo mobile
      if (!isMobile()) return;

      const alreadyOpen = parent.classList.contains("open");

      // 2do tap: navegar (cerramos antes)
      if (alreadyOpen) {
        closeMenu();
        return; // no preventDefault => navega
      }

      // 1er tap: abrir
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
     RESIZE: si pasas a desktop, limpia estados mobile
  ====================================================== */
  window.addEventListener(
    "resize",
    () => {
      if (!isMobile()) {
        closeMenu();
        // opcional: en desktop deja aria-expanded en false
        document.querySelectorAll(".nav-drop > .pill").forEach((a) => {
          a.setAttribute("aria-expanded", "false");
        });
      }
    },
    { passive: true },
  );

  /* ======================================================
     HERO CAROUSEL (Desktop: flechas + dots + autoplay)
     Mobile: swipe con scroll-snap (CSS)
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

    // Autoplay
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
        b.setAttribute("aria-label", `Ir al slide ${i + 1}`);
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

      // Mobile: scroll-snap (no transform)
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
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    // Botones
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

    // Teclado (solo desktop)
    root.addEventListener("keydown", (e) => {
      if (isMobile()) return;

      if (e.key === "ArrowLeft") {
        userInteracted = true;
        stopAutoplay();
        prev();
      }

      if (e.key === "ArrowRight") {
        userInteracted = true;
        stopAutoplay();
        next();
      }
    });

    // Pausa al hover/focus
    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", startAutoplay);

    // Resize: resync
    window.addEventListener("resize", () => {
      if (isMobile()) track.style.transform = "";
      goTo(index);
    });

    // Visibility
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) startAutoplay();
    });

    buildDots();
    goTo(0);
    startAutoplay();
  };

  initHeroCarousel();
});
