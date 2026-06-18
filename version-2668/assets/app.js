(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      var active = 0;

      function showSlide(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === active);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(active + 1);
        }, 5600);
      }
    }

    var urlParams = new URLSearchParams(window.location.search);
    var query = (urlParams.get('q') || '').trim().toLowerCase();
    var searchInput = document.querySelector('[data-page-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var empty = document.querySelector('[data-empty-result]');
    var resultLabel = document.querySelector('[data-result-label]');

    if (searchInput && query) {
      searchInput.value = query;
    }

    function updateEmpty() {
      if (!empty) {
        return;
      }
      var visible = cards.filter(function (card) {
        return !card.classList.contains('is-hidden');
      }).length;
      empty.classList.toggle('is-visible', visible === 0);
      if (resultLabel) {
        resultLabel.textContent = visible ? '已匹配到相关内容' : '暂无匹配内容';
      }
    }

    function filterCards(text) {
      var term = (text || '').trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', term.length > 0 && haystack.indexOf(term) === -1);
      });
      updateEmpty();
    }

    if (searchInput) {
      filterCards(query);
      searchInput.addEventListener('input', function () {
        filterCards(searchInput.value);
      });
    }

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

    if (filterButtons.length) {
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-filter');
          filterButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          cards.forEach(function (card) {
            var match = value === 'all' || card.getAttribute('data-type') === value || card.getAttribute('data-year') === value || card.getAttribute('data-category') === value;
            card.classList.toggle('is-hidden', !match);
          });
          updateEmpty();
        });
      });
    }
  });
})();
