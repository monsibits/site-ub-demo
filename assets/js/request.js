(function () {
  var form = document.querySelector("[data-request-form]");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll("[data-step]"));
  var markers = Array.prototype.slice.call(form.querySelectorAll("[data-step-marker]"));
  var summary = form.querySelector("[data-error-summary]");
  var addressBlock = form.querySelector("[data-address-block]");
  var dialog = document.getElementById("demo-dialog");
  var current = 0;

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function prefill() {
    var need = qs("need");
    if (need === "spec" || need === "sample") {
      var box = form.querySelector('input[name="need"][value="' + need + '"]');
      if (box) box.checked = true;
    }
    var app = qs("app");
    var map = { bakery: "bakery", beverage: "beverage", icecream: "icecream", fillings: "fillings", private_label: "private_label" };
    if (app && map[app]) {
      var sel = form.querySelector('[name="application"]');
      if (sel) sel.value = map[app];
    }
    toggleAddress();
  }

  function toggleAddress() {
    if (!addressBlock) return;
    var sample = form.querySelector('input[name="need"][value="sample"]');
    var on = sample && sample.checked;
    addressBlock.hidden = !on;
    var addr = addressBlock.querySelector('[name="address"]');
    if (addr) addr.required = !!on;
  }

  form.addEventListener("change", function (e) {
    if (e.target && e.target.name === "need") toggleAddress();
  });

  function showStep(i) {
    current = i;
    steps.forEach(function (step, n) {
      step.hidden = n !== i;
    });
    markers.forEach(function (m, n) {
      m.classList.toggle("is-current", n === i);
      m.classList.toggle("is-done", n < i);
    });
    if (summary) {
      summary.hidden = true;
      summary.textContent = "";
    }
    var first = steps[i].querySelector("input, select, textarea, button");
    if (first) first.focus();
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function isPhone(v) {
    return /^[+]?\d[\d\s().-]{6,}$/.test(v);
  }

  function setError(el, on, msg) {
    var id = el.id;
    var err = id && document.getElementById(id + "-error");
    el.setAttribute("aria-invalid", on ? "true" : "false");
    if (err) {
      err.hidden = !on;
      if (on && msg) err.textContent = msg;
    }
    return !on;
  }

  function validateStep(i) {
    var root = steps[i];
    var ok = true;
    var firstBad = null;
    var msgs = window.UB_VAL || {};

    function fail(el, msg) {
      ok = setError(el, true, msg) && ok;
      ok = false;
      if (!firstBad) firstBad = el;
    }

    root.querySelectorAll("[data-required]").forEach(function (el) {
      if (el.disabled || (el.closest("[hidden]"))) return;
      var val = (el.value || "").trim();
      if (!val) fail(el, el.getAttribute("data-msg-required") || msgs.required);
      else if (el.type === "email" && !isEmail(val)) fail(el, el.getAttribute("data-msg-email") || msgs.email);
      else setError(el, false);
    });

    root.querySelectorAll("select[data-required]").forEach(function (el) {
      if (el.closest("[hidden]")) return;
      if (!el.value) fail(el, el.getAttribute("data-msg-select") || msgs.select);
    });

    var needs = root.querySelectorAll('input[name="need"]');
    if (needs.length) {
      var any = Array.prototype.some.call(needs, function (n) { return n.checked; });
      var group = root.querySelector("[data-need-group]");
      if (!any) {
        ok = false;
        if (group) {
          group.setAttribute("aria-invalid", "true");
          var ne = document.getElementById("need-error");
          if (ne) { ne.hidden = false; ne.textContent = msgs.need || ""; }
        }
        if (!firstBad) firstBad = needs[0];
      } else if (group) {
        group.setAttribute("aria-invalid", "false");
        var ne2 = document.getElementById("need-error");
        if (ne2) ne2.hidden = true;
      }
    }

    var phone = root.querySelector('[name="phone"]');
    if (phone && phone.value.trim() && !isPhone(phone.value.trim())) {
      fail(phone, phone.getAttribute("data-msg-phone") || msgs.phone);
    }

    var consent = root.querySelector('[name="consent"]');
    if (consent && !consent.checked) {
      fail(consent, consent.getAttribute("data-msg-consent") || msgs.consent);
    }

    if (!ok && summary) {
      summary.hidden = false;
      summary.textContent = msgs.summary || "";
    }
    if (firstBad) firstBad.focus();
    return ok;
  }

  form.addEventListener("click", function (e) {
    var next = e.target.closest("[data-next]");
    var back = e.target.closest("[data-back]");
    if (next) {
      e.preventDefault();
      if (validateStep(current) && current < steps.length - 1) showStep(current + 1);
    }
    if (back) {
      e.preventDefault();
      if (current > 0) showStep(current - 1);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep(current)) return;
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
    else if (dialog) dialog.setAttribute("open", "");
  });

  prefill();
  showStep(0);
})();
