(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearchAndFilter() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var input = document.querySelector("[data-search-input]");
    var result = document.querySelector("[data-result-count]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

    function getQueryFromUrl() {
      try {
        return new URLSearchParams(window.location.search).get("q") || "";
      } catch (err) {
        return "";
      }
    }

    if (document.querySelector("[data-search-page]") && input) {
      input.value = getQueryFromUrl();
    }

    function activeFilter() {
      var active = document.querySelector("[data-filter].is-active");
      return active ? active.getAttribute("data-filter") : "all";
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var q = input ? input.value.trim().toLowerCase() : "";
      var filter = activeFilter().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var okText = !q || text.indexOf(q) !== -1;
        var okTag = filter === "all" || tags.indexOf(filter) !== -1;
        var visible = okText && okTag;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (result) {
        result.textContent = shown ? "匹配 " + shown + " 部" : "暂无匹配内容";
      }
    }

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var mode = form.getAttribute("data-search-mode");
        var field = form.querySelector("[data-search-input]");
        var query = field ? field.value.trim() : "";
        if (mode === "redirect") {
          var target = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
          window.location.href = target;
        } else {
          applyFilter();
        }
      });
    });

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        applyFilter();
      });
    });

    applyFilter();
  }

  window.SitePlayer = {
    mount: function (videoId, overlayId, buttonId, sourceUrl) {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      var button = document.getElementById(buttonId);
      if (!video || !overlay || !button || !sourceUrl) {
        return;
      }
      var shell = video.closest(".player-shell");
      var attached = false;
      var hls = null;

      function markPlaying(isPlaying) {
        if (shell) {
          shell.classList.toggle("is-playing", isPlaying);
        }
      }

      function loadAndPlay() {
        if (!attached) {
          attached = true;
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            video.play().catch(function () {});
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal || !hls) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            });
          } else {
            video.src = sourceUrl;
            video.addEventListener("loadedmetadata", function () {
              video.play().catch(function () {});
            }, { once: true });
            video.load();
          }
        } else {
          video.play().catch(function () {});
        }
      }

      function start(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        loadAndPlay();
      }

      overlay.addEventListener("click", start);
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          loadAndPlay();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        markPlaying(true);
      });
      video.addEventListener("pause", function () {
        markPlaying(false);
      });
      video.addEventListener("ended", function () {
        markPlaying(false);
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };

  ready(function () {
    initMenu();
    initHero();
    initSearchAndFilter();
  });
})();
