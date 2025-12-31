// Music Player State
let currentSong = null;
let isPlaying = false;

// Play Song Function
function playSong(songId, title, artist, coverImage) {
    const musicPlayer = document.getElementById('musicPlayer');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playerImage = document.getElementById('playerImage');
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    // Show player
    musicPlayer.style.display = 'block';
    
    // Update player info
    playerTitle.textContent = title;
    playerArtist.textContent = artist;
    if (coverImage) {
        playerImage.src = coverImage;
    }
    
    // Update play button
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;
    currentSong = songId;
    
    // Simulate progress
    simulateProgress();
    
    // Send play event to server (if logged in)
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        fetch('/api/recent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ songId })
        }).catch(err => console.log('Not logged in'));
    }
}

// Toggle Play/Pause
document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playPauseBtn.innerHTML = isPlaying ? 
                '<i class="fas fa-pause"></i>' : 
                '<i class="fas fa-play"></i>';
        });
    }
    
    // Like button functionality
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            const icon = likeBtn.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = 'var(--primary)';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
            }
        });
    }
    
    // Volume slider
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            console.log('Volume:', e.target.value);
        });
    }
});

// Simulate Progress Bar
function simulateProgress() {
    const progress = document.getElementById('progress');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    
    let current = 0;
    const total = 200; // 200 seconds (3:20)
    
    duration.textContent = formatTime(total);
    
    const interval = setInterval(() => {
        if (!isPlaying) return;
        
        current += 1;
        const percentage = (current / total) * 100;
        progress.style.width = percentage + '%';
        currentTime.textContent = formatTime(current);
        
        if (current >= total) {
            clearInterval(interval);
            current = 0;
            progress.style.width = '0%';
        }
    }, 1000);
}

// Format Time (seconds to mm:ss)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Search Form Enhancement
const searchForm = document.querySelector('.nav-search form');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        const searchInput = searchForm.querySelector('input');
        if (!searchInput.value.trim()) {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// Add hover effects to song cards
document.querySelectorAll('.song-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.song-card, .feature-card, .playlist-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Toast Notification System
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add to Playlist Function
async function addToPlaylist(songId, playlistId) {
    try {
        const response = await fetch(`/api/playlists/${playlistId}/songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ songId })
        });
        
        if (response.ok) {
            showToast('Song added to playlist!', 'success');
        } else {
            showToast('Failed to add song', 'error');
        }
    } catch (error) {
        showToast('An error occurred', 'error');
    }
}

// Like/Unlike Song Function
async function toggleLike(songId) {
    const likeBtn = event.target.closest('button');
    const icon = likeBtn.querySelector('i');
    const isLiked = icon.classList.contains('fas');
    
    try {
        if (isLiked) {
            await fetch(`/api/likes/${songId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            icon.classList.remove('fas');
            icon.classList.add('far');
            showToast('Removed from liked songs', 'success');
        } else {
            await fetch('/api/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ songId })
            });
            icon.classList.add('fas');
            icon.classList.remove('far');
            showToast('Added to liked songs', 'success');
        }
    } catch (error) {
        showToast('Please login to like songs', 'error');
    }
}

// Loading Spinner
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.remove();
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Space: Play/Pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) playBtn.click();
    }
    
    // Left Arrow: Previous Song
    if (e.code === 'ArrowLeft' && e.target.tagName !== 'INPUT') {
        console.log('Previous song');
    }
    
    // Right Arrow: Next Song
    if (e.code === 'ArrowRight' && e.target.tagName !== 'INPUT') {
        console.log('Next song');
    }
});

console.log('🎵 Music Suno - Client Side Loaded!');