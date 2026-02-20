document.addEventListener("DOMContentLoaded", () => {
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

  if (burger) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", String(open));
      if (!open) closeDropdowns();
    });
  }

  const handleScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle("compact", window.scrollY > 60);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

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

  document
    .querySelectorAll(".nav a.pill:not(.nav-drop > .pill)")
    .forEach((link) => {
      link.addEventListener("click", () => {
        if (!isMobile()) return;
        closeMenu();
      });
    });

  document.addEventListener("click", (e) => {
    if (!isMobile()) return;
    if (!body.classList.contains("menu-open")) return;

    const clickedBurger = e.target.closest(".burger");
    const clickedInsideNav = nav && nav.contains(e.target);

    if (clickedBurger || clickedInsideNav) return;

    closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMenu();
  });

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

  const initHeroCarousel = () => {
    const root = document.querySelector(".hero-carousel");
    if (!root) return;

    const viewport = root.querySelector(".carousel-viewport");
    const track = root.querySelector(".carousel-track");
    const slides = Array.from(root.querySelectorAll(".carousel-slide"));
    const prevBtn = root.querySelector(".carousel-btn.prev");
    const nextBtn = root.querySelector(".carousel-btn.next");
    const dotsWrap = root.querySelector(".carousel-dots");

    if (!track || !viewport || slides.length === 0) return;

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

    const goTo = (i, opts = { behavior: "smooth" }) => {
      index = (i + slides.length) % slides.length;

      // En mobile solo se mueve el scroll horizontal para evitar saltos verticales.
      if (isMobile()) {
        const target = slides[index];
        const left = target.offsetLeft;

        viewport.scrollTo({
          left,
          behavior: mqReducedMotion.matches ? "auto" : opts.behavior,
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

    let raf = null;
    viewport.addEventListener(
      "scroll",
      () => {
        if (!isMobile()) return;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const x = viewport.scrollLeft;

          let closest = 0;
          let best = Infinity;

          slides.forEach((s, i) => {
            const d = Math.abs(s.offsetLeft - x);
            if (d < best) {
              best = d;
              closest = i;
            }
          });

          if (closest !== index) {
            index = closest;
            syncDots();
          }
        });
      },
      { passive: true },
    );

    // En mobile no se fuerza re-centrado al redimensionar para evitar brincos.
    window.addEventListener(
      "resize",
      () => {
        if (isMobile()) {
          track.style.transform = "";
          syncDots();
          return;
        }
        goTo(index, { behavior: "auto" });
      },
      { passive: true },
    );

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) startAutoplay();
    });

    buildDots();
    goTo(0, { behavior: "auto" });
    startAutoplay();
  };

  initHeroCarousel();

  // Carga el iframe de YouTube solo tras interacción para mejorar rendimiento y privacidad.
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
