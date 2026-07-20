/* christophergusenbauer.at – Navigation, Sternenhimmel, Reveals, Flickr, Blog-Toggle */
(function () {
  "use strict";

  /* Reveal-Effekte nur mit aktivem JS verstecken (No-JS-Fallback) */
  document.documentElement.classList.add("js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navigation ---------- */
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.getElementById("site-menu");

  if (header && navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });

    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------- Scroll-Reveals ---------- */
  var revealables = document.querySelectorAll("[data-reveal], [data-reveal-comet]");

  if (revealables.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("revealed"); });
    } else {
      var staggerCounter = new WeakMap();
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var parent = entry.target.parentElement;
          var idx = staggerCounter.get(parent) || 0;
          staggerCounter.set(parent, idx + 1);
          entry.target.style.transitionDelay = Math.min(idx * 90, 360) + "ms";
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px -60px 0px" });

      revealables.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Sternenhimmel (Hero) ---------- */
  var canvas = document.getElementById("starfield");

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var stars = [];
    var meteors = [];
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pointerX = 0.5;
    var rafId = null;
    var lastMeteor = 0;

    var resize = function () {
      var rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars = [];
      var count = Math.min(260, Math.round((width * height) / 6500));
      for (var i = 0; i < count; i++) {
        var depth = Math.random(); // 0 = fern, 1 = nah
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.4 + depth * 1.3,
          depth: depth,
          tw: Math.random() * Math.PI * 2,
          twSpeed: 0.4 + Math.random() * 1.1,
          warm: Math.random() < 0.18
        });
      }
    };

    var spawnMeteor = function () {
      meteors.push({
        x: width * (0.15 + Math.random() * 0.8),
        y: -20,
        vx: -(2.4 + Math.random() * 2.2),
        vy: 3.2 + Math.random() * 2.4,
        life: 1,
        decay: 0.008 + Math.random() * 0.006,
        len: 70 + Math.random() * 60
      });
    };

    var drawStatic = function () {
      ctx.clearRect(0, 0, width, height);
      stars.forEach(function (s) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm ? "rgba(255,207,135,0.8)" : "rgba(224,222,255,0.75)";
        ctx.fill();
      });
    };

    var frame = function (t) {
      ctx.clearRect(0, 0, width, height);
      var parallax = (pointerX - 0.5) * 18;

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + (t / 1000) * s.twSpeed));
        var x = s.x + parallax * s.depth;
        ctx.beginPath();
        ctx.arc(x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm
          ? "rgba(255,207,135," + alpha * 0.9 + ")"
          : "rgba(224,222,255," + alpha * 0.8 + ")";
        ctx.fill();
      }

      if (t - lastMeteor > 3500 + Math.random() * 4000 && meteors.length < 2) {
        spawnMeteor();
        lastMeteor = t;
      }

      for (var m = meteors.length - 1; m >= 0; m--) {
        var mt = meteors[m];
        mt.x += mt.vx;
        mt.y += mt.vy;
        mt.life -= mt.decay;
        if (mt.life <= 0 || mt.y > height + 40) {
          meteors.splice(m, 1);
          continue;
        }
        var norm = Math.hypot(mt.vx, mt.vy);
        var tailX = mt.x - (mt.vx / norm) * mt.len;
        var tailY = mt.y - (mt.vy / norm) * mt.len;
        var grad = ctx.createLinearGradient(mt.x, mt.y, tailX, tailY);
        grad.addColorStop(0, "rgba(255,255,255," + 0.9 * mt.life + ")");
        grad.addColorStop(0.3, "rgba(255,207,135," + 0.55 * mt.life + ")");
        grad.addColorStop(1, "rgba(255,207,135,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(mt.x, mt.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      rafId = window.requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", function () {
      resize();
      if (prefersReducedMotion) drawStatic();
    });

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      window.addEventListener("pointermove", function (e) {
        pointerX = e.clientX / window.innerWidth;
      }, { passive: true });

      /* Canvas pausieren, wenn der Hero nicht sichtbar ist */
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && rafId === null) {
              rafId = window.requestAnimationFrame(frame);
            } else if (!entry.isIntersecting && rafId !== null) {
              window.cancelAnimationFrame(rafId);
              rafId = null;
            }
          });
        }).observe(canvas);
      } else {
        rafId = window.requestAnimationFrame(frame);
      }
    }
  }

  /* ---------- Spiegelung im Wasser (Berg & Sternenhimmel) ---------- */
  var waterCanvas = document.getElementById("watersky");
  var nightWater = document.querySelector(".night-water");
  var mirrorEl = document.querySelector(".water-mirror");

  if (waterCanvas && waterCanvas.getContext && nightWater && mirrorEl) {
    var wctx = waterCanvas.getContext("2d");
    var wdpr = Math.min(window.devicePixelRatio || 1, 2);
    var wWidth = 0;
    var wHeight = 0;
    var lineY = 0; // y-Position der Wasserlinie im Canvas
    var wStars = [];
    var wRaf = null;

    var resizeWater = function () {
      wWidth = nightWater.clientWidth;
      lineY = mirrorEl.offsetTop;
      /* Canvas nur so hoch wie nötig – die Spiegelung verblasst mit der Tiefe */
      wHeight = Math.min(nightWater.clientHeight, lineY + 1400);
      waterCanvas.style.height = wHeight + "px";
      waterCanvas.width = wWidth * wdpr;
      waterCanvas.height = wHeight * wdpr;
      wctx.setTransform(wdpr, 0, 0, wdpr, 0, 0);

      wStars = [];
      /* Sterne am Abendhimmel über dem Berg */
      var skyCount = Math.min(90, Math.round((wWidth * lineY) / 14000));
      for (var i = 0; i < skyCount; i++) {
        wStars.push({
          type: "sky",
          x: Math.random() * wWidth,
          y: Math.random() * lineY * 0.72,
          r: 0.4 + Math.random() * 1.2,
          tw: Math.random() * Math.PI * 2,
          twSpeed: 0.4 + Math.random() * 1,
          warm: Math.random() < 0.2
        });
      }
      /* Gespiegelte Sterne im Wasser – gestreckt, gedimmt, leicht wackelnd */
      var reflDepth = wHeight - lineY;
      var reflCount = Math.min(130, Math.round((wWidth * reflDepth) / 10000));
      for (var j = 0; j < reflCount; j++) {
        var depth = Math.random();
        wStars.push({
          type: "refl",
          x: Math.random() * wWidth,
          y: lineY + 14 + depth * reflDepth * 0.85,
          depth: depth,
          r: 0.4 + Math.random() * 1.2,
          tw: Math.random() * Math.PI * 2,
          twSpeed: 0.5 + Math.random() * 1.2,
          warm: Math.random() < 0.25
        });
      }
    };

    var drawWaterStatic = function () {
      wctx.clearRect(0, 0, wWidth, wHeight);
      wStars.forEach(function (s) {
        var refl = s.type === "refl";
        wctx.globalAlpha = refl ? 0.4 * (1 - s.depth * 0.8) : 0.75;
        wctx.beginPath();
        if (refl) {
          wctx.ellipse(s.x, s.y, s.r * 0.9, s.r * 2, 0, 0, Math.PI * 2);
        } else {
          wctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        }
        wctx.fillStyle = s.warm ? "rgb(255,207,135)" : "rgb(244,240,255)";
        wctx.fill();
      });
      wctx.globalAlpha = 1;
    };

    var waterFrame = function (t) {
      wctx.clearRect(0, 0, wWidth, wHeight);

      for (var i = 0; i < wStars.length; i++) {
        var s = wStars[i];
        var alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + (t / 1000) * s.twSpeed));
        wctx.beginPath();
        if (s.type === "refl") {
          /* Spiegelbild: dunkler, in die Länge gezogen, wackelt sanft */
          var wob = Math.sin(t / 900 + s.y * 0.06) * 1.6;
          wctx.globalAlpha = alpha * 0.45 * (1 - s.depth * 0.75);
          wctx.ellipse(s.x + wob, s.y, s.r * 0.9, s.r * 2.2, 0, 0, Math.PI * 2);
        } else {
          wctx.globalAlpha = alpha * 0.85;
          wctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        }
        wctx.fillStyle = s.warm ? "rgb(255,207,135)" : "rgb(244,240,255)";
        wctx.fill();
      }
      wctx.globalAlpha = 1;

      wRaf = window.requestAnimationFrame(waterFrame);
    };

    resizeWater();
    window.addEventListener("resize", function () {
      resizeWater();
      if (prefersReducedMotion) drawWaterStatic();
    });
    window.addEventListener("load", function () {
      resizeWater();
      if (prefersReducedMotion) drawWaterStatic();
    });

    if (prefersReducedMotion) {
      drawWaterStatic();
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && wRaf === null) {
            wRaf = window.requestAnimationFrame(waterFrame);
          } else if (!entry.isIntersecting && wRaf !== null) {
            window.cancelAnimationFrame(wRaf);
            wRaf = null;
          }
        });
      }).observe(waterCanvas);
    } else {
      wRaf = window.requestAnimationFrame(waterFrame);
    }
  }

  /* ---------- Blog einklappen ---------- */
  var blogSection = document.getElementById("blog");
  var blogToggle = document.getElementById("blog-toggle");

  if (blogSection && blogToggle) {
    var toggleLabel = blogToggle.querySelector(".blog-toggle-label");

    var setBlogCollapsed = function (collapsed) {
      blogSection.classList.toggle("blog-collapsed", collapsed);
      blogToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      if (toggleLabel) toggleLabel.textContent = collapsed ? "Ausklappen" : "Einklappen";
      try {
        localStorage.setItem("blogCollapsed", collapsed ? "1" : "0");
      } catch (err) { /* Speichern optional */ }
    };

    try {
      if (localStorage.getItem("blogCollapsed") === "1") setBlogCollapsed(true);
    } catch (err) { /* Lesen optional */ }

    blogToggle.addEventListener("click", function () {
      setBlogCollapsed(!blogSection.classList.contains("blog-collapsed"));
    });
  }

  /* ---------- Lebenslauf: mehr anzeigen ---------- */
  var cvMore = document.getElementById("cv-more");
  var cvExtra = document.getElementById("cv-extra");

  if (cvMore && cvExtra) {
    cvMore.addEventListener("click", function () {
      var show = cvExtra.hidden;
      cvExtra.hidden = !show;
      cvMore.setAttribute("aria-expanded", show ? "true" : "false");
      cvMore.textContent = show
        ? "Weniger anzeigen"
        : "Mehr anzeigen – Praktika, Zertifikate, Sprachen & Skills";
    });
  }

  /* ---------- Flickr-Livefeed ---------- */
  var gallery = document.getElementById("flickr-gallery");

  if (gallery && gallery.dataset.flickrUser) {
    var userId = gallery.dataset.flickrUser.trim();
    var albumId = (gallery.dataset.flickrAlbum || "").trim();

    if (userId) {
      var CALLBACK = "cgFlickrFeed";
      var done = false;

      var renderPhotos = function (items) {
        if (!items || !items.length) return;
        var frag = document.createDocumentFragment();
        items.slice(0, 12).forEach(function (item) {
          var wrap = document.createElement("div");
          wrap.className = "mItem";
          var link = document.createElement("a");
          link.href = item.link;
          link.target = "_blank";
          link.rel = "noopener";
          var img = document.createElement("img");
          /* _m (240px) gegen _z (640px) tauschen für schärfere Bilder */
          img.src = (item.media && item.media.m ? item.media.m : "").replace("_m.", "_z.");
          img.alt = item.title || "Foto von Christopher Gusenbauer";
          img.loading = "lazy";
          link.appendChild(img);
          wrap.appendChild(link);
          frag.appendChild(wrap);
        });
        gallery.innerHTML = "";
        gallery.appendChild(frag);
        var liveBadge = document.getElementById("gallery-live");
        if (liveBadge) liveBadge.hidden = false;
      };

      window[CALLBACK] = function (data) {
        done = true;
        renderPhotos(data && data.items);
      };

      var feedUrl = albumId
        ? "https://api.flickr.com/services/feeds/photoset.gne?set=" + encodeURIComponent(albumId) +
          "&nsid=" + encodeURIComponent(userId)
        : "https://api.flickr.com/services/feeds/photos_public.gne?id=" + encodeURIComponent(userId);

      var script = document.createElement("script");
      script.src = feedUrl + "&format=json&jsoncallback=" + CALLBACK;
      script.async = true;
      script.onerror = function () { /* Fallback: statische Galerie bleibt stehen */ };
      document.body.appendChild(script);

      /* Nach 8s aufgeben – statische Galerie bleibt dann einfach sichtbar */
      window.setTimeout(function () {
        if (!done) script.remove();
      }, 8000);
    }
  }
})();

/* ---------- Galerie-Lightbox ---------- */
(function () {
  "use strict";
  var gallery = document.getElementById("flickr-gallery");
  if (!gallery) return;

  gallery.addEventListener("click", function (e) {
    var img = e.target.closest(".mItem img");
    if (!img) return;
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", img.alt || "Bildansicht");
    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";
    var close = document.createElement("button");
    close.className = "lightbox-close";
    close.setAttribute("aria-label", "Schließen");
    close.innerHTML = "×";
    box.appendChild(big);
    box.appendChild(close);
    document.body.appendChild(box);
    var prevFocus = document.activeElement;
    close.focus();

    function destroy() {
      box.remove();
      document.removeEventListener("keydown", onKey);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }
    function onKey(ev) {
      if (ev.key === "Escape") destroy();
    }
    box.addEventListener("click", function (ev) {
      if (ev.target === box || ev.target === close) destroy();
    });
    document.addEventListener("keydown", onKey);
  });
})();
