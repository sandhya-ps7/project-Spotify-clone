// =====================================================
// MUSIC SUNO - FRONTEND JAVASCRIPT
// =====================================================

// API Configuration
const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('musicSunoToken');
let currentUser = JSON.parse(localStorage.getItem('musicSunoUser'));
let currentSong = null;
let isPlaying = false;
let audioPlayer = new Audio();
let allSongs = [];

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================

function showAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-container">
            <button class="close-modal" onclick="closeAuthModal()">×</button>
            <h2>🎵 Sign In to Music Suno</h2>
            <form id="loginForm">
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Log In</button>
            </form>
            <p>Don't have an account? <a href="#" id="showRegister">Sign up</a></p>
            <div class="demo-info">
                <p><strong>Demo Account:</strong></p>
                <p>Email: john@example.com</p>
                <p>Password: password123</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterModal();
    });
}

function closeAuthModal() {
    const modal = document.querySelector('.auth-modal');
    if (modal) modal.remove();
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('musicSunoToken', token);
            localStorage.setItem('musicSunoUser', JSON.stringify(data.user));
            closeAuthModal();
            updateUIForLoggedInUser();
            loadUserData();
            showNotification('Welcome back, ' + data.user.username + '! 🎵');
        } else {
            alert('Login failed: ' + data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

function showRegisterModal() {
    closeAuthModal();
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-container">
            <button class="close-modal" onclick="closeAuthModal()">×</button>
            <h2>🎵 Sign Up for Music Suno</h2>
            <form id="registerForm">
                <input type="text" id="username" placeholder="Username" required>
                <input type="email" id="regEmail" placeholder="Email" required>
                <input type="password" id="regPassword" placeholder="Password" required>
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <a href="#" id="showLogin">Log in</a></p>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal();
    });
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        if (response.ok) {
            showNotification('Registration successful! Please log in. ✅');
            closeAuthModal();
            showAuthModal();
        } else {
            alert('Registration failed: ' + data.error);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('musicSunoToken');
    localStorage.removeItem('musicSunoUser');
    updateUIForLoggedOutUser();
    showNotification('Logged out successfully! 👋');
}

function updateUIForLoggedInUser() {
    const userIcon = document.querySelector('.fa-user');
    if (userIcon && currentUser) {
        userIcon.parentElement.innerHTML = `
            <div class="user-menu">
                <i class="fa-solid fa-user"></i>
                <span>${currentUser.username}</span>
                <div class="user-dropdown">
                    <a onclick="logout()">Logout</a>
                </div>
            </div>
        `;
    }
}

function updateUIForLoggedOutUser() {
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.innerHTML = '<i class="fa-solid fa-user nav-item"></i>';
    }
}

// =====================================================
// SONG LOADING & DISPLAY
// =====================================================

async function loadSongs() {
    try {
        const response = await fetch(`${API_URL}/songs`);
        allSongs = await response.json();
        displaySongs(allSongs);
    } catch (error) {
        console.error('Failed to load songs:', error);
    }
}

function displaySongs(songs) {
    const containers = document.querySelectorAll('.cards-container');
    
    if (containers[0]) {
        containers[0].innerHTML = songs.slice(0, 5).map(song => createSongCard(song)).join('');
    }
    
    if (containers[1]) {
        containers[1].innerHTML = songs.slice(5, 10).map(song => createSongCard(song)).join('');
    }
    
    if (containers[2]) {
        containers[2].innerHTML = songs.slice(10, 13).map(song => createSongCard(song)).join('');
    }
    
    attachCardListeners();
}

function createSongCard(song) {
    return `
        <div class="card" data-song-id="${song.id}">
            <img class="card-img" src="${song.cover_image || 'assets/card1img.jpeg'}" alt="${song.title}">
            <div class="card-title">${song.title}</div>
            <div class="card-info">${song.artist}</div>
        </div>
    `;
}

function attachCardListeners() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const songId = card.dataset.songId;
            const song = allSongs.find(s => s.id == songId);
            if (song) playSong(song);
        });
    });
}

// =====================================================
// MUSIC PLAYER FUNCTIONS
// =====================================================

async function playSong(song) {
    currentSong = song;
    
    // Update UI
    document.querySelector('.album-img').src = song.cover_image || 'assets/album_picture.jpeg';
    document.querySelector('.album-title').textContent = song.title;
    document.querySelector('.album-artist').textContent = song.artist;
    document.querySelector('.tot-time').textContent = song.duration || '3:33';
    
    // Play audio if file exists
    if (song.audio_file) {
        audioPlayer.src = `http://localhost:3000/uploads/${song.audio_file}`;
        try {
            await audioPlayer.play();
            isPlaying = true;
            updatePlayButton();
        } catch (error) {
            console.error('Audio playback failed:', error);
        }
    }
    
    // Add to recently played if logged in
    if (token) {
        try {
            await fetch(`${API_URL}/recent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ songId: song.id })
            });
        } catch (error) {
            console.error('Failed to update recently played:', error);
        }
    }
    
    showNotification(`Now playing: ${song.title} 🎵`);
}

function updatePlayButton() {
    const playButton = document.querySelector('.player-control-icon:nth-child(3)');
    if (playButton) {
        playButton.style.opacity = isPlaying ? '1' : '0.7';
    }
}

// =====================================================
// AUDIO PLAYER EVENTS
// =====================================================

audioPlayer.addEventListener('timeupdate', () => {
    const progressBar = document.querySelector('.progress-bar');
    const currTime = document.querySelector('.curr-time');
    
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
        
        const minutes = Math.floor(audioPlayer.currentTime / 60);
        const seconds = Math.floor(audioPlayer.currentTime % 60);
        currTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
});

audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayButton();
});

// =====================================================
// PLAYER CONTROLS
// =====================================================

function setupPlayerControls() {
    // Progress bar
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.addEventListener('input', (e) => {
            const time = (e.target.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = time;
        });
    }
    
    // Volume control
    const volumeControl = document.querySelector('.control-sound-range');
    if (volumeControl) {
        volumeControl.addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value / 100;
        });
    }
    
    // Play/Pause button
    const playButton = document.querySelector('.player-control-icon:nth-child(3)');
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (isPlaying) {
                audioPlayer.pause();
                isPlaying = false;
            } else {
                audioPlayer.play();
                isPlaying = true;
            }
            updatePlayButton();
        });
    }
    
    // Previous button
    const prevButton = document.querySelector('.player-control-icon:nth-child(2)');
    if (prevButton) {
        prevButton.addEventListener('click', playPreviousSong);
    }
    
    // Next button
    const nextButton = document.querySelector('.player-control-icon:nth-child(4)');
    if (nextButton) {
        nextButton.addEventListener('click', playNextSong);
    }
}

function playNextSong() {
    if (!currentSong || allSongs.length === 0) return;
    
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % allSongs.length;
    playSong(allSongs[nextIndex]);
}

function playPreviousSong() {
    if (!currentSong || allSongs.length === 0) return;
    
    const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
    playSong(allSongs[prevIndex]);
}

// =====================================================
// LIKE FUNCTIONALITY
// =====================================================

async function toggleLike() {
    if (!token) {
        showAuthModal();
        return;
    }
    
    if (!currentSong) return;
    
    try {
        // Check if already liked
        const checkResponse = await fetch(`${API_URL}/likes/check/${currentSong.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const { liked } = await checkResponse.json();
        
        if (liked) {
            // Unlike
            await fetch(`${API_URL}/likes/${currentSong.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotification('Removed from liked songs 💔');
        } else {
            // Like
            await fetch(`${API_URL}/likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ songId: currentSong.id })
            });
            showNotification('Added to liked songs ❤️');
        }
    } catch (error) {
        console.error('Failed to toggle like:', error);
    }
}

document.querySelector('.liked')?.addEventListener('click', toggleLike);

// =====================================================
// PLAYLIST FUNCTIONS
// =====================================================

async function createPlaylist() {
    if (!token) {
        showAuthModal();
        return;
    }
    
    const name = prompt('Enter playlist name:');
    if (!name) return;
    
    const description = prompt('Enter description (optional):') || '';
    
    try {
        const response = await fetch(`${API_URL}/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });
        
        if (response.ok) {
            showNotification('Playlist created successfully! 📝');
            loadUserPlaylists();
        }
    } catch (error) {
        console.error('Failed to create playlist:', error);
    }
}

async function loadUserPlaylists() {
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/playlists`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const playlists = await response.json();
        displayPlaylists(playlists);
    } catch (error) {
        console.error('Failed to load playlists:', error);
    }
}

function displayPlaylists(playlists) {
    const libraryBox = document.querySelector('.lib-box');
    const existingPlaylists = libraryBox.querySelectorAll('.playlist-item');
    existingPlaylists.forEach(el => el.remove());
    
    playlists.forEach(playlist => {
        const playlistEl = document.createElement('div');
        playlistEl.className = 'box playlist-item';
        playlistEl.innerHTML = `
            <p class="box-p1">${playlist.name}</p>
            <p class="box-p2">${playlist.description || playlist.total_songs + ' songs'}</p>
        `;
        libraryBox.appendChild(playlistEl);
    });
}

// Setup create playlist buttons
document.querySelectorAll('.badge').forEach(button => {
    if (button.textContent.includes('playlist')) {
        button.addEventListener('click', createPlaylist);
    }
});

// =====================================================
// SEARCH FUNCTIONALITY
// =====================================================

let searchTimeout;

function setupSearch() {
    const searchOption = document.querySelector('.fa-magnifying-glass')?.parentElement;
    if (searchOption) {
        searchOption.addEventListener('click', showSearchInput);
    }
}

function showSearchInput() {
    const existingInput = document.querySelector('.search-input');
    if (existingInput) {
        existingInput.focus();
        return;
    }
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search songs, artists, albums...';
    searchInput.className = 'search-input';
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchSongs(e.target.value);
        }, 300);
    });
    
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            if (!searchInput.value) {
                searchInput.remove();
                displaySongs(allSongs);
            }
        }, 200);
    });
    
    document.querySelector('.sticky-nav').appendChild(searchInput);
    searchInput.focus();
}

async function searchSongs(query) {
    if (!query) {
        displaySongs(allSongs);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        const songs = await response.json();
        displaySongs(songs);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// =====================================================
// USER DATA LOADING
// =====================================================

async function loadUserData() {
    if (!token) return;
    
    try {
        // Load recently played
        const recentResponse = await fetch(`${API_URL}/recent`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const recentSongs = await recentResponse.json();
        
        if (recentSongs.length > 0) {
            const container = document.querySelectorAll('.cards-container')[0];
            if (container) {
                container.innerHTML = recentSongs.slice(0, 5).map(song => createSongCard(song)).join('');
                attachCardListeners();
            }
        }
        
        // Load playlists
        await loadUserPlaylists();
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// =====================================================
// NOTIFICATION SYSTEM
// =====================================================

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =====================================================
// USER ICON CLICK HANDLER
// =====================================================

document.querySelector('.fa-user')?.parentElement.addEventListener('click', () => {
    if (!token) {
        showAuthModal();
    }
});

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Music Suno initialized');
    
    // Load songs
    loadSongs();
    
    // Setup player controls
    setupPlayerControls();
    
    // Setup search
    setupSearch();
    
    // If user is logged in, update UI and load data
    if (token && currentUser) {
        updateUIForLoggedInUser();
        loadUserData();
    }
    
    // Add styles for notifications
    if (!document.getElementById('music-suno-styles')) {
        const styles = document.createElement('style');
        styles.id = 'music-suno-styles';
        styles.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .auth-container {
                background: #282828;
                padding: 40px;
                border-radius: 8px;
                width: 90%;
                max-width: 400px;
                position: relative;
            }
            .close-modal {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: #fff;
                font-size: 30px;
                cursor: pointer;
            }
            .auth-container h2 {
                color: #1DB954;
                margin-bottom: 20px;
            }
            .auth-container input {
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                background: #3E3E3E;
                border: none;
                border-radius: 4px;
                color: #fff;
            }
            .auth-container button {
                width: 100%;
                padding: 12px;
                background: #1DB954;
                border: none;
                border-radius: 20px;
                color: #fff;
                font-weight: bold;
                cursor: pointer;
                margin-top: 10px;
            }
            .auth-container button:hover {
                background: #1ed760;
            }
            .auth-container p {
                color: #b3b3b3;
                margin-top: 20px;
                text-align: center;
            }
            .auth-container a {
                color: #1DB954;
                text-decoration: none;
            }
            .demo-info {
                background: #181818;
                padding: 15px;
                border-radius: 4px;
                margin-top: 20px;
            }
            .demo-info p {
                margin: 5px 0;
                font-size: 12px;
            }
            .search-input {
                padding: 8px 15px;
                background: #3E3E3E;
                border: none;
                border-radius: 20px;
                color: #fff;
                margin-left: 10px;
                width: 300px;
            }
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #1DB954;
                color: #fff;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 9999;
            }
            .notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            .user-menu {
                position: relative;
                cursor: pointer;
            }
            .user-menu span {
                margin-left: 5px;
            }
            .user-dropdown {
                display: none;
                position: absolute;
                top: 100%;
                right: 0;
                background: #282828;
                border-radius: 4px;
                padding: 10px;
                margin-top: 5px;
            }
            .user-menu:hover .user-dropdown {
                display: block;
            }
            .user-dropdown a {
                color: #fff;
                text-decoration: none;
                display: block;
                padding: 5px 10px;
                cursor: pointer;
            }
            .user-dropdown a:hover {
                background: #3E3E3E;
            }
        `;
        document.head.appendChild(styles);
    }
    
    showNotification('Welcome to Music Suno! 🎵');
});