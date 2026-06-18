(function () {
    function initVideoPlayer(videoId, overlayId, errorId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var errorBox = document.getElementById(errorId);
        var hls = null;
        var loaded = false;

        if (!video || !overlay || !source) {
            return;
        }

        function showError() {
            if (errorBox) {
                errorBox.textContent = "视频加载失败，请稍后再试。";
                errorBox.hidden = false;
            }
        }

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function play() {
            loadSource();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("error", showError);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initVideoPlayer = initVideoPlayer;
})();
