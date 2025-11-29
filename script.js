/* Edit this file */

// Grab elements
const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]');
const ranges = player.querySelectorAll('.player__slider');

// ---- Core Functions ----

// Play / Pause the video
function togglePlay() {
  // If paused, play; else pause
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

// Update the play/pause button icon
function updateButton() {
  const icon = video.paused ? '►' : '❚ ❚';
  toggle.textContent = icon;
}

// Handle volume & playbackRate range inputs
function handleRangeUpdate() {
  // name is "volume" or "playbackRate"
  video[this.name] = this.value;
}

// Skip forward / backward
function skip() {
  const skipValue = parseFloat(this.dataset.skip || 0);

  // New time after skipping
  let newTime = video.currentTime + skipValue;

  // Clamp between 0 and duration (if duration known)
  if (!isNaN(video.duration)) {
    if (newTime < 0) newTime = 0;
    if (newTime > video.duration) newTime = video.duration;
  } else if (newTime < 0) {
    newTime = 0;
  }

  video.currentTime = newTime;
}

// Update progress bar as video plays
function handleProgress() {
  if (!video.duration || isNaN(video.duration)) return;

  const percent = (video.currentTime / video.duration) * 100;
  // Using flex-basis because typical CSS for this uses flex
  progressBar.style.flexBasis = `${percent}%`;
}

// Scrub (seek) when clicking / dragging on progress bar
function scrub(e) {
  if (!video.duration || isNaN(video.duration)) return;

  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
}

// Gracefully handle video load error
function handleVideoError() {
  // Avoid duplicating error messages
  if (player.querySelector('.video-error')) return;

  const errorMessage = document.createElement('div');
  errorMessage.className = 'video-error';
  errorMessage.textContent = 'Error: Unable to load video (download.mp4). Please check the file path.';
  errorMessage.style.marginTop = '10px';
  errorMessage.style.color = 'red';
  errorMessage.style.fontSize = '14px';

  player.appendChild(errorMessage);

  // Optionally pause and disable controls if video fails
  video.pause();
  toggle.disabled = true;
  skipButtons.forEach(btn => (btn.disabled = true));
  ranges.forEach(input => (input.disabled = true));
}

// ---- Event Listeners ----

// Toggle play/pause when video or button is clicked
video.addEventListener('click', togglePlay);
toggle.addEventListener('click', togglePlay);

// Update button when video state changes
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);

// Update progress bar as the video plays
video.addEventListener('timeupdate', handleProgress);

// Volume & playbackRate sliders
ranges.forEach(range => {
  range.addEventListener('change', handleRangeUpdate);
  range.addEventListener('input', handleRangeUpdate);
});

// Skip buttons (« 10s, 25s »)
skipButtons.forEach(button => button.addEventListener('click', skip));

// Scrubbing behavior on progress bar
let mousedown = false;
progress.addEventListener('click', scrub);
progress.addEventListener('mousedown', () => (mousedown = true));
progress.addEventListener('mouseup', () => (mousedown = false));
progress.addEventListener('mouseleave', () => (mousedown = false));
progress.addEventListener('mousemove', e => {
  if (mousedown) scrub(e);
});

// Handle video load errors
video.addEventListener('error', handleVideoError);

// Optional: ensure initial volume and rate match the sliders
video.addEventListener('loadedmetadata', () => {
  ranges.forEach(range => {
    if (range.name === 'volume') {
      video.volume = parseFloat(range.value);
    } else if (range.name === 'playbackRate') {
      video.playbackRate = parseFloat(range.value);
    }
  });
});
