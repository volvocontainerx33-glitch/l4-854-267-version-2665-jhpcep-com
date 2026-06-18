(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    if (!panels.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    panels.forEach(function (panel) {
      var input = panel.querySelector(".filter-input");
      var selects = Array.prototype.slice.call(panel.querySelectorAll(".filter-select"));
      var empty = panel.querySelector(".empty-state");
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      if (input && query) {
        input.value = query;
      }

      function apply() {
        var text = normalize(input ? input.value : "");
        var activeFilters = {};
        selects.forEach(function (select) {
          var field = select.getAttribute("data-filter-field");
          activeFilters[field] = normalize(select.value);
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.type,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.category,
            card.textContent
          ].join(" "));
          var matched = !text || haystack.indexOf(text) !== -1;
          Object.keys(activeFilters).forEach(function (field) {
            var value = activeFilters[field];
            if (value && normalize(card.dataset[field]) !== value) {
              matched = false;
            }
          });
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function initPlayer() {
    var frame = document.querySelector(".player-frame");
    if (!frame) {
      return;
    }
    var video = frame.querySelector("video");
    var cover = frame.querySelector(".player-cover");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var attached = false;
    var hls = null;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = stream;
      attached = true;
    }

    function start() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
