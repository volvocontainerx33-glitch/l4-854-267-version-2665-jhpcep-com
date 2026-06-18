(function () {
  var player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var button = player.querySelector('[data-play]');
  if (!video) {
    return;
  }

  var url = video.getAttribute('data-src');
  if (url) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      window.addEventListener('beforeunload', function () {
        hls.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else {
      video.src = url;
    }
  }

  function updateOverlay() {
    if (button) {
      button.classList.toggle('is-hidden', !video.paused);
    }
  }

  function playVideo() {
    var action = video.paused ? video.play() : video.pause();
    if (action && action.catch) {
      action.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', updateOverlay);
  video.addEventListener('pause', updateOverlay);
  video.addEventListener('ended', updateOverlay);
  updateOverlay();
})();
