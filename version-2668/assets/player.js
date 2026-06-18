import { H as Hls } from './hls.js';

function initPlayer() {
  const player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  const video = player.querySelector('video');
  const cover = player.querySelector('[data-player-cover]');
  const button = player.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  const src = video.getAttribute('data-src');
  let hls = null;
  let loaded = false;

  function load() {
    if (loaded || !src) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    }
  }

  function play() {
    load();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      play();
    });
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

if (document.readyState !== 'loading') {
  initPlayer();
} else {
  document.addEventListener('DOMContentLoaded', initPlayer);
}
