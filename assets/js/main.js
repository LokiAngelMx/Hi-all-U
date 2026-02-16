document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const burger = document.querySelector(".burger");
  const topbar = document.querySelector(".topbar");
  const nav = document.querySelector(".nav");

  const isDesktopHover = () => window.matchMedia("(hover: hover)").matches;
  const isMobile = () => window.matchMedia("(max-width: 860px)").matches;

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

  /* =========================================
     BURGER TOGGLE
  ========================================= */
  if (burger) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", String(open));
      if (!open) closeDropdowns();
    });
  }

  /* =========================================
     COMPACT HEADER ON SCROLL
  ========================================= */
  const handleScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle("compact", window.scrollY > 60);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  /* =========================================
     MOBILE DROPDOWN (DOBLE TAP)
     1er tap: abre dropdown (no navega)
     2do tap: navega al href
  ========================================= */
  document.querySelectorAll(".nav-drop > .pill").forEach((trigger) => {
    trigger.addEventListener("click", function (e) {
      const parent = this.closest(".nav-drop");
      const dropMenu = parent?.querySelector(".drop-menu");
      if (!parent || !dropMenu) return;

      // Desktop: hover manda (no tocamos comportamiento)
      if (isDesktopHover()) return;

      // Solo en mobile aplicamos doble tap
      if (!isMobile()) return;

      const alreadyOpen = parent.classList.contains("open");

      // 2do tap -> navegar (cerramos antes de cambiar de página)
      if (alreadyOpen) {
        closeMenu();
        return; // no preventDefault -> navega al href
      }

      // 1er tap -> abrir dropdown
      e.preventDefault();
      e.stopPropagation();

      // Asegura drawer abierto
      body.classList.add("menu-open");
      burger?.setAttribute("aria-expanded", "true");

      // Cierra otros dropdowns y abre este
      closeDropdowns();
      parent.classList.add("open");
      this.setAttribute("aria-expanded", "true");
    });
  });

  /* =========================================
     CERRAR MENÚ AL TOCAR LINKS NORMALES
  ========================================= */
  document
    .querySelectorAll(".nav a.pill:not(.nav-drop > .pill)")
    .forEach((link) => {
      link.addEventListener("click", () => {
        if (!isMobile()) return;
        closeMenu();
      });
    });

  /* =========================================
     CERRAR AL TOCAR FUERA (MOBILE)
  ========================================= */
  document.addEventListener("click", (e) => {
    if (!isMobile()) return;
    if (!body.classList.contains("menu-open")) return;

    const clickedBurger = e.target.closest(".burger");
    const clickedInsideNav = nav && nav.contains(e.target);

    if (clickedBurger || clickedInsideNav) return;

    closeMenu();
  });

  /* =========================================
     ESC para cerrar todo
  ========================================= */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMenu();
  });

  /* =========================================
     RESIZE: si pasas a desktop, limpia estados mobile
  ========================================= */
  window.addEventListener(
    "resize",
    () => {
      if (!isMobile()) {
        body.classList.remove("menu-open");
        burger?.setAttribute("aria-expanded", "false");
        closeDropdowns();

        // opcional: asegura aria-expanded false en desktop
        document.querySelectorAll(".nav-drop > .pill").forEach((a) => {
          a.setAttribute("aria-expanded", "false");
        });
      }
    },
    { passive: true },
  );
});
