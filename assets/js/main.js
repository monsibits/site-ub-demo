(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hero = document.querySelector(".hero");
  if (hero) hero.classList.add("is-ready");

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function showNearby() {
    var vh = window.innerHeight || 800;
    reveals.forEach(function (el) {
      if (el.classList.contains("is-in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 1.15 && r.bottom > -80) el.classList.add("is-in");
    });
  }
  if (reduce.matches || !("IntersectionObserver" in window) || !reveals.length) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "80px 0px 80px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    showNearby();
    window.addEventListener("scroll", showNearby, { passive: true });
    window.addEventListener("load", showNearby);
  }

  var ticker = document.querySelector(".tagline-band");
  if (ticker && "IntersectionObserver" in window) {
    var tIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ticker.classList.toggle("is-offscreen", !entry.isIntersecting);
      });
    }, { threshold: 0 });
    tIO.observe(ticker);
  }

  var langRoots = Array.prototype.slice.call(document.querySelectorAll("[data-lang-switch]"));
  if (langRoots.length) {
    function langLinks(root) {
      return Array.prototype.slice.call(root.querySelectorAll(".lang-switch__list a"));
    }
    function syncExpanded(root) {
      var summary = root.querySelector("summary");
      if (summary) summary.setAttribute("aria-expanded", root.open ? "true" : "false");
    }
    langRoots.forEach(function (root) {
      syncExpanded(root);
      root.addEventListener("toggle", function () { syncExpanded(root); });
      root.addEventListener("keydown", function (event) {
        var summary = root.querySelector("summary");
        var links = langLinks(root);
        var current = document.activeElement;
        var index = links.indexOf(current);
        if (event.key === "Escape" && root.open) {
          event.preventDefault();
          root.removeAttribute("open");
          if (summary) summary.focus();
          return;
        }
        if (!root.open && (event.key === "ArrowDown" || event.key === "ArrowUp") && current === summary) {
          event.preventDefault();
          root.setAttribute("open", "");
          if (links.length) links[event.key === "ArrowDown" ? 0 : links.length - 1].focus();
          return;
        }
        if (!root.open || !links.length) return;
        if (event.key === "Home") {
          event.preventDefault();
          links[0].focus();
        } else if (event.key === "End") {
          event.preventDefault();
          links[links.length - 1].focus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          if (index < 0) {
            links[event.key === "ArrowDown" ? 0 : links.length - 1].focus();
            return;
          }
          if (event.key === "ArrowDown") links[(index + 1) % links.length].focus();
          else links[(index - 1 + links.length) % links.length].focus();
        }
      });
    });
    document.addEventListener("click", function (event) {
      langRoots.forEach(function (root) {
        if (root.open && !root.contains(event.target)) root.removeAttribute("open");
      });
    });
    document.addEventListener("focusin", function (event) {
      langRoots.forEach(function (root) {
        if (root.open && !root.contains(event.target)) root.removeAttribute("open");
      });
    });
  }

  var sticky = document.querySelector("[data-sticky-cta]");
  if (!sticky) return;
  if (sessionStorage.getItem("ub-sticky-hide") === "1") return;

  var heroEl = document.querySelector("[data-hero]");
  var footer = document.querySelector("footer");
  var heroGone = !heroEl;
  var footerIn = false;

  function update() {
    var show = heroGone && !footerIn;
    sticky.classList.toggle("is-visible", show);
    sticky.toggleAttribute("hidden", !show);
  }

  if ("IntersectionObserver" in window) {
    if (heroEl) {
      var hIO = new IntersectionObserver(function (entries) {
        heroGone = !entries[0].isIntersecting;
        update();
      }, { threshold: 0.05 });
      hIO.observe(heroEl);
    }
    if (footer) {
      var fIO = new IntersectionObserver(function (entries) {
        footerIn = entries[0].isIntersecting;
        update();
      }, { threshold: 0 });
      fIO.observe(footer);
    }
  } else {
    heroGone = true;
    update();
  }

  var hide = sticky.querySelector("[data-sticky-dismiss]");
  if (hide) {
    hide.addEventListener("click", function () {
      sessionStorage.setItem("ub-sticky-hide", "1");
      sticky.classList.remove("is-visible");
      sticky.setAttribute("hidden", "");
    });
  }
})();
