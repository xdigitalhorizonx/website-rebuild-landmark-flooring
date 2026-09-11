/* Landmark Flooring — shared sub-page JS.
   Home (index.html) keeps its own inline script (rail + easter egg). This file
   covers the behaviours every sub-page needs: header shadow on scroll,
   JS-off-safe reveal, an accessible mobile nav toggle, and the footer year.
   Kept dependency-free and reduced-motion aware. */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");

  /* Header shadow on scroll */
  if (header) {
    addEventListener("scroll", function () {
      header.classList.toggle("scrolled", scrollY > 18);
    }, { passive: true });
  }

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    /* close the menu when a link is chosen or Escape pressed */
    var nav = header.querySelector(".nav-links");
    if (nav) nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { header.classList.remove("menu-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
    addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("menu-open")) {
        header.classList.remove("menu-open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus();
      }
    });
  }

  /* On-scroll reveal (JS-off-safe via <noscript> in <head>; reduced-motion shows all) */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Free-estimate form: progressive enhancement over a real form POST.
     With JS off the form still submits normally to /api/lead; this just keeps
     the visitor on the page and reports success or failure inline. */
  var leadForm = document.getElementById("lead-form");
  if (leadForm) {
    var status = document.getElementById("lead-status");
    var submit = leadForm.querySelector('button[type="submit"]');
    var submitLabel = submit ? submit.innerHTML : "";

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.hidden = false;
      status.className = "form-status is-" + kind;
    }

    leadForm.addEventListener("submit", function (e) {
      if (!window.fetch || !leadForm.checkValidity()) return;   // let the browser handle it
      e.preventDefault();

      if (submit) { submit.disabled = true; submit.textContent = "Sending\u2026"; }
      say("Sending your request\u2026", "pending");

      fetch(leadForm.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(leadForm)))
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok && d.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d && res.d.error);
          leadForm.reset();
          say("Thanks \u2014 your request is in. We'll call you to schedule your free estimate.", "ok");
          if (submit) submit.remove();
        })
        .catch(function (err) {
          say(
            (err && err.message) ||
              "Something went wrong sending that. Please call (775) 297-3236 and we'll take your details.",
            "err"
          );
          if (submit) { submit.disabled = false; submit.innerHTML = submitLabel; }
        });
    });
  }
})();
