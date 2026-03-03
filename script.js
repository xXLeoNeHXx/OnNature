/* =========================================================
   On Nature - script.js (organizado, limpo e robusto)
   - Menu mobile + scroll suave (a11y)
   - Âncoras SEM hash na URL (logo / orçamento / topo) ✅
   - Botão topo (classe is-visible)
   - Header: some ao descer / aparece ao subir
   - Hero parallax (leve)
   - Reveal (IntersectionObserver)
   - Galeria GRID (sincronizada com scroll + loop) ✅ Android
   - GRID: desabilitar clique total
   - VALORES: 1 ativo por vez + troca imagem/texto + seta externa + teclado
   - BLOG: modal
   - CLIENTES: carrossel infinito contínuo + arrastar
   - Anti-cópia leve (somente imagens) + atalhos (opcional)
   - FORM: Netlify Forms via fetch + MODAL de sucesso (sem hash)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ===================== ELEMENTOS BASE ===================== */
  const header = document.querySelector("header");
  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const btnTopo = document.getElementById("btn-topo");
  const videoSection = document.querySelector(".video-section");

  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  const supportsSmoothScroll =
    "scrollBehavior" in document.documentElement.style && !prefersReducedMotion;

  /* ===================== HELPERS ===================== */
  function setMenuState(isOpen) {
    if (!navLinks || !toggle) return;
    navLinks.classList.toggle("open", isOpen);
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  function closeMobileMenu() {
    setMenuState(false);
  }

  function getHeaderOffset() {
    return header ? header.offsetHeight : 0;
  }

  function smoothScrollToTarget(targetEl) {
    if (!targetEl) return;
    const headerOffset = getHeaderOffset();
    const y = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: y, behavior: supportsSmoothScroll ? "smooth" : "auto" });
  }

  function isTypingContext(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase?.() ?? "";
    return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
  }

  function removeHashFromUrl() {
    // remove #... mantendo path e query, sem reload
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function removeHashAfterBrowserUpdates() {
    // Em Android/Chrome, às vezes o hash é aplicado depois do click — garantimos limpar depois
    requestAnimationFrame(() => removeHashFromUrl());
  }

  function getAnchorTarget(hash) {
    if (!hash || hash === "#") return null;
    try {
      return document.querySelector(hash);
    } catch {
      return null;
    }
  }

  /* ===================== MENU MOBILE ===================== */
  if (toggle && navLinks) {
    toggle.setAttribute("aria-controls", "nav-links");
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.contains("open");
      setMenuState(!isOpen);
    });

    document.addEventListener("click", (e) => {
      if (!navLinks.classList.contains("open")) return;
      const clickedInsideNav = navLinks.contains(e.target);
      const clickedToggle = toggle.contains(e.target);
      if (!clickedInsideNav && !clickedToggle) closeMobileMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (navLinks.classList.contains("open")) {
        closeMobileMenu();
        toggle.focus?.();
      }
    });
  }

  /* ===================== ÂNCORAS SEM HASH NA URL ✅ ===================== */
  (function initAnchorScrollNoHash() {
    // hashes que NÃO devem aparecer nunca na URL
    const cleanHashes = new Set(["#topo", "#orcamento", "#sucesso-modal"]);

    function handleAnchor(hash) {
      const target = getAnchorTarget(hash);
      if (!target) return false;

      smoothScrollToTarget(target);
      closeMobileMenu();

      // Se for um hash “proibido”, garantimos limpar
      if (cleanHashes.has(hash)) removeHashAfterBrowserUpdates();

      // Mesmo para outros hashes, se você preferir NUNCA ter # na URL,
      // descomente a linha abaixo:
      // removeHashAfterBrowserUpdates();

      return true;
    }

    // Intercepta clique em QUALQUER âncora (inclui logo)
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;

      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;

      e.preventDefault();
      handleAnchor(hash);

      // Se for topo/orçamento, não deixa o hash “grudar”
      if (cleanHashes.has(hash)) removeHashAfterBrowserUpdates();
    });

    // Se algum hash proibido aparecer (colar URL, etc.), limpa
    window.addEventListener("hashchange", () => {
      if (cleanHashes.has(window.location.hash)) removeHashAfterBrowserUpdates();
    });

    // Se abriu a página já com hash proibido, rola e limpa
    if (cleanHashes.has(window.location.hash)) {
      handleAnchor(window.location.hash);
      removeHashAfterBrowserUpdates();
    }
  })();

  /* ===================== BOTÃO TOPO ===================== */
  if (btnTopo) {
    btnTopo.classList.remove("is-visible");

    function updateBtnTopo() {
      if (!videoSection) {
        btnTopo.classList.toggle("is-visible", window.scrollY > 600);
        return;
      }
      const videoBottom = videoSection.offsetTop + videoSection.offsetHeight;
      btnTopo.classList.toggle("is-visible", window.scrollY > videoBottom);
    }

    window.addEventListener("scroll", updateBtnTopo, { passive: true });
    window.addEventListener("resize", updateBtnTopo, { passive: true });
    updateBtnTopo();

    btnTopo.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: supportsSmoothScroll ? "smooth" : "auto" });
      // garante que não aparece #topo por nada
      removeHashAfterBrowserUpdates();
    });
  }

  /* ===================== HEADER (SOME AO DESCER / APARECE AO SUBIR) ===================== */
  (function initHeaderBehavior() {
    if (!header) return;

    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;

      if (y < 24) {
        header.classList.remove("header-hidden");
        lastY = y;
        return;
      }

      const goingDown = y > lastY;
      header.classList.toggle("header-hidden", goingDown);
      lastY = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ===================== HERO PARALLAX (LEVE) ===================== */
  (function initHeroParallax() {
    if (prefersReducedMotion) return;

    const overlay = document.querySelector(".hero-parallax");
    const hero = document.querySelector(".video-section");
    if (!overlay || !hero) return;

    let rafId = null;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;

        const rect = hero.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        if (rect.bottom < 0 || rect.top > vh) return;

        const progress = Math.min(1, Math.max(0, 1 - rect.top / vh));
        overlay.style.transform = `translate3d(0, ${progress * 10}px, 0)`;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  })();

  /* ===================== REVEAL ===================== */
  (function initReveal() {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!els.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  })();

  /* ===================== GALERIA GRID (SINCRONIZADO COM SCROLL REAL) ===================== */
  (function initScrollGridGallery() {
    const viewport = document.querySelector("#gallery-1 .gallery-grid__viewport");
    if (!viewport) return;

    const tracks = Array.from(document.querySelectorAll("#gallery-1 .grid-track"));
    if (!tracks.length) return;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // Mais “colado” no scroll = maior. Mais suave = menor.
    const MULTIPLIER = 0.4;
    // 1 = sem suavização. Menor = mais inércia.
    const EASE = reduced ? 1 : 0.18;

    function ensureLoop(track) {
      const parentW = viewport.clientWidth || 1;

      if (!track.__originalCount) track.__originalCount = track.children.length;
      if (!track.__originalNodes) {
        track.__originalNodes = Array.from(track.children).map((n) => n.cloneNode(true));
      }

      const originals = track.__originalNodes;
      const originalCount = track.__originalCount;
      if (!originals.length || originalCount <= 0) return;

      // Reconstrói previsível: 2 conjuntos
      track.innerHTML = "";
      for (let k = 0; k < 2; k++) originals.forEach((n) => track.appendChild(n.cloneNode(true)));

      // Completa até ter folga suficiente
      let safety = 0;
      while (track.scrollWidth < parentW * 2.6 && safety < 12) {
        originals.forEach((n) => track.appendChild(n.cloneNode(true)));
        safety++;
      }

      // loopW REAL: distância do 1º item ao 1º item do 2º conjunto
      const children = track.children;
      const a0 = children[0];
      const a1 = children[originalCount];
      if (a0 && a1) {
        const w = a1.offsetLeft - a0.offsetLeft;
        track.__loopW = w > 0 ? w : (track.scrollWidth || 1);
      } else {
        track.__loopW = track.scrollWidth || 1;
      }
    }

    tracks.forEach(ensureLoop);

    const state = tracks.map((track) => ({
      el: track,
      dir: Number(track.dataset.baseDir || 1), // 1 ou -1
      x: 0,
    }));

    function toNegRange(v, w) {
      if (!(w > 0)) return 0;
      let m = v % w;
      if (m < 0) m += w; // [0, w)
      return m - w;      // [-w, 0)
    }

    function tick() {
      const scrollPos = window.scrollY;

      for (const s of state) {
        const w = s.el.__loopW || 1;
        const progress = scrollPos * MULTIPLIER;

        const desired =
          s.dir >= 0 ? toNegRange(-progress, w) : toNegRange(progress, w);

        s.x = EASE >= 1 ? desired : s.x + (desired - s.x) * EASE;
        s.el.style.transform = `translate3d(${s.x}px,0,0)`;
      }

      requestAnimationFrame(tick);
    }

    function rebuild() {
      tracks.forEach(ensureLoop);
    }

    window.addEventListener("resize", rebuild, { passive: true });
    window.addEventListener("load", rebuild, { once: true });

    rebuild();
    requestAnimationFrame(tick);
  })();

  /* ===================== GRID: DESABILITAR CLIQUE TOTAL ===================== */
  (function disableGridClick() {
    const grid = document.querySelector("#gallery-1");
    if (!grid) return;

    grid.addEventListener(
      "click",
      (e) => {
        const item = e.target.closest(".grid-item");
        if (!item) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      },
      true
    );

    grid.addEventListener(
      "keydown",
      (e) => {
        const item = e.target.closest(".grid-item");
        if (!item) return;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      },
      true
    );
  })();

  /* ===================== VALORES (DEFINITIVO + TECLADO) ===================== */
  (function initValores() {
    const section = document.getElementById("valores");
    if (!section) return;

    if (section.dataset.valoresInit === "1") return;
    section.dataset.valoresInit = "1";

    const tilesWrap = section.querySelector(".valores-tiles");
    const tiles = Array.from(section.querySelectorAll(".valor-tile"));
    const detail = section.querySelector("#valor-detalhe");
    const imgEl = section.querySelector("#valor-detalhe-img");
    const titleEl = section.querySelector("#valor-detalhe-title");
    const descEl = section.querySelector("#valor-detalhe-desc");

    if (!tilesWrap || !tiles.length || !detail || !imgEl || !titleEl || !descEl) return;

    function updateArrowTo(tile) {
      const wrapRect = tilesWrap.getBoundingClientRect();
      const tileRect = tile.getBoundingClientRect();
      const tileCenterX = tileRect.left + tileRect.width / 2;
      const xWithinWrap = tileCenterX - wrapRect.left;
      detail.style.setProperty("--arrow-x", `${xWithinWrap}px`);
    }

    function setRovingTabIndex(activeTile) {
      tiles.forEach((t) => t.setAttribute("tabindex", t === activeTile ? "0" : "-1"));
    }

    function setActive(tile, { focus = false } = {}) {
      tiles.forEach((t) => {
        t.classList.remove("is-active", "is-inactive");
        t.setAttribute("aria-selected", "false");
      });

      tile.classList.add("is-active");
      tile.setAttribute("aria-selected", "true");

      tiles.forEach((t) => {
        if (t !== tile) t.classList.add("is-inactive");
      });

      const img = tile.dataset.img || "";
      const title = tile.dataset.title || "";
      const desc = tile.dataset.desc || "";

      titleEl.textContent = title;
      descEl.textContent = desc;

      if (img) {
        imgEl.onerror = null;
        imgEl.onerror = () => {
          imgEl.onerror = null;
          imgEl.src = "assets/etica.jpg";
          imgEl.alt = "Imagem do valor selecionado";
        };

        imgEl.src = img;
        imgEl.alt = title ? `Imagem: ${title}` : "Imagem do valor selecionado";
      }

      setRovingTabIndex(tile);
      updateArrowTo(tile);
      if (focus) tile.focus?.();
    }

    const preSelected = tiles.find((t) => t.classList.contains("is-active")) || tiles[0];
    tiles.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    setActive(preSelected);

    tilesWrap.addEventListener("click", (e) => {
      const tile = e.target.closest(".valor-tile");
      if (!tile || !tilesWrap.contains(tile)) return;
      e.preventDefault();
      setActive(tile, { focus: true });
    });

    tilesWrap.addEventListener("keydown", (e) => {
      const current = e.target.closest(".valor-tile");
      if (!current || !tilesWrap.contains(current)) return;

      const idx = tiles.indexOf(current);
      if (idx < 0) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(current);
        return;
      }

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const next = tiles[(idx + dir + tiles.length) % tiles.length];
        setActive(next, { focus: true });
      }
    });

    let raf = null;
    function realign() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const active = section.querySelector(".valor-tile.is-active") || tiles[0];
        updateArrowTo(active);
      });
    }

    window.addEventListener("resize", realign, { passive: true });
    window.addEventListener("scroll", realign, { passive: true });
  })();

  /* ===================== BLOG MODAL ===================== */
  (function initBlogModal() {
    const blogLink = document.getElementById("blog-link");
    const modal = document.getElementById("blog-modal");
    const closeBtn = document.getElementById("close-blog-modal");
    if (!blogLink || !modal || !closeBtn) return;

    function openModal() {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus?.();
      removeHashAfterBrowserUpdates(); // garante URL limpa
    }

    function closeModal() {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      blogLink.focus?.();
      removeHashAfterBrowserUpdates();
    }

    blogLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });

    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    });
  })();

  /* ===================== CLIENTES: INFINITO + CONTÍNUO + ARRASTAR ===================== */
  (function initClientsInfiniteMarquee() {
    const marquee = document.getElementById("clients-marquee");
    const track = document.getElementById("clients-track");
    if (!marquee || !track) return;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const SPEED = reduced ? 18 : 34;

    const originals = Array.from(track.children).map((node) => node.cloneNode(true));
    if (!originals.length) return;

    let rafId = null;
    let lastTs = 0;
    let x = 0;

    let isDown = false;
    let startX = 0;
    let startOffset = 0;
    let isHovering = false;

    function buildLoop() {
      const marqueeW = marquee.clientWidth || 1;
      track.innerHTML = "";

      const appendSet = (hidden) => {
        originals.forEach((el) => {
          const node = el.cloneNode(true);
          if (hidden) {
            node.setAttribute("aria-hidden", "true");
            node.querySelectorAll?.("img").forEach((img) => img.setAttribute("alt", ""));
          }
          track.appendChild(node);
        });
      };

      appendSet(false);
      appendSet(true);

      let safety = 0;
      while (track.scrollWidth < marqueeW * 2.2 && safety < 10) {
        appendSet(false);
        appendSet(true);
        safety++;
      }
    }

    function loopWidth() {
      return track.scrollWidth / 2;
    }

    function normalize() {
      const w = loopWidth();
      if (!(w > 0)) return;
      x = x % w;
      if (x > 0) x -= w;
      return x;
    }

    function setTransform() {
      track.style.transform = `translate3d(${x}px,0,0)`;
    }

    function tick(ts) {
      const w = loopWidth();
      if (w <= 10) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      if (!isDown && !isHovering) {
        x -= SPEED * dt;
        normalize();
        setTransform();
      }

      rafId = requestAnimationFrame(tick);
    }

    marquee.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
      startOffset = x;
      marquee.setPointerCapture(e.pointerId);
    });

    marquee.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      x = startOffset + dx;
      normalize();
      setTransform();
    });

    marquee.addEventListener("pointerup", () => (isDown = false));
    marquee.addEventListener("pointercancel", () => (isDown = false));

    marquee.addEventListener("mouseenter", () => (isHovering = true));
    marquee.addEventListener("mouseleave", () => {
      isHovering = false;
      lastTs = 0;
    });

    function rebuild() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      lastTs = 0;

      buildLoop();
      normalize();
      setTransform();

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("resize", rebuild, { passive: true });
    window.addEventListener("load", rebuild, { once: true });

    requestAnimationFrame(rebuild);
  })();

  /* ===================== ANTI-CÓPIA LEVE (SOMENTE IMAGENS) ===================== */
  document.querySelectorAll("img").forEach((img) => {
    img.setAttribute("draggable", "false");
  });

  document.addEventListener("contextmenu", (e) => {
    if (e.target && e.target.tagName === "IMG") {
      e.preventDefault();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (isTypingContext(e.target)) return;

    const key = (e.key || "").toLowerCase();

    // (opcional) bloqueios de atalhos mais comuns
    if ((e.ctrlKey || e.metaKey) && ["c", "u", "s", "p"].includes(key)) {
      e.preventDefault();
    }

    if (e.key === "F12") e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key)) {
      e.preventDefault();
    }
  });

  /* ===================== FORM NETLIFY + MODAL SUCESSO (SEM HASH) ===================== */
  (function initFormNetlify() {
    const form = document.getElementById("form-contato");
    const sucessoModal = document.getElementById("sucesso-modal");
    const closeSucessoModal = document.getElementById("close-sucesso-modal");

    if (!form || !sucessoModal) return;

    function openSucesso() {
      sucessoModal.classList.add("active");
      sucessoModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeSucessoModal?.focus?.();
      removeHashAfterBrowserUpdates();
    }

    function closeSucesso() {
      sucessoModal.classList.remove("active");
      sucessoModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      removeHashAfterBrowserUpdates();
    }

    function encodeForm(formEl) {
      const data = new FormData(formEl);
      return new URLSearchParams(data).toString();
    }

    document.addEventListener(
      "submit",
      (e) => {
        const targetForm = e.target;
        if (!(targetForm instanceof HTMLFormElement)) return;
        if (targetForm.id !== "form-contato") return;

        e.preventDefault();
        e.stopPropagation();

        fetch(targetForm.getAttribute("action") || "/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodeForm(targetForm),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Resposta não OK do servidor.");
            targetForm.reset();
            openSucesso();
          })
          .catch((error) => {
            console.error("Erro:", error);
            alert("Erro ao enviar. Tente novamente.");
          });
      },
      true
    );

    closeSucessoModal?.addEventListener("click", closeSucesso);

    sucessoModal.addEventListener("click", (e) => {
      if (e.target === sucessoModal) closeSucesso();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sucessoModal.classList.contains("active")) closeSucesso();
    });
  })();

  /* ===================== LIMPEZA FINAL (se algo colocou hash) ===================== */
  (function finalUrlCleanIfNeeded() {
    const forbidden = new Set(["#topo", "#orcamento", "#sucesso-modal"]);
    if (forbidden.has(window.location.hash)) removeHashAfterBrowserUpdates();
  })();
});
