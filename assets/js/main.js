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
