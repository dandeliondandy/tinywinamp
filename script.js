const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const fileInput = document.getElementById('fileInput');
const playlistEl = document.getElementById('playlist');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');
const fileCountEl = document.getElementById('fileCount');

let playlist = [];
let currentTrackIndex = 0;
let isShuffled = false;

// Function to format time in MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to load a track into the audio player
function loadTrack(track) {
  audioPlayer.src = track.url;
  audioPlayer.load(); // Important for some browsers to re-load the source
  audioPlayer.addEventListener('loadedmetadata', () => {  // Added event listener
    totalDurationEl.textContent = formatTime(audioPlayer.duration);
  });
  updateActiveTrack();
}

// Function to play the current track
function playTrack() {
  audioPlayer.play();
}

// Function to pause the current track
function pauseTrack() {
  audioPlayer.pause();
}

// Function to stop the current track
function stopTrack() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  updateTimeDisplay();
}

// Function to play the next track
function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(playlist[currentTrackIndex]);
  playTrack();
}

// Function to play the previous track
function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(playlist[currentTrackIndex]);
  playTrack();
}

// Function to shuffle the playlist
function shufflePlaylist() {
  if (!isShuffled) {
    // Fisher-Yates shuffle algorithm
    for (let i = playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
    }
    isShuffled = true;
    shuffleBtn.textContent = 'Unshuffle';
    updatePlaylistDisplay();
  } else {
    // Restore original order (this is simplified and won't work perfectly if playlist was changed)
    playlist.sort((a,b) => a.originalIndex - b.originalIndex);
    isShuffled = false;
    shuffleBtn.textContent = 'Shuffle';
    updatePlaylistDisplay();
  }

}

// Function to add tracks to the playlist
function addTracks(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = URL.createObjectURL(file); // Create a URL for the file
    const track = {
      name: file.name,
      url: url,
      originalIndex: playlist.length + i // Store the original index
    };
    playlist.push(track);
  }
  updatePlaylistDisplay();
  fileCountEl.textContent = `${playlist.length} files`; // Update file count display
}

// Function to update the playlist display in the HTML
function updatePlaylistDisplay() {
  playlistEl.querySelector('ul').innerHTML = ''; // Clear the existing list
  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.textContent = track.name;
    li.addEventListener('click', () => {
      currentTrackIndex = index;
      loadTrack(track);
      playTrack();
    });
    playlistEl.querySelector('ul').appendChild(li);
  });
  updateActiveTrack();
}

function updateActiveTrack() {
    const listItems = playlistEl.querySelectorAll('li');
    listItems.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Function to update the time display
function updateTimeDisplay() {
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.style.width = `${progress}%`;
}

// Event listeners for buttons
playBtn.addEventListener('click', playTrack);
pauseBtn.addEventListener('click', pauseTrack);
stopBtn.addEventListener('click', stopTrack);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);
shuffleBtn.addEventListener('click', shufflePlaylist);

// Event listener for file input
fileInput.addEventListener('change', (event) => {
  addTracks(event.target.files);
});

// Event listener for when the current track ends
audioPlayer.addEventListener('ended', () => {
  nextTrack(); // Play the next track automatically
});

// Event listener for time updates
audioPlayer.addEventListener('timeupdate', updateTimeDisplay);

// Drag and Drop Handlers

function dragOverHandler(event) {
  event.preventDefault();  // Necessary to allow dropping
}

function dropHandler(event) {
  event.preventDefault();  // Prevent browser from opening the file
  const files = event.dataTransfer.files;
  addTracks(files);
}

// Progress Bar Seeking
progressBarContainer.addEventListener('click', (event) => {
  const clickPosition = event.offsetX / progressBarContainer.offsetWidth;
  audioPlayer.currentTime = audioPlayer.duration * clickPosition;
  updateTimeDisplay(); // Immediately update the time display
});