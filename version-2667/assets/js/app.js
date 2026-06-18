(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var search = root.querySelector('[data-filter-search]');
    var year = root.querySelector('[data-filter-year]');
    var type = root.querySelector('[data-filter-type]');
    var count = root.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(search && search.value);
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !selectedYear || card.dataset.year === selectedYear;
        var matchesType = !selectedType || card.dataset.type === selectedType;
        var isVisible = matchesQuery && matchesYear && matchesType;
        card.classList.toggle('hidden-by-filter', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部作品';
      }
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });

  var hlsPromise;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function playVideo(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var source = shell.getAttribute('data-m3u8');
    if (!video || !source) {
      return;
    }

    function markPlaying() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.play().catch(function () {});
    }

    if (video.dataset.ready === 'true') {
      markPlaying();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
      markPlaying();
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.ready = 'true';
        hls.on(Hls.Events.MANIFEST_PARSED, markPlaying);
      } else {
        video.src = source;
        video.dataset.ready = 'true';
        markPlaying();
      }
    }).catch(function () {
      video.src = source;
      video.dataset.ready = 'true';
      markPlaying();
    });
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo(shell);
      });
    }
    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && !video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo(shell);
        } else {
          video.pause();
        }
      });
    }
  });
})();
