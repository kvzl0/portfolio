// Scroll story controller: tracks the active chapter, updates the dot rail
// and caption, and publishes scroll progress for the 3D scene (scene.js).
(function () {
  "use strict";

  var story = document.querySelector(".story");
  var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".stage__dot"));
  var notation = document.querySelector("[data-notation]:not(.chapter)");
  if (!story || !chapters.length) return;

  story.classList.add("story--3d");

  var tops = [];
  var heights = [];
  var active = -1;
  var ticking = false;

  // window.storyProgress goes from 0 (first chapter) to chapters.length - 1.
  // Each chapter holds its scene for the first 55% of its height, then
  // morphs toward the next chapter's scene.
  window.storyProgress = 0;

  function measure() {
    tops = chapters.map(function (c) { return c.offsetTop; });
    heights = chapters.map(function (c) { return c.offsetHeight; });
    chapters.forEach(function (c) {
      var copy = c.querySelector(".chapter__copy");
      if (copy) copy.style.setProperty("--copy-h", copy.offsetHeight + "px");
    });
  }

  function smoothstep(a, b, x) {
    var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function update() {
    ticking = false;
    var line = window.scrollY + window.innerHeight * 0.5;
    var i = 0;
    for (var k = 0; k < tops.length; k++) {
      if (line >= tops[k]) i = k;
    }
    var frac = heights[i] ? (line - tops[i]) / heights[i] : 0;
    var last = chapters.length - 1;
    window.storyProgress = i >= last ? last : i + smoothstep(0.55, 1, frac);

    if (i !== active) {
      if (active >= 0) {
        chapters[active].removeAttribute("data-active");
        if (dots[active]) dots[active].removeAttribute("data-active");
      } else {
        chapters.forEach(function (c) { c.removeAttribute("data-active"); });
        dots.forEach(function (d) { d.removeAttribute("data-active"); });
      }
      chapters[i].setAttribute("data-active", "");
      if (dots[i]) dots[i].setAttribute("data-active", "");
      if (notation) notation.textContent = chapters[i].getAttribute("data-notation") || "";
      active = i;
    }
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  measure();
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", function () { measure(); requestUpdate(); });
  window.addEventListener("load", function () { measure(); requestUpdate(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { measure(); requestUpdate(); });
  }
  // Opening or closing a project row changes chapter heights.
  document.addEventListener("toggle", function () { measure(); requestUpdate(); }, true);

  // Copy email button
  var copyBtn = document.querySelector("[data-copy]");
  if (copyBtn) {
    var label = copyBtn.querySelector("[data-copy-label]");
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.getAttribute("data-copy");
      var done = function () {
        if (!label) return;
        label.textContent = "Copied";
        setTimeout(function () { label.textContent = "Copy"; }, 2000);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var input = document.createElement("textarea");
        input.value = text;
        input.setAttribute("readonly", "");
        input.style.position = "absolute";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
        document.body.removeChild(input);
      }
    });
  }

  // Certificate preview: certificate links open an image in a dialog
  // instead of a new tab. Without JavaScript (or <dialog> support) the
  // links still open the PDF.
  var cert = document.querySelector("dialog.cert");
  if (cert && typeof cert.showModal === "function") {
    var certImg = cert.querySelector(".cert__img");
    var certTitle = cert.querySelector(".cert__title");
    var certPdf = cert.querySelector("[data-cert-pdf]");
    var opener = null;

    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[data-cert]");
      // Let ctrl/cmd/shift/middle clicks open the PDF as usual
      if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      opener = link;
      var title = link.getAttribute("data-cert-title") || "Certificate";
      certImg.src = link.getAttribute("data-cert");
      certImg.alt = title;
      certTitle.textContent = title;
      certPdf.href = link.getAttribute("href");
      document.documentElement.classList.add("has-dialog");
      cert.showModal();
    });

    cert.querySelector("[data-cert-close]").addEventListener("click", function () {
      cert.close();
    });
    // Clicking the dark area around the certificate closes it
    cert.addEventListener("click", function (e) {
      if (e.target === cert) cert.close();
    });
    cert.addEventListener("close", function () {
      document.documentElement.classList.remove("has-dialog");
      if (opener) opener.focus();
    });
  }
})();
