const API_BASE = "http://localhost:3000/api";
const songsDiv = document.getElementById("songs");
const player = document.getElementById("player");

// Fetch songs from backend
fetch(`${API_BASE}/songs`)
  .then((res) => res.json())
  .then((songs) => {
    songs.forEach((song) => {
      const div = document.createElement("div");
      div.className = "song";

      div.innerHTML = `
        <div>
          <strong>${song.title}</strong><br/>
          <small>${song.artist}</small>
        </div>
        <button>▶ Play</button>
      `;

      div.querySelector("button").onclick = () => {
        player.src = `http://localhost:3000/${song.audio_file}`;
        player.play();
      };

      songsDiv.appendChild(div);
    });
  })
  .catch((err) => {
    console.error("Failed to load songs", err);
  });
