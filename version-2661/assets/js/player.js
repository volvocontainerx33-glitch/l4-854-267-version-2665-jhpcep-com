(function() {
  function start(container) {
    var video = container.querySelector(".stream-video");
    var stream = container.getAttribute("data-stream");
    if (!video || !stream) {
      return;
    }

    container.classList.add("is-playing");

    if (!video.dataset.ready) {
      video.dataset.ready = "true";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
        container.hlsPlayer = hls;
      } else {
        video.src = stream;
      }
    }

    video.play().catch(function() {});
  }

  function bind(container) {
    var cover = container.querySelector(".stream-cover");
    var video = container.querySelector(".stream-video");

    if (cover) {
      cover.addEventListener("click", function(event) {
        event.preventDefault();
        start(container);
      });
    }

    if (video) {
      video.addEventListener("click", function() {
        if (video.paused) {
          start(container);
        }
      });
      video.addEventListener("play", function() {
        container.classList.add("is-playing");
      });
    }
  }

  if (document.readyState !== "loading") {
    Array.prototype.forEach.call(document.querySelectorAll(".stream-player"), bind);
  } else {
    document.addEventListener("DOMContentLoaded", function() {
      Array.prototype.forEach.call(document.querySelectorAll(".stream-player"), bind);
    });
  }
})();
