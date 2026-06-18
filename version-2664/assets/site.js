(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupNavigation() {
    const toggle = $('[data-nav-toggle]');
    const menu = $('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    const hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    let current = 0;
    let timer;
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    };
    const start = () => {
      timer = window.setInterval(() => show(current + 1), 5000);
    };
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stop();
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearchPanels() {
    $$('[data-search-panel]').forEach((panel) => {
      const targetSelector = panel.getAttribute('data-target');
      const target = targetSelector ? $(targetSelector) : null;
      if (!target) {
        return;
      }
      const input = $('[data-search-input]', panel);
      const selects = $$('[data-filter-select]', panel);
      const cards = $$('.movie-card, .movie-row', target);
      const emptyState = panel.nextElementSibling && panel.nextElementSibling.matches('[data-empty-state]') ? panel.nextElementSibling : null;
      const apply = () => {
        const query = normalize(input ? input.value : '');
        const filters = selects.map((select) => ({
          field: select.getAttribute('data-field'),
          value: normalize(select.value)
        })).filter((item) => item.field && item.value);
        let visible = 0;
        cards.forEach((card) => {
          const text = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          const matchesQuery = !query || text.includes(query);
          const matchesFilters = filters.every((item) => normalize(card.dataset[item.field]).includes(item.value));
          const shouldShow = matchesQuery && matchesFilters;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      };
      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach((select) => select.addEventListener('change', apply));
      apply();
    });
  }

  function setupPlayers() {
    $$('[data-video-player]').forEach((player) => {
      const source = player.getAttribute('data-src');
      const video = $('video', player);
      const poster = $('.player-poster', player);
      const button = $('[data-player-play]', player);
      const status = $('[data-player-status]', player);
      let loaded = false;
      let hlsInstance = null;
      if (!source || !video || !button) {
        return;
      }
      const setStatus = (message) => {
        if (status) {
          status.textContent = message || '';
        }
      };
      const playVideo = () => {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(() => setStatus('点击视频控件继续播放'));
        }
      };
      const loadSource = () => {
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        video.controls = true;
        setStatus('正在准备播放');
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
            setStatus('');
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, () => {
            setStatus('播放暂时不可用，请稍后重试');
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', () => {
            setStatus('');
            playVideo();
          }, { once: true });
          video.load();
        } else {
          setStatus('当前浏览器不支持 HLS 播放');
        }
      };
      button.addEventListener('click', () => {
        if (poster) {
          poster.classList.add('is-hidden');
        }
        loadSource();
      });
      video.addEventListener('click', () => {
        if (!loaded) {
          loadSource();
        }
      });
      window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupHero();
    setupSearchPanels();
    setupPlayers();
  });
})();
