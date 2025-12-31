# Music Suno - EJS Frontend Setup Guide

## 🎵 Project Structure

```
music-suno/
├── app.js                    # Main EJS server (Port 4000)
├── server.js                 # API server (Port 3000)
├── package.json              # Dependencies
├── database.sql              # Database schema
├── views/                    # EJS templates
│   ├── index.ejs            # Home page
│   ├── login.ejs            # Login page
│   ├── register.ejs         # Register page
│   ├── dashboard.ejs        # User dashboard
│   ├── browse.ejs           # Browse songs
│   ├── song.ejs             # Single song page
│   ├── playlists.ejs        # Playlists page
│   ├── playlist.ejs         # Single playlist
│   ├── liked.ejs            # Liked songs
│   ├── search.ejs           # Search results
│   └── partials/
│       ├── header.ejs       # Header partial
│       └── footer.ejs       # Footer partial
├── public/                   # Static files
│   ├── css/
│   │   ├── style.css        # Main stylesheet
│   │   └── auth.css         # Auth pages styles
│   ├── js/
│   │   └── main.js          # Client-side JavaScript
│   └── assets/              # Images (covers, icons, etc.)
└── uploads/                  # Uploaded files
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
mysql -u root -p < database.sql
```

Or manually:
```sql
mysql -u root -p
CREATE DATABASE music_suno;
USE music_suno;
SOURCE database.sql;
```

### 3. Configure Database Connection

Edit `server.js` (line 19-25):
```javascript
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD',  // ← Change this
    database: 'music_suno'
});
```

### 4. Create Required Directories

```bash
mkdir -p public/assets
mkdir -p uploads
```

### 5. Add Sample Images

Place your song cover images in `public/assets/`:
- card1img.jpeg
- card2img.jpeg
- card3img.jpeg
- card4img.jpeg
- card5img.jpeg
- card6img.jpeg
- album_picture.jpeg

## 🎬 Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - API Server:**
```bash
npm run api
# Server runs on http://localhost:3000
```

**Terminal 2 - Web App:**
```bash
npm start
# Web app runs on http://localhost:4000
```

### Option 2: Run Both Servers Together

```bash
npm run dev:all
```

## 🌐 Access the Application

- **Web Application:** http://localhost:4000
- **API Server:** http://localhost:3000
- **API Documentation:** http://localhost:3000/

## 👤 Default Test Accounts

Login with these pre-created accounts:

```
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123

Email: mike@example.com
Password: password123

Email: sarah@example.com
Password: password123
```

## 📱 Available Pages

### Public Pages (No Login Required)
- **Home:** `/` - Landing page with featured music
- **Browse:** `/browse` - Browse all songs
- **Login:** `/login` - User login
- **Register:** `/register` - New user registration
- **Search:** `/search?q=query` - Search songs

### Protected Pages (Login Required)
- **Dashboard:** `/dashboard` - User dashboard with stats
- **Playlists:** `/playlists` - User's playlists
- **Playlist Details:** `/playlist/:id` - View playlist songs
- **Liked Songs:** `/liked` - User's liked songs
- **Song Details:** `/song/:id` - Single song page

## 🎨 Features

### ✅ Implemented Features

1. **User Authentication**
   - Registration & Login
   - Session management
   - Protected routes

2. **Music Playback**
   - Play/pause controls
   - Progress bar
   - Volume control
   - Next/Previous (UI ready)

3. **Song Management**
   - Browse all songs
   - Search songs
   - View song details
   - Filter and sort

4. **Playlist Features**
   - Create playlists
   - Add songs to playlists
   - View playlist songs
   - Delete playlists

5. **Like System**
   - Like/unlike songs
   - View all liked songs
   - Like count display

6. **Recently Played**
   - Track listening history
   - View recent songs
   - Auto-update on play

7. **Responsive Design**
   - Mobile-friendly
   - Tablet optimized
   - Desktop layout

8. **Modern UI/UX**
   - Gradient designs
   - Smooth animations
   - Hover effects
   - Loading states

## 🔧 Customization

### Change Colors

Edit `public/css/style.css`:
```css
:root {
    --primary: #1DB954;        /* Main green color */
    --primary-dark: #1aa34a;   /* Darker green */
    --background: #121212;      /* Dark background */
    --surface: #181818;         /* Card background */
}
```

### Add More Pages

1. Create new EJS file in `views/`
2. Add route in `app.js`
3. Add navigation link in `partials/header.ejs`

Example:
```javascript
// app.js
app.get('/genres', async (req, res) => {
    res.render('genres', {
        user: req.session.user || null,
        page: 'genres'
    });
});
```

## 🐛 Troubleshooting

### Database Connection Failed
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution:** Check MySQL username and password in `server.js`

### Port Already in Use
```
Error: listen EADDRINUSE :::4000
```
**Solution:** Kill the process or change port in `app.js`:
```javascript
const PORT = 5000; // Change to any available port
```

### Sessions Not Working
**Solution:** Clear browser cookies or use incognito mode

### Images Not Loading
**Solution:** 
1. Ensure `public/assets/` directory exists
2. Add image files with correct names
3. Check file permissions

## 📊 Database Tables

- `users` - User accounts
- `songs` - Song library
- `albums` - Album information
- `genres` - Music genres
- `playlists` - User playlists
- `playlist_songs` - Playlist-song relationships
- `liked_songs` - User liked songs
- `recently_played` - Listening history
- `followers` - Social features
- `listening_history` - Detailed analytics

## 🚀 Production Deployment

### Environment Variables

Create `.env` file:
```env
PORT=4000
API_URL=http://localhost:3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_suno
JWT_SECRET=your_secret_key
SESSION_SECRET=your_session_secret
```

### Security Improvements

1. Change JWT secret in `server.js`
2. Change session secret in `app.js`
3. Enable HTTPS
4. Add rate limiting
5. Sanitize user inputs
6. Use environment variables

## 📝 API Endpoints

Full API documentation available at: http://localhost:3000/

### Authentication
- `POST /api/register` - Register user
- `POST /api/login` - Login user

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get song by ID
- `GET /api/songs/trending/now` - Trending songs

### Playlists
- `GET /api/playlists` - User playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/:id/songs` - Playlist songs

### Likes
- `POST /api/likes` - Like song
- `DELETE /api/likes/:songId` - Unlike song
- `GET /api/likes` - Get liked songs

## 🎯 Future Enhancements

- [ ] Audio file upload & streaming
- [ ] Advanced search with filters
- [ ] User profiles
- [ ] Social features (follow users)
- [ ] Comments on songs
- [ ] Sharing playlists
- [ ] Recommended songs
- [ ] Genre-based browsing
- [ ] Artist pages
- [ ] Album pages
- [ ] Queue management
- [ ] Shuffle & repeat
- [ ] Keyboard shortcuts
- [ ] Dark/Light theme toggle

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs in terminal
3. Verify database connection
4. Check browser console for errors

## 🎉 Credits

Built with:
- Express.js - Web framework
- EJS - Templating engine
- MySQL - Database
- Font Awesome - Icons
- Custom CSS - Styling

---

**Happy Streaming! 🎵**