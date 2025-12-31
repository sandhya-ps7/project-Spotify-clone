const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'music-suno-secret-key-change-this-in-production';

// Middleware
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// MySQL Connection Pool for better performance
const db = mysql.createPool({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'mscracked',  // ← CHANGE THIS TO YOUR MYSQL PASSWORD
    database: 'music_suno',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Music Suno Database connection failed:');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('\n🔧 Please check:');
        console.error('   1. MySQL is running');
        console.error('   2. Password in server.js is correct (line 23)');
        console.error('   3. Database "music_suno" exists');
        console.error('\nRun in MySQL: SHOW DATABASES;\n');
        process.exit(1);
    }
    console.log('✅ Connected to Music Suno Database');
    connection.release();
});

// File upload configuration
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '-'));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|m4a/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Invalid file type!');
        }
    }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied - No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// =====================================================
// USER ROUTES
// =====================================================
app.get("/api/register", (req, res) => {
    res.render("register.ejs");
});
// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, bio } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email and password are required' });
        }
        
        // Check if user already exists
        db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            if (results.length > 0) {
                return res.status(409).json({ error: 'User with this email or username already exists' });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert user
            const query = 'INSERT INTO users (username, email, password, bio) VALUES (?, ?, ?, ?)';
            db.query(query, [username, email, hashedPassword, bio || null], (err, result) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({ error: 'Failed to register user', details: err.message });
                }
                
                res.status(201).json({ 
                    message: 'User registered successfully', 
                    userId: result.insertId 
                });
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Login
app.post('/api/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            
            const user = results[0];
            
            try {
                const validPassword = await bcrypt.compare(password, user.password);
                
                if (!validPassword) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
                
                const token = jwt.sign(
                    { id: user.id, email: user.email, username: user.username }, 
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
                
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email,
                        profile_image: user.profile_image,
                        bio: user.bio,
                        premium_status: user.premium_status
                    } 
                });
            } catch (error) {
                console.error('Password comparison error:', error);
                res.status(500).json({ error: 'Authentication error' });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user profile
app.get('/api/user/:id', authenticateToken, (req, res) => {
    const query = 'SELECT id, username, email, profile_image, bio, premium_status, created_at FROM users WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

// Update user profile
app.put('/api/user/:id', authenticateToken, (req, res) => {
    if (req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { username, bio } = req.body;
    const query = 'UPDATE users SET username = ?, bio = ? WHERE id = ?';
    
    db.query(query, [username, bio, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update profile', details: err.message });
        }
        res.json({ message: 'Profile updated successfully' });
    });
});

// =====================================================
// SONG ROUTES
// =====================================================

// Get all songs
app.get('/api/songs', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    
    const query = 'SELECT * FROM songs ORDER BY play_count DESC, created_at DESC LIMIT ? OFFSET ?';
    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch songs', details: err.message });
        }
        res.json(results);
    });
});

// Get song by ID
app.get('/api/songs/:id', (req, res) => {
    const query = 'SELECT * FROM songs WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json(results[0]);
    });
});

// Get trending songs
app.get('/api/songs/trending/now', (req, res) => {
    const query = `
        SELECT s.*, COUNT(lh.id) as recent_plays 
        FROM songs s
        LEFT JOIN listening_history lh ON s.id = lh.song_id 
            AND lh.listened_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY s.id
        ORDER BY recent_plays DESC, s.play_count DESC, s.likes_count DESC
        LIMIT 10
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch trending songs', details: err.message });
        }
        res.json(results);
    });
});

// Add new song (protected)
app.post('/api/songs', authenticateToken, upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), (req, res) => {
    const { title, artist, album, duration, release_year } = req.body;
    const cover = req.files.cover ? 'uploads/' + req.files.cover[0].filename : null;
    const audio = req.files.audio ? 'uploads/' + req.files.audio[0].filename : null;
    
    if (!title || !artist) {
        return res.status(400).json({ error: 'Title and artist are required' });
    }
    
    const query = 'INSERT INTO songs (title, artist, album, duration, cover_image, audio_file, release_year) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [title, artist, album || null, duration || '0:00', cover, audio, release_year || null], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to add song', details: err.message });
        }
        res.status(201).json({ 
            message: 'Song added successfully', 
            id: result.insertId 
        });
    });
});

// Update song
app.put('/api/songs/:id', authenticateToken, (req, res) => {
    const { title, artist, album, duration, release_year } = req.body;
    const query = 'UPDATE songs SET title = ?, artist = ?, album = ?, duration = ?, release_year = ? WHERE id = ?';
    
    db.query(query, [title, artist, album, duration, release_year, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update song', details: err.message });
        }
        res.json({ message: 'Song updated successfully' });
    });
});

// Delete song
app.delete('/api/songs/:id', authenticateToken, (req, res) => {
    const query = 'DELETE FROM songs WHERE id = ?';
    db.query(query, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete song', details: err.message });
        }
        res.json({ message: 'Song deleted successfully' });
    });
});

// =====================================================
// PLAYLIST ROUTES
// =====================================================

// Get user playlists
app.get('/api/playlists', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC';
    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch playlists', details: err.message });
        }
        res.json(results);
    });
});

// Get playlist by ID
app.get('/api/playlists/:id', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM playlists WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        
        const playlist = results[0];
        
        // Check if user has access (owner or public playlist)
        if (playlist.user_id !== req.user.id && !playlist.is_public) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json(playlist);
    });
});

// Create playlist
app.post('/api/playlists', authenticateToken, (req, res) => {
    const { name, description, is_public } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Playlist name is required' });
    }
    
    const query = 'INSERT INTO playlists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)';
    db.query(query, [req.user.id, name, description || '', is_public !== false], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to create playlist', details: err.message });
        }
        res.status(201).json({ 
            message: 'Playlist created successfully', 
            id: result.insertId 
        });
    });
});

// Update playlist
app.put('/api/playlists/:id', authenticateToken, (req, res) => {
    const { name, description, is_public } = req.body;
    
    const query = 'UPDATE playlists SET name = ?, description = ?, is_public = ? WHERE id = ? AND user_id = ?';
    db.query(query, [name, description, is_public, req.params.id, req.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update playlist', details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Playlist not found or access denied' });
        }
        res.json({ message: 'Playlist updated successfully' });
    });
});

// Delete playlist
app.delete('/api/playlists/:id', authenticateToken, (req, res) => {
    const query = 'DELETE FROM playlists WHERE id = ? AND user_id = ?';
    db.query(query, [req.params.id, req.user.id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete playlist', details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Playlist not found or access denied' });
        }
        res.json({ message: 'Playlist deleted successfully' });
    });
});

// Get playlist songs
app.get('/api/playlists/:playlistId/songs', authenticateToken, (req, res) => {
    const query = `
        SELECT s.*, ps.position, ps.added_at 
        FROM songs s
        INNER JOIN playlist_songs ps ON s.id = ps.song_id
        WHERE ps.playlist_id = ?
        ORDER BY ps.position ASC
    `;
    
    db.query(query, [req.params.playlistId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch playlist songs', details: err.message });
        }
        res.json(results);
    });
});

// Add song to playlist
app.post('/api/playlists/:playlistId/songs', authenticateToken, (req, res) => {
    const { songId } = req.body;
    
    if (!songId) {
        console.log("song no found");
        return res.status(400).json({ error: 'Song ID is required' });
    }
    
    // Verify playlist ownership
    db.query('SELECT * FROM playlists WHERE id = ? AND user_id = ?', 
        [req.params.playlistId, req.user.id], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Playlist not found or access denied' });
            }
            
            // Use stored procedure if available, otherwise manual insert
            const query = 'CALL add_song_to_playlist(?, ?)';
            db.query(query, [req.params.playlistId, songId], (err) => {
                if (err) {
                    // Fallback to manual insert if procedure fails
                    const fallbackQuery = `
                        INSERT INTO playlist_songs (playlist_id, song_id, position) 
                        SELECT ?, ?, COALESCE(MAX(position), 0) + 1 
                        FROM playlist_songs 
                        WHERE playlist_id = ?
                        ON DUPLICATE KEY UPDATE position = position
                    `;
                    db.query(fallbackQuery, [req.params.playlistId, songId, req.params.playlistId], (err2) => {
                        if (err2) {
                            return res.status(500).json({ error: 'Failed to add song to playlist', details: err2.message });
                        }
                        res.json({ message: 'Song added to playlist successfully' });
                    });
                } else {
                    res.json({ message: 'Song added to playlist successfully' });
                }
            });
        }
    );
});

// Remove song from playlist
app.delete('/api/playlists/:playlistId/songs/:songId', authenticateToken, (req, res) => {
    // Verify playlist ownership
    db.query('SELECT * FROM playlists WHERE id = ? AND user_id = ?', 
        [req.params.playlistId, req.user.id], 
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Playlist not found or access denied' });
            }
            
            const query = 'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?';
            db.query(query, [req.params.playlistId, req.params.songId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to remove song', details: err.message });
                }
                res.json({ message: 'Song removed from playlist successfully' });
            });
        }
    );
});

// =====================================================
// LIKED SONGS ROUTES
// =====================================================

// Like a song
app.post('/api/likes', authenticateToken, (req, res) => {
    const { songId } = req.body;
    
    if (!songId) {
        return res.status(400).json({ error: 'Song ID is required' });
    }
    
    const query = 'INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE liked_at = CURRENT_TIMESTAMP';
    db.query(query, [req.user.id, songId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to like song', details: err.message });
        }
        res.json({ message: 'Song liked successfully' });
    });
});

// Unlike a song
app.delete('/api/likes/:songId', authenticateToken, (req, res) => {
    const query = 'DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?';
    db.query(query, [req.user.id, req.params.songId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to unlike song', details: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Like not found' });
        }
        res.json({ message: 'Song unliked successfully' });
    });
});

// Get liked songs
app.get('/api/likes', authenticateToken, (req, res) => {
    const query = `
        SELECT s.*, ls.liked_at 
        FROM songs s
        INNER JOIN liked_songs ls ON s.id = ls.song_id
        WHERE ls.user_id = ?
        ORDER BY ls.liked_at DESC
    `;
    
    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch liked songs', details: err.message });
        }
        res.json(results);
    });
});

// Check if song is liked
app.get('/api/likes/check/:songId', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM liked_songs WHERE user_id = ? AND song_id = ?';
    db.query(query, [req.user.id, req.params.songId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to check like status', details: err.message });
        }
        res.json({ liked: results.length > 0 });
    });
});

// =====================================================
// RECENTLY PLAYED ROUTES
// =====================================================

// Add to recently played
app.post('/api/recent', authenticateToken, (req, res) => {
    const { songId } = req.body;
    
    if (!songId) {
        return res.status(400).json({ error: 'Song ID is required' });
    }
    
    const query = 'INSERT INTO recently_played (user_id, song_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE played_at = CURRENT_TIMESTAMP';
    db.query(query, [req.user.id, songId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update recently played', details: err.message });
        }
        
        // Increment play count
        const updateQuery = 'UPDATE songs SET play_count = play_count + 1 WHERE id = ?';
        db.query(updateQuery, [songId], () => {});
        
        // Add to listening history
        const historyQuery = 'INSERT INTO listening_history (user_id, song_id) VALUES (?, ?)';
        db.query(historyQuery, [req.user.id, songId], () => {});
        
        res.json({ message: 'Recently played updated successfully' });
    });
});

// Get recently played
app.get('/api/recent', authenticateToken, (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    
    const query = `
        SELECT s.*, rp.played_at 
        FROM songs s
        INNER JOIN recently_played rp ON s.id = rp.song_id
        WHERE rp.user_id = ?
        ORDER BY rp.played_at DESC
        LIMIT ?
    `;
    
    db.query(query, [req.user.id, limit], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch recently played', details: err.message });
        }
        res.json(results);
    });
});

// =====================================================
// SEARCH ROUTES
// =====================================================

// Search songs
app.get('/api/search', (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
    }
    
    const searchTerm = `%${q}%`;
    const query = `
        SELECT * FROM songs 
        WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? 
        ORDER BY play_count DESC 
        LIMIT 50
    `;
    
    db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Search failed', details: err.message });
        }
        res.json(results);
    });
});

// =====================================================
// GENRE ROUTES
// =====================================================

// Get all genres
app.get('/api/genres', (req, res) => {
    const query = 'SELECT * FROM genres ORDER BY name ASC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch genres', details: err.message });
        }
        res.json(results);
    });
});

// Get songs by genre
app.get('/api/genres/:id/songs', (req, res) => {
    const query = `
        SELECT s.* 
        FROM songs s
        INNER JOIN song_genres sg ON s.id = sg.song_id
        WHERE sg.genre_id = ?
        ORDER BY s.play_count DESC
        LIMIT 50
    `;
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch genre songs', details: err.message });
        }
        res.json(results);
    });
});

// =====================================================
// STATISTICS ROUTES
// =====================================================

// Get user statistics
app.get('/api/stats/user', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            u.id,
            u.username,
            COUNT(DISTINCT p.id) as total_playlists,
            COUNT(DISTINCT ls.id) as total_liked_songs,
            COUNT(DISTINCT f1.id) as followers_count,
            COUNT(DISTINCT f2.id) as following_count
        FROM users u
        LEFT JOIN playlists p ON u.id = p.user_id
        LEFT JOIN liked_songs ls ON u.id = ls.user_id
        LEFT JOIN followers f1 ON u.id = f1.following_id
        LEFT JOIN followers f2 ON u.id = f2.follower_id
        WHERE u.id = ?
        GROUP BY u.id
    `;
    
    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch user stats', details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User stats not found' });
        }
        res.json(results[0]);
    });
});

// Get popular songs
app.get('/api/stats/popular', (req, res) => {
    const query = `
        SELECT 
            s.*,
            COUNT(DISTINCT lh.id) as total_plays,
            COUNT(DISTINCT ls.id) as total_likes
        FROM songs s
        LEFT JOIN listening_history lh ON s.id = lh.song_id
        LEFT JOIN liked_songs ls ON s.id = ls.song_id
        GROUP BY s.id
        ORDER BY total_plays DESC, total_likes DESC
        LIMIT 50
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch popular songs', details: err.message });
        }
        res.json(results);
    });
});

// =====================================================
// ALBUM ROUTES
// =====================================================

// Get all albums
app.get('/api/albums', (req, res) => {
    const query = 'SELECT * FROM albums ORDER BY release_year DESC, title ASC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch albums', details: err.message });
        }
        res.json(results);
    });
});

// Get album by ID
app.get('/api/albums/:id', (req, res) => {
    const query = 'SELECT * FROM albums WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Album not found' });
        }
        res.json(results[0]);
    });
});

// Get songs by album
app.get('/api/albums/:id/songs', (req, res) => {
    const query = 'SELECT * FROM songs WHERE album = (SELECT title FROM albums WHERE id = ?) ORDER BY title ASC';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch album songs', details: err.message });
        }
        res.json(results);
    });
});

// =====================================================
// ROOT ROUTE - API DOCUMENTATION
// =====================================================

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Suno API</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #1DB954 0%, #191414 100%);
            color: #fff;
            min-height: 100vh;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 40px 20px; 
        }
        h1 { 
            font-size: 48px; 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .status { 
            display: inline-block;
            padding: 8px 20px;
            background: rgba(29, 185, 84, 0.2);
            border: 2px solid #1DB954;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
        }
        .section { 
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 30px; 
            margin: 20px 0; 
            border-radius: 16px;
        }
        h2 { 
            font-size: 24px; 
            margin-bottom: 20px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 10px;
        }
        .endpoint { 
            background: rgba(0, 0, 0, 0.3); 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px;
            border-left: 4px solid #1DB954;
        }
        .method { 
            display: inline-block;
            color: #fff; 
            padding: 4px 12px; 
            border-radius: 5px; 
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
        }
        .get { background: #61affe; }
        .post { background: #49cc90; }
        .delete { background: #f93e3e; }
        .put { background: #fca130; }
        .protected { 
            float: right;
            padding: 4px 12px;
            background: rgba(255, 165, 0, 0.3);
            border-radius: 5px;
            font-size: 11px;
        }
        .info { 
            background: rgba(29, 185, 84, 0.1);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #1DB954;
        }
        code { 
            background: rgba(0, 0, 0, 0.5);
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Music Suno API</h1>
        <div class="status">✅ Server Running</div>
        <p style="margin: 20px 0; font-size: 18px; opacity: 0.9;">
            RESTful API for the Music Suno streaming platform
        </p>

        <div class="info">
            <strong>📍 Base URL:</strong> <code>http://localhost:${PORT}/api</code><br>
            <strong>🔒 Authentication:</strong> Bearer Token (JWT)<br>
            <strong>💾 Database:</strong> music_suno (MySQL)
        </div>

        <div class="section">
            <h2>🔐 Authentication</h2>
            <div class="endpoint">
                <span class="method post">POST</span> /api/register
                <p style="margin-top: 8px; opacity: 0.8;">Register a new user account</p>
            </div>
            <div class="endpoint">
                <span class="method post">POST</span> /api/login
                <p style="margin-top: 8px; opacity: 0.8;">Login and receive JWT token</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/user/:id
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Get user profile by ID</p>
            </div>
            <div class="endpoint">
                <span class="method put">PUT</span> /api/user/:id
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Update user profile</p>
            </div>
        </div>

        <div class="section">
            <h2>🎵 Songs</h2>
            <div class="endpoint">
                <span class="method get">GET</span> /api/songs
                <p style="margin-top: 8px; opacity: 0.8;">Get all songs (with pagination support)</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/songs/:id
                <p style="margin-top: 8px; opacity: 0.8;">Get single song by ID</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/songs/trending/now
                <p style="margin-top: 8px; opacity: 0.8;">Get trending songs (last 7 days)</p>
            </div>
            <div class="endpoint">
                <span class="method post">POST</span> /api/songs
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Add new song with cover and audio upload</p>
            </div>
            <div class="endpoint">
                <span class="method put">PUT</span> /api/songs/:id
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Update song details</p>
            </div>
            <div class="endpoint">
                <span class="method delete">DELETE</span> /api/songs/:id
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Delete a song</p>
            </div>
        </div>

        <div class="section">
            <h2>📋 Playlists</h2>
            <div class="endpoint">
                <span class="method get">GET</span> /api/playlists
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Get user's playlists</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/playlists/:id
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Get playlist details</p>
            </div>
            <div class="endpoint">
                <span class="method post">POST</span> /api/playlists
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Create new playlist</p>
            </div>
            <div class="endpoint">
                <span class="method put">PUT</span> /api/playlists/:id
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Update playlist</p>
            </div>
            <div class="endpoint">
                <span class="method delete">DELETE</span> /api/playlists/:id
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Delete playlist</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/playlists/:id/songs
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Get all songs in playlist</p>
            </div>
            <div class="endpoint">
                <span class="method post">POST</span> /api/playlists/:id/songs
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Add song to playlist</p>
            </div>
            <div class="endpoint">
                <span class="method delete">DELETE</span> /api/playlists/:playlistId/songs/:songId
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Remove song from playlist</p>
            </div>
        </div>

        <div class="section">
            <h2>❤️ Liked Songs</h2>
            <div class="endpoint">
                <span class="method post">POST</span> /api/likes
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Like a song</p>
            </div>
            <div class="endpoint">
                <span class="method delete">DELETE</span> /api/likes/:songId
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Unlike a song</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/likes
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Get all liked songs</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/likes/check/:songId
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Check if song is liked</p>
            </div>
        </div>

        <div class="section">
            <h2>🕐 Recently Played</h2>
            <div class="endpoint">
                <span class="method post">POST</span> /api/recent
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Add song to recently played</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/recent
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Get recently played songs</p>
            </div>
        </div>

        <div class="section">
            <h2>🔍 Search & Discover</h2>
            <div class="endpoint">
                <span class="method get">GET</span> /api/search?q=query
                <p style="margin-top: 8px; opacity: 0.8;">Search songs by title, artist, or album</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/genres
                <p style="margin-top: 8px; opacity: 0.8;">Get all genres</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/genres/:id/songs
                <p style="margin-top: 8px; opacity: 0.8;">Get songs by genre</p>
            </div>
        </div>

        <div class="section">
            <h2>💿 Albums</h2>
            <div class="endpoint">
                <span class="method get">GET</span> /api/albums
                <p style="margin-top: 8px; opacity: 0.8;">Get all albums</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/albums/:id
                <p style="margin-top: 8px; opacity: 0.8;">Get album details</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/albums/:id/songs
                <p style="margin-top: 8px; opacity: 0.8;">Get songs from album</p>
            </div>
        </div>

        <div class="section">
            <h2>📊 Statistics</h2>
            <div class="endpoint">
                <span class="method get">GET</span> /api/stats/user
                <span class="protected">🔒 Protected</span>
                <p style="margin-top: 8px; opacity: 0.8;">Get user statistics</p>
            </div>
            <div class="endpoint">
                <span class="method get">GET</span> /api/stats/popular
                <p style="margin-top: 8px; opacity: 0.8;">Get popular songs with analytics</p>
            </div>
        </div>

        <div class="info">
            <strong>🚀 Quick Start:</strong><br>
            1. Register: <code>POST /api/register</code><br>
            2. Login: <code>POST /api/login</code> (receive token)<br>
            3. Use token in headers: <code>Authorization: Bearer &lt;token&gt;</code><br>
            4. Access protected endpoints with token
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="opacity: 0.7;">Music Suno API v2.0 | Built with Express.js & MySQL</p>
        </div>
    </div>
</body>
</html>
    `);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.path 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║        🎵  MUSIC SUNO API SERVER  🎵          ║
║                                               ║
║  Server running on: http://localhost:${PORT}   ║
║  Database: music_suno (MySQL)                 ║
║  API Docs: http://localhost:${PORT}/           ║
║                                               ║
║  Status: ✅ Ready to accept requests          ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);
});