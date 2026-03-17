// app.js - Version améliorée avec images et design compact professionnel
const express = require("express");
const axios = require("axios");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const port = 5000;

// Nom du container MongoDB
const mongoUrl = "mongodb://mongodb:27017";
const dbName = "api_database";

let collection;

// Fonction de connexion à MongoDB avec retry
async function connectMongo(retries = 20, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = new MongoClient(mongoUrl);
      await client.connect();
      console.log("✅ Connexion MongoDB réussie !");
      const db = client.db(dbName);
      collection = db.collection("topmusic");
      return;
    } catch (err) {
      console.log(`⏳ MongoDB non prêt, tentative ${i + 1}/${retries} ... attente ${delay}ms`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("❌ Impossible de se connecter à MongoDB après plusieurs tentatives");
}

// Middleware pour servir fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Route API pour récupérer et stocker le top 10 musique AVEC IMAGES
app.get("/fetch-top-music", async (req, res) => {
  try {
    console.log("📡 Appel à l'API Deezer...");
    // Récupérer le top 10 avec plus d'informations
    const response = await axios.get("https://api.deezer.com/chart/0?limit=10");
    const tracks = response.data.tracks.data;

    // Transformer les données pour MongoDB avec les images
    const musicData = tracks.map(track => ({
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      albumCover: track.album.cover_medium || track.album.cover, // Image de l'album
      artistPicture: track.artist.picture_medium || track.artist.picture, // Photo de l'artiste
      duration: track.duration,
      preview: track.preview,
      rank: track.rank,
      position: tracks.indexOf(track) + 1,
      releaseDate: track.album.release_date,
      explicit: track.explicit_lyrics,
      createdAt: new Date()
    }));

    // Vider l'ancienne collection et insérer les nouvelles données
    await collection.deleteMany({});
    const result = await collection.insertMany(musicData);
    
    console.log(`✅ ${result.insertedCount} titres insérés avec images`);
    res.json({ 
      message: "Top 10 musique récupéré et stocké avec succès !", 
      count: musicData.length,
      data: musicData 
    });
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route pour afficher le top 10 musique depuis MongoDB
app.get("/top-music", async (req, res) => {
  try {
    const music = await collection.find({}).sort({ position: 1 }).toArray();

    // Fonction pour formater la durée (secondes -> mm:ss)
    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Fonction pour tronquer le texte si trop long
    const truncate = (text, length) => {
      return text.length > length ? text.substring(0, length) + '...' : text;
    };

    // Renvoi du HTML avec design moderne, compact et professionnel
    let html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Top Charts Music - Classement Officiel</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0a0f;
            min-height: 100vh;
            padding: 20px;
            position: relative;
          }

          /* Animation de fond avec particules */
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 10% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 30%),
              radial-gradient(circle at 90% 70%, rgba(118, 75, 162, 0.08) 0%, transparent 30%),
              radial-gradient(circle at 30% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 40%);
            pointer-events: none;
          }

          .container {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(18, 18, 30, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 32px;
            padding: 30px;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
            position: relative;
            z-index: 1;
            border: 1px solid rgba(255, 255, 255, 0.03);
          }

          /* En-tête avec effet de glow */
          .header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            padding: 15px 0;
          }

          .header h1 {
            font-size: 3.5em;
            font-weight: 800;
            background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
            letter-spacing: -2px;
            position: relative;
            display: inline-block;
            filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
          }

          .header h1 i {
            margin-right: 15px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 1.2em;
          }

          /* Vague musicale animée améliorée */
          .wave-decoration {
            display: flex;
            justify-content: center;
            gap: 4px;
            margin: 15px 0;
          }

          .wave-decoration span {
            width: 6px;
            height: 25px;
            background: linear-gradient(180deg, #667eea, #764ba2);
            border-radius: 3px;
            animation: wave 1.2s ease-in-out infinite;
            opacity: 0.7;
          }

          .wave-decoration span:nth-child(1) { animation-delay: 0s; height: 20px; }
          .wave-decoration span:nth-child(2) { animation-delay: 0.1s; height: 30px; }
          .wave-decoration span:nth-child(3) { animation-delay: 0.2s; height: 40px; }
          .wave-decoration span:nth-child(4) { animation-delay: 0.3s; height: 45px; }
          .wave-decoration span:nth-child(5) { animation-delay: 0.4s; height: 40px; }
          .wave-decoration span:nth-child(6) { animation-delay: 0.5s; height: 30px; }
          .wave-decoration span:nth-child(7) { animation-delay: 0.6s; height: 20px; }

          @keyframes wave {
            0%, 100% { transform: scaleY(0.8); opacity: 0.7; }
            50% { transform: scaleY(1.3); opacity: 1; }
          }

          .subtitle {
            font-size: 1.1em;
            color: #9ca3af;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 10px;
          }

          .subtitle .badge {
            background: linear-gradient(135deg, #667eea20, #764ba220);
            color: #c4b5fd;
            padding: 6px 20px;
            border-radius: 40px;
            font-weight: 600;
            font-size: 0.85em;
            border: 1px solid #667eea40;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          }

          /* Barre de statistiques compacte et élégante */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }

          .stat-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 18px;
            padding: 18px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .stat-card:hover {
            transform: translateY(-3px);
            background: rgba(255, 255, 255, 0.04);
            border-color: #667eea40;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          }

          .stat-icon {
            font-size: 1.8em;
            color: #8b5cf6;
            background: rgba(139, 92, 246, 0.1);
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
          }

          .stat-info {
            flex: 1;
          }

          .stat-label {
            font-size: 0.75em;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }

          .stat-value {
            font-size: 1.4em;
            font-weight: 700;
            color: white;
            line-height: 1.2;
          }

          /* Bouton de rafraîchissement amélioré */
          .refresh-section {
            text-align: center;
            margin: 30px 0;
          }

          .refresh-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 14px 40px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1em;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
            position: relative;
            overflow: hidden;
          }

          .refresh-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
          }

          .refresh-btn:hover::before {
            left: 100%;
          }

          .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.6);
          }

          .refresh-btn i {
            font-size: 1.1em;
            animation: spin 3s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* GRILLE COMPACTE - CARTES PLUS PETITES */
          .music-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 16px;
            margin-top: 20px;
          }

          .music-card {
            background: rgba(20, 20, 35, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.02);
            border-radius: 16px;
            padding: 14px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            animation: cardAppear 0.4s ease-out;
            animation-fill-mode: both;
            backdrop-filter: blur(10px);
          }

          @keyframes cardAppear {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .music-card:hover {
            transform: translateY(-4px) scale(1.02);
            background: rgba(30, 30, 45, 0.9);
            border-color: #667eea60;
            box-shadow: 0 15px 25px rgba(0, 0, 0, 0.5);
          }

          .music-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
          }

          .music-card:hover::after {
            transform: translateX(100%);
          }

          /* Image de l'album - compacte */
          .card-image {
            position: relative;
            margin-bottom: 10px;
            border-radius: 10px;
            overflow: hidden;
            aspect-ratio: 1/1;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
          }

          .card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
          }

          .music-card:hover .card-image img {
            transform: scale(1.08);
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: flex-end;
            padding: 10px;
          }

          .music-card:hover .image-overlay {
            opacity: 1;
          }

          .position-badge-large {
            font-size: 2.2em;
            font-weight: 800;
            color: white;
            text-shadow: 0 3px 8px rgba(0,0,0,0.5);
            line-height: 1;
          }

          /* En-tête de carte compact */
          .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .position-badge {
            width: 32px;
            height: 32px;
            background: rgba(139, 92, 246, 0.15);
            border: 1px solid #667eea30;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1em;
            font-weight: 700;
            color: #a78bfa;
          }

          .position-1 {
            background: linear-gradient(135deg, #FFD70020, #FFA50020);
            border-color: #FFD70060;
            color: #FFD700;
          }

          .position-2 {
            background: linear-gradient(135deg, #C0C0C020, #A0A0A020);
            border-color: #C0C0C060;
            color: #C0C0C0;
          }

          .position-3 {
            background: linear-gradient(135deg, #CD7F3220, #B8733320);
            border-color: #CD7F3260;
            color: #CD7F32;
          }

          .title-section {
            flex: 1;
          }

          .title-section h3 {
            font-size: 0.9em;
            font-weight: 600;
            color: white;
            margin-bottom: 2px;
            line-height: 1.2;
          }

          .artist {
            color: #9ca3af;
            font-size: 0.7em;
            display: flex;
            align-items: center;
            gap: 3px;
          }

          .artist i {
            color: #8b5cf6;
            font-size: 0.7em;
          }

          /* Infos album compactes */
          .album-info {
            background: rgba(255, 255, 255, 0.02);
            padding: 8px;
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid rgba(255, 255, 255, 0.02);
          }

          .album-name {
            color: #d1d5db;
            font-size: 0.75em;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .album-name i {
            color: #8b5cf6;
            font-size: 0.7em;
          }

          .meta-info {
            display: flex;
            gap: 8px;
            font-size: 0.65em;
          }

          .release-date {
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 3px;
          }

          .explicit-badge {
            background: #ef444420;
            color: #ef4444;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.6em;
            font-weight: 700;
            text-transform: uppercase;
          }

          /* Durée compacte */
          .duration {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(255, 255, 255, 0.03);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.7em;
            color: #9ca3af;
          }

          .duration i {
            font-size: 0.7em;
            color: #8b5cf6;
          }

          /* Footer compact */
          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
          }

          .preview-btn {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 5px 10px;
            border-radius: 16px;
            text-decoration: none;
            font-size: 0.65em;
            font-weight: 500;
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            letter-spacing: 0.3px;
          }

          .preview-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 12px rgba(102, 126, 234, 0.4);
          }

          .preview-btn i {
            font-size: 0.7em;
          }

          .rank-stats {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .rank-number {
            background: rgba(255, 255, 255, 0.03);
            padding: 3px 6px;
            border-radius: 10px;
            font-size: 0.6em;
            color: #9ca3af;
            display: flex;
            align-items: center;
            gap: 3px;
            border: 1px solid rgba(255,255,255,0.02);
          }

          .rank-number i {
            color: #fbbf24;
            font-size: 0.6em;
          }

          /* État vide stylisé */
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 24px;
            border: 2px dashed #667eea30;
            grid-column: 1 / -1;
          }

          .empty-state i {
            font-size: 4em;
            color: #667eea40;
            margin-bottom: 20px;
          }

          .empty-state h3 {
            font-size: 1.6em;
            color: white;
            margin-bottom: 10px;
          }

          .empty-state p {
            color: #9ca3af;
            margin-bottom: 25px;
            font-size: 0.95em;
          }

          /* Loader amélioré */
          .loader {
            display: inline-block;
            width: 35px;
            height: 35px;
            border: 2px solid rgba(255,255,255,0.05);
            border-radius: 50%;
            border-top-color: #8b5cf6;
            animation: spin 0.8s ease-in-out infinite;
          }

          /* Footer */
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.03);
            text-align: center;
            color: #6b7280;
            font-size: 0.8em;
          }

          .footer a {
            color: #a78bfa;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
          }

          .footer a:hover {
            color: #8b5cf6;
            text-decoration: underline;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .container {
              padding: 20px;
            }
            
            .header h1 {
              font-size: 2.5em;
            }
            
            .stats-grid {
              grid-template-columns: 1fr;
            }
            
            .music-grid {
              grid-template-columns: 1fr;
            }

            .stat-card {
              padding: 15px;
            }
          }

          @media (max-width: 480px) {
            .header h1 {
              font-size: 2em;
            }
            
            .music-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <i class="fas fa-crown"></i>
              TOP CHARTS
            </h1>
            <div class="wave-decoration">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div class="subtitle">
              <span>Classement officiel Deezer France</span>
              <span class="badge">
                <i class="fas fa-chart-line"></i>
                Mis à jour quotidiennement
              </span>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-headphones-alt"></i></div>
              <div class="stat-info">
                <div class="stat-label">Titres en ligne</div>
                <div class="stat-value">${music.length}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
              <div class="stat-info">
                <div class="stat-label">Dernière mise à jour</div>
                <div class="stat-value">${new Date().toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-clock"></i></div>
              <div class="stat-info">
                <div class="stat-label">Heure</div>
                <div class="stat-value">${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-star"></i></div>
              <div class="stat-info">
                <div class="stat-label">Source</div>
                <div class="stat-value">Deezer</div>
              </div>
            </div>
          </div>

          <div class="refresh-section">
            <a href="/fetch-top-music" class="refresh-btn">
              <i class="fas fa-sync-alt"></i>
              Actualiser le classement
            </a>
          </div>
    `;

    if (music.length === 0) {
      html += `
        <div class="empty-state">
          <i class="fas fa-music"></i>
          <h3>Classement vide</h3>
          <p>Cliquez sur le bouton ci-dessus pour charger le top 10</p>
          <div class="loader"></div>
        </div>
      `;
    } else {
      html += `<div class="music-grid">`;
      
      music.forEach((m, index) => {
        const positionClass = m.position === 1 ? 'position-1' : m.position === 2 ? 'position-2' : m.position === 3 ? 'position-3' : '';
        const animationDelay = index * 0.08;
        
        // Générer une couleur de fond aléatoire mais cohérente pour les placeholders
        const colors = ['#1a1a2e', '#16213e', '#1f1f3a', '#2a2a4a', '#1e1e3f'];
        const colorIndex = (m.position || index) % colors.length;
        
        html += `
          <div class="music-card" style="animation-delay: ${animationDelay}s">
            <div class="card-image">
              <img src="${m.albumCover || `https://via.placeholder.com/250x250/${colors[colorIndex].substring(1)}/8b5cf6?text=Album`}" 
                   alt="${m.album}"
                   loading="lazy"
                   onerror="this.src='https://via.placeholder.com/250x250/1a1a2e/8b5cf6?text=No+Cover'">
              <div class="image-overlay">
                <div class="position-badge-large">#${m.position}</div>
              </div>
            </div>
            
            <div class="card-header">
              <div class="position-badge ${positionClass}">${m.position}</div>
              <div class="title-section">
                <h3>${truncate(m.title, 22)}</h3>
                <div class="artist">
                  <i class="fas fa-user"></i>
                  ${truncate(m.artist, 20)}
                </div>
              </div>
            </div>
            
            <div class="album-info">
              <div class="album-name">
                <i class="fas fa-compact-disc"></i>
                ${truncate(m.album || 'Single', 25)}
              </div>
              <div class="meta-info">
                ${m.releaseDate ? `
                  <span class="release-date">
                    <i class="far fa-calendar-alt"></i>
                    ${new Date(m.releaseDate).getFullYear() || 'N/A'}
                  </span>
                ` : ''}
                ${m.explicit ? '<span class="explicit-badge">Explicit</span>' : ''}
              </div>
            </div>
            
            <div class="duration">
              <i class="fas fa-hourglass-half"></i>
              ${formatDuration(m.duration)}
            </div>
            
            <div class="card-footer">
              ${m.preview ? `
                <a href="${m.preview}" target="_blank" class="preview-btn">
                  <i class="fas fa-play-circle"></i>
                  Écouter
                </a>
              ` : `
                <span class="preview-btn" style="opacity: 0.4; background: #4b5563; cursor: not-allowed;">
                  <i class="fas fa-volume-mute"></i>
                  Non dispo
                </span>
              `}
              
              <div class="rank-stats">
                <span class="rank-number">
                  <i class="fas fa-chart-line"></i>
                  ${m.rank ? (m.rank / 1000).toFixed(0) + 'k' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }

    html += `
          <div class="footer">
            <p>
              <i class="fas fa-database"></i>
              Données fournies par <a href="https://www.deezer.com" target="_blank">Deezer API</a> 
              • Design compact et professionnel
            </p>
            <p style="margin-top: 10px; font-size: 0.7em; opacity: 0.6;">
              ${music.length} titres • Classement temps réel • ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erreur</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background: #0a0a0f;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .error-container {
            background: rgba(255,255,255,0.03);
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            border: 1px solid #ef444430;
            max-width: 500px;
          }
          h1 { 
            color: #ef4444; 
            margin-bottom: 15px;
            font-size: 2em;
          }
          p { 
            color: #9ca3af;
            margin-bottom: 25px;
          }
          a {
            color: #8b5cf6;
            text-decoration: none;
            font-weight: 600;
            padding: 10px 25px;
            border: 1px solid #8b5cf640;
            border-radius: 30px;
            transition: all 0.3s ease;
          }
          a:hover {
            background: #8b5cf620;
            border-color: #8b5cf6;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1><i class="fas fa-exclamation-triangle"></i> Erreur</h1>
          <p>${err.message}</p>
          <a href="/"><i class="fas fa-home"></i> Retour à l'accueil</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Route racine redirige vers le top musique
app.get("/", (req, res) => {
  res.redirect("/top-music");
});

// Route de debug pour vérifier les images
app.get("/debug-images", async (req, res) => {
  try {
    const music = await collection.find({}).limit(1).toArray();
    if (music.length > 0) {
      res.json({
        albumCover: music[0].albumCover,
        artistPicture: music[0].artistPicture,
        title: music[0].title
      });
    } else {
      res.json({ message: "Pas de données" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Démarrage serveur après connexion à MongoDB
connectMongo().then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Serveur lancé sur port ${port}`);
    console.log(`🌐 Accédez à l'application: http://localhost:${port}`);
    console.log(`📸 Debug images: http://localhost:${port}/debug-images`);
  });
}).catch(err => {
  console.error("❌", err);
  process.exit(1);
});