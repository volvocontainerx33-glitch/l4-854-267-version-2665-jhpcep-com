(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll('.site-search-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = form.getAttribute('action') || 'search.html';
        }
      });
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    var carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
    }
    start();
  }

  function initMoviePlayer() {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    var message = document.getElementById('playerMessage');
    if (!video || !overlay) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function playVideo() {
      var src = video.getAttribute('data-src');
      if (!src) {
        setMessage('播放源暂不可用');
        return;
      }

      overlay.classList.add('is-hidden');
      setMessage('正在载入播放源...');

      if (video.getAttribute('data-loaded') === '1') {
        video.play().catch(function () {
          setMessage('请点击播放器继续播放');
        });
        return;
      }

      video.setAttribute('data-loaded', '1');

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
          video.play().catch(function () {
            setMessage('请点击播放器继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请刷新后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', function () {
          setMessage('');
          video.play().catch(function () {
            setMessage('请点击播放器继续播放');
          });
        }, { once: true });
      } else {
        video.src = src;
        video.play().then(function () {
          setMessage('');
        }).catch(function () {
          setMessage('当前浏览器需要启用 HLS 支持后播放');
        });
      }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
      setMessage('');
    });
  }

  function initSearchPage() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    var typeFilter = document.getElementById('typeFilter');
    var yearFilter = document.getElementById('yearFilter');
    var reset = document.getElementById('resetFilters');
    var summary = document.getElementById('searchSummary');
    if (!results || !input || !window.MOVIE_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    var years = Array.from(new Set(window.MOVIE_DATA.map(function (movie) {
      return movie.year;
    }).filter(Boolean))).sort(function (a, b) {
      return b - a;
    });

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year) + '年';
      yearFilter.appendChild(option);
    });

    function movieMatches(movie, keyword, typeValue, yearValue) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genreRaw,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      var typeOk = !typeValue || movie.type === typeValue;
      var yearOk = !yearValue || String(movie.year) === yearValue;
      return keywordOk && typeOk && yearOk;
    }

    function renderCard(movie) {
      return '<a class="movie-card movie-card-small" href="movies/' + movie.id + '.html" title="' + escapeHtml(movie.title) + '">' +
        '<div class="movie-poster-wrap">' +
        '<img class="movie-poster" src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="movie-type">' + escapeHtml(movie.type) + '</span>' +
        '<div class="movie-hover"><span class="play-circle" aria-hidden="true">▶</span><p>' + escapeHtml(movie.oneLine) + '</p></div>' +
        '</div>' +
        '<div class="movie-card-body">' +
        '<h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p>' + escapeHtml(movie.genreRaw) + '</p>' +
        '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '年</span></div>' +
        '</div>' +
        '</a>';
    }

    function update() {
      var keyword = input.value.trim().toLowerCase();
      var typeValue = typeFilter ? typeFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';
      var matched = window.MOVIE_DATA.filter(function (movie) {
        return movieMatches(movie, keyword, typeValue, yearValue);
      });
      results.innerHTML = matched.map(renderCard).join('');
      if (summary) {
        summary.textContent = matched.length ? '找到 ' + matched.length + ' 部相关内容' : '没有找到匹配内容';
      }
    }

    [input, typeFilter, yearFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', update);
        element.addEventListener('change', update);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        input.value = '';
        if (typeFilter) {
          typeFilter.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        update();
      });
    }

    update();
  }

  ready(function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initMoviePlayer();
    initSearchPage();
  });
}());
