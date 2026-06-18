(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (button && nav) {
      button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }

    Array.prototype.slice.call(document.querySelectorAll(".local-filter-input")).forEach(function (input) {
      var root = input.closest("main") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll(".local-card-list .movie-card, .movie-grid .movie-card"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
        });
      });
    });

    var globalInput = document.getElementById("globalSearchInput");
    var globalButton = document.getElementById("globalSearchButton");
    var results = document.getElementById("globalSearchResults");

    function renderGlobalSearch() {
      if (!globalInput || !results || typeof SEARCH_MOVIES === "undefined") {
        return;
      }
      var query = globalInput.value.trim().toLowerCase();
      var items = SEARCH_MOVIES.filter(function (item) {
        return !query || item.search.indexOf(query) !== -1;
      }).slice(0, 72);
      results.innerHTML = items.map(function (item) {
        return [
          "<article class=\"movie-card\" data-search=\"" + escapeHtml(item.search) + "\">",
          "  <a href=\"" + item.href + "\" class=\"card-link\">",
          "    <div class=\"poster-wrap\">",
          "      <img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
          "      <div class=\"poster-shade\"></div>",
          "      <span class=\"year-badge\">" + escapeHtml(item.year) + "</span>",
          "      <span class=\"play-badge\">▶</span>",
          "    </div>",
          "    <div class=\"card-body\">",
          "      <h3>" + escapeHtml(item.title) + "</h3>",
          "      <p>" + escapeHtml(item.oneLine) + "</p>",
          "      <div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.genre) + "</span></div>",
          "    </div>",
          "  </a>",
          "</article>"
        ].join("\n");
      }).join("\n");
    }

    if (globalInput && results) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        globalInput.value = q;
        renderGlobalSearch();
      }
      globalInput.addEventListener("input", renderGlobalSearch);
      if (globalButton) {
        globalButton.addEventListener("click", renderGlobalSearch);
      }
    }
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[match];
    });
  }

  window.initializePlayer = function (source) {
    var video = document.getElementById("player");
    var overlay = document.querySelector("[data-play-overlay]");
    var hls = null;
    var ready = false;

    function load() {
      if (!video || ready) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
      ready = true;
    }

    function play() {
      load();
      if (!video) {
        return;
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function toggle() {
      if (!video) {
        return;
      }
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", toggle);
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
