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


  /* Lead form -> /api/lead (progressive enhancement; plain POST still works) */
  var lf = document.querySelector(".lead-form");
  var st = document.getElementById("form-status");
  /* Per-form copy: a form may set data-ok-title / data-ok-body; the estimate wording is the default. */
  var formName = (lf && lf.getAttribute("name")) || "free-estimate";
  var okTitle = (lf && lf.getAttribute("data-ok-title")) || "Thanks — we’ve got it.";
  var okBody = (lf && lf.getAttribute("data-ok-body")) || "We’ll be in touch shortly to schedule your free estimate. Need us sooner? Call (775) 297-3236.";

  function say(kind, title, body) {
    if (!st) return;
    st.className = "form-status " + (kind === "ok" ? "is-ok" : "is-err");
    st.innerHTML = "<strong></strong><span></span>";
    st.firstChild.textContent = title;
    st.lastChild.textContent = body;
    st.hidden = false;
  }

  /* Show the no-JS redirect result (?sent=ok|invalid|error) */
  var sent = new URLSearchParams(location.search).get("sent");
  if (sent === "ok") {
    if (window.gtag) gtag("event", "generate_lead", { form: formName, method: "post" });
    say("ok", okTitle, okBody);
  } else if (sent === "invalid") {
    say("err", "Please check the form.", "Name and a valid email are required.");
  } else if (sent === "error") {
    say("err", "That didn’t send.", "Something went wrong on our end. Please call (775) 297-3236 and we’ll take the details directly.");
  }

  if (lf) {
    lf.addEventListener("submit", function (e) {
      if (!lf.reportValidity()) return;          /* let the browser show its own errors */
      e.preventDefault();
      lf.setAttribute("aria-busy", "true");
      var btn = lf.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : "";
      if (btn) btn.textContent = "Sending…";

      fetch(lf.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        /* URLSearchParams, not FormData: FormData posts multipart/form-data,
           which the handler does not parse. This sends the same encoding the
           plain no-JS form POST uses. */
        body: new URLSearchParams(new FormData(lf))
      }).then(function (r) {
        return r.json().catch(function () { return { ok: r.ok }; });
      }).then(function (d) {
        if (d && d.ok) {
          lf.reset();
          if (window.gtag) gtag("event", "generate_lead", { form: formName, method: "fetch" });
          say("ok", okTitle, okBody);
        } else {
          say("err", "That didn’t send.", (d && d.error) || "Please call (775) 297-3236 and we’ll take the details directly.");
        }
      }).catch(function () {
        say("err", "That didn’t send.", "Please call (775) 297-3236 and we’ll take the details directly.");
      }).then(function () {
        lf.removeAttribute("aria-busy");
        if (btn) btn.textContent = label;
        if (st) st.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

})();
