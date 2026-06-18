(function() {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function() {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    var searchButton = document.querySelector(".search-toggle");
    var headerSearch = document.querySelector(".header-search");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function() {
        mobileNav.classList.toggle("is-open");
      });
    }

    if (searchButton && headerSearch) {
      searchButton.addEventListener("click", function() {
        headerSearch.classList.toggle("is-open");
        var input = headerSearch.querySelector("input");
        if (input && headerSearch.classList.contains("is-open")) {
          input.focus();
        }
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var previous = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var activeIndex = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function(slide, current) {
        slide.classList.toggle("is-active", current === activeIndex);
      });
      dots.forEach(function(dot, current) {
        dot.classList.toggle("is-active", current === activeIndex);
      });
    }

    if (slides.length) {
      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          setSlide(index);
        });
      });
      if (previous) {
        previous.addEventListener("click", function() {
          setSlide(activeIndex - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function() {
          setSlide(activeIndex + 1);
        });
      }
      window.setInterval(function() {
        setSlide(activeIndex + 1);
      }, 5600);
    }

    var filterPanel = document.querySelector(".filter-panel");
    if (filterPanel) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-target .movie-card"));
      var keyword = document.getElementById("movie-filter-keyword");
      var category = document.getElementById("movie-filter-category");
      var region = document.getElementById("movie-filter-region");
      var type = document.getElementById("movie-filter-type");
      var year = document.getElementById("movie-filter-year");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && keyword) {
        keyword.value = query;
      }

      function cardText(card) {
        return normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.genre,
          card.textContent
        ].join(" "));
      }

      function applyFilters() {
        var q = normalize(keyword && keyword.value);
        var c = normalize(category && category.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);

        cards.forEach(function(card) {
          var text = cardText(card);
          var visible = true;
          if (q && text.indexOf(q) === -1) visible = false;
          if (c && normalize(card.dataset.category) !== c) visible = false;
          if (r && normalize(card.dataset.region) !== r) visible = false;
          if (t && normalize(card.dataset.type) !== t) visible = false;
          if (y && normalize(card.dataset.year) !== y) visible = false;
          card.classList.toggle("is-hidden", !visible);
        });
      }

      [keyword, category, region, type, year].forEach(function(control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
