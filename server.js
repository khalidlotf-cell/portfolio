require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2026';

// ── Base de données ───────────────────────────────────────────────────────────
// PostgreSQL si DATABASE_URL est défini (production Railway)
// JSON local sinon (développement)

let pool = null;
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('  DB → PostgreSQL');
} else {
  console.log('  DB → JSON local (data/projects.json)');
}

async function initDB() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id            TEXT PRIMARY KEY,
      title         TEXT    NOT NULL DEFAULT 'Sans titre',
      tagline       TEXT    DEFAULT '',
      description   TEXT    DEFAULT '',
      meta_desc     TEXT    DEFAULT '',
      tag           TEXT    DEFAULT '',
      count         TEXT    DEFAULT '',
      status        TEXT    DEFAULT 'completed',
      thumbnail     TEXT    DEFAULT '',
      gallery       JSONB   DEFAULT '[]',
      videos        JSONB   DEFAULT '[]',
      link          TEXT    DEFAULT '',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

// ── Helpers JSON (fallback local) ─────────────────────────────────────────────

function readJSON() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ projects: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeJSON(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function rowToProject(row) {
  return {
    id:              row.id,
    title:           row.title,
    tagline:         row.tagline,
    description:     row.description,
    metaDescription: row.meta_desc,
    tag:             row.tag,
    count:           row.count,
    status:          row.status,
    thumbnail:       row.thumbnail,
    gallery:         row.gallery  || [],
    videos:          row.videos   || [],
    link:            row.link,
    createdAt:       row.created_at
  };
}

// ── CRUD abstrait ─────────────────────────────────────────────────────────────

async function dbGetAll() {
  if (pool) {
    const r = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    return r.rows.map(rowToProject);
  }
  return readJSON().projects;
}

async function dbGetById(id) {
  if (pool) {
    const r = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    return r.rows[0] ? rowToProject(r.rows[0]) : null;
  }
  return readJSON().projects.find(p => p.id === id) || null;
}

async function dbCreate(p) {
  if (pool) {
    await pool.query(
      `INSERT INTO projects
        (id, title, tagline, description, meta_desc, tag, count, status, thumbnail, gallery, videos, link, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [p.id, p.title, p.tagline, p.description, p.metaDescription,
       p.tag, p.count, p.status, p.thumbnail,
       JSON.stringify(p.gallery), JSON.stringify(p.videos),
       p.link, p.createdAt]
    );
    return await dbGetById(p.id);
  }
  const data = readJSON();
  data.projects.unshift(p);
  writeJSON(data);
  return p;
}

async function dbUpdate(id, fields) {
  if (pool) {
    const current = await dbGetById(id);
    if (!current) return null;
    const u = { ...current, ...fields };
    await pool.query(
      `UPDATE projects SET
        title=$2, tagline=$3, description=$4, meta_desc=$5, tag=$6,
        count=$7, status=$8, thumbnail=$9, gallery=$10, videos=$11, link=$12
       WHERE id=$1`,
      [id, u.title, u.tagline, u.description, u.metaDescription,
       u.tag, u.count, u.status, u.thumbnail,
       JSON.stringify(u.gallery), JSON.stringify(u.videos), u.link]
    );
    return await dbGetById(id);
  }
  const data = readJSON();
  const i = data.projects.findIndex(p => p.id === id);
  if (i === -1) return null;
  data.projects[i] = { ...data.projects[i], ...fields };
  writeJSON(data);
  return data.projects[i];
}

async function dbDelete(id) {
  if (pool) {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return;
  }
  const data = readJSON();
  data.projects = data.projects.filter(p => p.id !== id);
  writeJSON(data);
}

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'portfolio-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Auth ──────────────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (req.session?.authenticated) return next();
  res.status(401).json({ error: 'Non autorisé' });
}

app.post('/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/admin/check', (req, res) => {
  res.json({ ok: !!req.session?.authenticated });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// ── API Projets ───────────────────────────────────────────────────────────────

app.get('/api/projects', async (req, res) => {
  try { res.json(await dbGetAll()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const project = {
      id:              Date.now().toString(),
      title:           req.body.title           || 'Sans titre',
      tagline:         req.body.tagline         || '',
      description:     req.body.description     || '',
      metaDescription: req.body.metaDescription || '',
      tag:             req.body.tag             || '',
      count:           req.body.count           || '',
      status:          req.body.status === 'in-progress' ? 'in-progress' : 'completed',
      thumbnail:       req.body.thumbnail       || '',
      gallery:         req.body.gallery ? JSON.parse(req.body.gallery) : [],
      videos:          req.body.videos  ? JSON.parse(req.body.videos)  : [],
      link:            '',
      createdAt:       new Date().toISOString()
    };
    res.status(201).json(await dbCreate(project));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const current = await dbGetById(req.params.id);
    if (!current) return res.status(404).json({ error: 'Non trouvé' });

    const fields = {
      title:           req.body.title           ?? current.title,
      tagline:         req.body.tagline         ?? current.tagline,
      description:     req.body.description     ?? current.description,
      metaDescription: req.body.metaDescription ?? current.metaDescription,
      tag:             req.body.tag             ?? current.tag,
      count:           req.body.count           ?? current.count,
      status:          req.body.status          ?? current.status,
      thumbnail:       req.body.thumbnail       ?? current.thumbnail,
      gallery:         req.body.gallery !== undefined ? JSON.parse(req.body.gallery) : current.gallery,
      videos:          req.body.videos  !== undefined ? JSON.parse(req.body.videos)  : current.videos
    };

    res.json(await dbUpdate(req.params.id, fields));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/projects/:id', requireAuth, async (req, res) => {
  try { await dbDelete(req.params.id); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Upload images ─────────────────────────────────────────────────────────────

app.post('/api/upload', requireAuth, multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(__dirname, 'uploads');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
    }
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    /^image\//.test(file.mimetype) ? cb(null, true) : cb(new Error('Image uniquement'));
  }
}).array('images', 20), (req, res) => {
  res.json({ urls: (req.files || []).map(f => '/uploads/' + f.filename) });
});

// ── Pages projet dynamiques ───────────────────────────────────────────────────

app.get('/projets/:id', async (req, res, next) => {
  if (req.params.id.includes('.')) return next();

  try {
    const p = await dbGetById(req.params.id);
    if (!p) return res.status(404).send('Projet non trouvé');

    const gallery = (p.gallery || [])
      .map(src => `<div class="gallery-item"><img src="${src}" alt="${p.title}" loading="lazy"></div>`)
      .join('');

    const videos = (p.videos || [])
      .map(id => `
        <div style="padding:56.25% 0 0 0;position:relative;margin-bottom:1.5rem;">
          <iframe src="https://player.vimeo.com/video/${id}?badge=0&autopause=0&player_id=0&app_id=58479"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            style="position:absolute;top:0;left:0;width:100%;height:100%;"
            title="Vidéo"></iframe>
        </div>`)
      .join('');

    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${p.title} — Khalid LOTF</title>
  <meta name="description" content="${p.metaDescription || p.tagline}">
  <meta name="robots" content="${p.status === 'in-progress' ? 'noindex,nofollow' : 'index,follow'}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<nav>
  <div class="nav-container">
    <a class="nav-logo" href="/" aria-label="Khalid LOTF — Accueil">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="34" height="34" fill="none">
        <rect width="32" height="32" rx="7" fill="#d97060"/>
        <text x="16" y="22" font-family="Georgia,serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" letter-spacing="-0.5">KL</text>
      </svg>
    </a>
    <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="navLinks">
      <li><a href="/">Accueil</a></li>
      <li><a href="/projects.html" class="active">Projets</a></li>
      <li><a href="/a-propos.html">À Propos</a></li>
      <li><a href="/contact.html">Contact</a></li>
      <li><a href="/CV.html">CV</a></li>
    </ul>
  </div>
</nav>
<main>
  <section class="project-detail">
    <div class="container">
      <div class="project-detail-header">
        ${p.tag ? `<span class="project-tag" style="margin-bottom:1rem;display:inline-flex">${p.tag}</span>` : ''}
        <h1>${p.title}</h1>
        <p class="project-desc">${p.description}</p>
      </div>
      ${gallery ? `<div class="gallery-grid">${gallery}</div>` : ''}
      ${videos ? `<div style="margin-top:2rem">${videos}</div><script src="https://player.vimeo.com/api/player.js"><\/script>` : ''}
      <div class="back-section" style="margin-top:2rem">
        <a href="/projects.html" class="back-button">← Retour aux projets</a>
      </div>
    </div>
  </section>
</main>
<footer>
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand"><p class="footer-logo">K.LOTF</p><p>Designer · Vidéaste · Créateur</p></div>
      <nav class="footer-links">
        <a href="/projects.html">Projets</a>
        <a href="/a-propos.html">À Propos</a>
        <a href="/contact.html">Contact</a>
        <a href="/CV.html">CV</a>
      </nav>
      <p class="footer-copy">© 2026 Khalid LOTF.<br>Tous droits réservés.</p>
    </div>
  </div>
</footer>
<script src="/js/script.js"></script>
</body>
</html>`);
  } catch (e) { res.status(500).send('Erreur serveur'); }
});

// ── Migration JSON → PostgreSQL ───────────────────────────────────────────────

app.get('/admin/migrate', requireAuth, async (req, res) => {
  if (!pool) return res.json({ ok: false, message: 'Pas de PostgreSQL connecté' });
  try {
    const data = readJSON();
    let inserted = 0, skipped = 0;
    for (const p of data.projects) {
      const exists = await dbGetById(p.id);
      if (exists) { skipped++; continue; }
      await dbCreate({
        id:              p.id,
        title:           p.title           || 'Sans titre',
        tagline:         p.tagline         || '',
        description:     p.description     || '',
        metaDescription: p.metaDescription || '',
        tag:             p.tag             || '',
        count:           p.count           || '',
        status:          p.status          || 'completed',
        thumbnail:       p.thumbnail       || '',
        gallery:         p.gallery         || [],
        videos:          p.videos          || [],
        link:            p.link            || '',
        createdAt:       p.createdAt       || new Date().toISOString()
      });
      inserted++;
    }
    res.json({ ok: true, inserted, skipped });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Fichiers statiques ────────────────────────────────────────────────────────

app.use(express.static(__dirname));

// ── Démarrage ─────────────────────────────────────────────────────────────────

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  Portfolio  →  http://localhost:${PORT}`);
    console.log(`  Admin      →  http://localhost:${PORT}/admin\n`);
  });
}).catch(err => {
  console.error('Erreur DB :', err.message);
  process.exit(1);
});
