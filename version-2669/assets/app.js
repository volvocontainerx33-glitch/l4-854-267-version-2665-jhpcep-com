(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5600);
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var activeValue = '';

    function valueOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' ');
    }

    function applyFilter() {
      if (!list) {
        return;
      }
      var query = input ? input.value.trim() : '';
      Array.prototype.slice.call(list.querySelectorAll('[data-card]')).forEach(function (card) {
        var haystack = valueOf(card);
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okButton = !activeValue || haystack.indexOf(activeValue) !== -1;
        card.classList.toggle('hidden-by-filter', !(okQuery && okButton));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeValue = button.getAttribute('data-filter-value') || '';
        applyFilter();
      });
    });
  });

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var regionSelect = document.querySelector('[data-region-select]');
  var typeSelect = document.querySelector('[data-type-select]');
  var yearSelect = document.querySelector('[data-year-select]');
  var resultBox = document.querySelector('[data-search-results]');
  var catalog = window.CATALOG_ITEMS || [];

  function uniqueValues(key) {
    return catalog.map(function (item) {
      return item[key] || '';
    }).filter(Boolean).filter(function (value, index, array) {
      return array.indexOf(value) === index;
    }).sort();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  fillSelect(regionSelect, uniqueValues('region'));
  fillSelect(typeSelect, uniqueValues('type'));
  fillSelect(yearSelect, uniqueValues('year').reverse());

  function resultCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card compact-card" href="' + escapeHtml(item.url) + '">',
      '<span class="poster-wrap"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="poster-year">' + escapeHtml(item.year) + '</span></span>',
      '<span class="card-body"><strong>' + escapeHtml(item.title) + '</strong><span class="card-line">' + escapeHtml(item.line) + '</span><span class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span>' + tags + '</span></span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function currentQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function runSearch() {
    if (!resultBox) {
      return;
    }
    var query = searchInput ? searchInput.value.trim() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var results = catalog.filter(function (item) {
      var text = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.line].join(' ');
      return (!query || text.indexOf(query) !== -1) &&
        (!region || item.region === region) &&
        (!type || item.type === type) &&
        (!year || item.year === year);
    }).slice(0, 96);

    if (!results.length) {
      resultBox.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
      return;
    }
    resultBox.innerHTML = results.map(resultCard).join('');
  }

  if (searchInput && resultBox) {
    searchInput.value = currentQuery();
    runSearch();
    searchInput.addEventListener('input', runSearch);
    [regionSelect, typeSelect, yearSelect].forEach(function (select) {
      if (select) {
        select.addEventListener('change', runSearch);
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });
  }
})();
