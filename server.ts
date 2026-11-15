import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { createDefaultDatabase, type DatabaseSchema } from './server/defaultData.ts';
import { createProjectZipBuffer } from './server/zipExport.ts';
import type { GameItem, NasaModelItem, Quiz, Story } from './src/types/education.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSCODE = process.env.ADMIN_PASSWORD || '7622';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const seeded = createDefaultDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    const defaults = createDefaultDatabase();
    const hasFullScript =
      Array.isArray(parsed.stories) &&
      parsed.stories.some((s) => s.id === 'nourish-ch1' && s.thumbnailUrl === '/assets/nourish/scenes/scene_01.jpg') &&
      parsed.stories.some((s) => s.id === 'nourish-epilogue' && s.scenes?.some((sc) => Boolean(sc.sceneCode))) &&
      !parsed.stories.some((s) => s.scenes?.some((sc) => sc.imageUrl === '/assets/nourish/img1_9.jpg')) &&
      Array.isArray(parsed.games) &&
      parsed.games.some((g) => g.id === 'nourish-game-ch1' && g.title === 'Maya’s Garden Rescue') &&
      parsed.games.some((g) => g.id === 'nourish-game-ch2' && g.title === 'Connect the Mission') &&
      parsed.games.some((g) => g.id === 'nourish-game-ch3' && g.title === 'Solar Alert—Bubble Trouble') &&
      parsed.games.some((g) => g.id === 'nourish-game-ch4' && g.title === 'Every Watt Counts') &&
      parsed.games.some((g) => g.id === 'nourish-game-ch5' && g.title === 'Greenhouse Mystery Tiles') &&
      parsed.games.some((g) => g.id === 'nourish-game-ch6' && g.title === 'The Missing Water Route') &&
      parsed.games.some((g) => g.id === 'nourish-game-ch7' && g.title === 'Two Readings, One Source') &&
      parsed.games.some((g) => g.id === 'nourish-game-ch8' && g.title === 'Storm Word Scramble') &&
      parsed.games.some(
        (g) =>
          g.id === 'nourish-game-ch9' &&
          g.title === 'The Harvest Adventure' &&
          g.description.includes('3-minute')
      ) &&
      Array.isArray(parsed.quizzes) &&
      parsed.quizzes.some((q) => q.id === 'nourish-quiz-flappy-space');
    if (!hasFullScript) {
      const upgraded: DatabaseSchema = {
        ...defaults,
        parentSettings: parsed.parentSettings ?? defaults.parentSettings,
        progress: parsed.progress ?? defaults.progress,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(upgraded, null, 2), 'utf-8');
      return upgraded;
    }
    return {
      stories: Array.isArray(parsed.stories) ? parsed.stories : defaults.stories,
      games: Array.isArray(parsed.games) ? parsed.games : defaults.games,
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : defaults.quizzes,
      models: Array.isArray(parsed.models) ? parsed.models : defaults.models,
      parentSettings: parsed.parentSettings ?? defaults.parentSettings,
      progress: parsed.progress ?? defaults.progress,
    };
  } catch {
    const seeded = createDefaultDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
}

function saveDatabase(db: DatabaseSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

let db = loadDatabase();
const activeTokens = new Set<string>();
const zipDownloadTickets = new Map<string, number>();

function extractToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function isAdminAuthenticated(req: express.Request): boolean {
  const token = extractToken(req);
  return Boolean(token && activeTokens.has(token));
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: 'Administrator sign-in required.' });
    return;
  }
  next();
}

const allowedExtensions = new Set([
  '.mp4',
  '.webm',
  '.mov',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.glb',
  '.gltf',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const unique = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${base || 'asset'}_${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(ext)) {
      cb(new Error('Unsupported file type. Allowed: MP4, WebM, MOV, PNG, JPG, WEBP, GLB, GLTF.'));
      return;
    }
    cb(null, true);
  },
});

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '10mb' }));

  // Serve uploaded media safely
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })
  );

  // Public content endpoint (returns published items for kids, or all items when admin token is valid)
  app.get('/api/content', (req, res) => {
    const isAdmin = isAdminAuthenticated(req);
    res.json({
      stories: isAdmin ? db.stories : db.stories.filter((s) => s.published),
      games: isAdmin ? db.games : db.games.filter((g) => g.published),
      quizzes: isAdmin ? db.quizzes : db.quizzes.filter((q) => q.published),
      models: db.models,
      parentSettings: db.parentSettings,
    });
  });

  // Child learning progress (no PII collected)
  app.get('/api/progress', (_req, res) => {
    res.json(db.progress);
  });

  app.post('/api/progress', (req, res) => {
    const body = req.body as Partial<DatabaseSchema['progress']>;
    db.progress = {
      explorerName:
        typeof body.explorerName === 'string' && body.explorerName.trim()
          ? body.explorerName.trim().slice(0, 32)
          : db.progress.explorerName,
      stars: typeof body.stars === 'number' && body.stars >= 0 ? Math.min(body.stars, 9999) : db.progress.stars,
      completedStoryIds: Array.isArray(body.completedStoryIds)
        ? body.completedStoryIds.filter((x): x is string => typeof x === 'string')
        : db.progress.completedStoryIds,
      completedGameIds: Array.isArray(body.completedGameIds)
        ? body.completedGameIds.filter((x): x is string => typeof x === 'string')
        : db.progress.completedGameIds,
      completedQuizIds: Array.isArray(body.completedQuizIds)
        ? body.completedQuizIds.filter((x): x is string => typeof x === 'string')
        : db.progress.completedQuizIds,
      badges: Array.isArray(body.badges)
        ? body.badges.filter((x): x is string => typeof x === 'string')
        : db.progress.badges,
    };
    saveDatabase(db);
    res.json(db.progress);
  });

  app.post('/api/progress/reset', (_req, res) => {
    db.progress = createDefaultDatabase().progress;
    saveDatabase(db);
    res.json(db.progress);
  });

  app.put('/api/parent-settings', (req, res) => {
    const body = req.body as Partial<DatabaseSchema['parentSettings']>;
    db.parentSettings = {
      dailyLimitMinutes:
        typeof body.dailyLimitMinutes === 'number'
          ? Math.max(10, Math.min(180, body.dailyLimitMinutes))
          : db.parentSettings.dailyLimitMinutes,
      defaultCaptionsOn:
        typeof body.defaultCaptionsOn === 'boolean'
          ? body.defaultCaptionsOn
          : db.parentSettings.defaultCaptionsOn,
      readAloudEnabled:
        typeof body.readAloudEnabled === 'boolean'
          ? body.readAloudEnabled
          : db.parentSettings.readAloudEnabled,
      safeExploreOnly:
        typeof body.safeExploreOnly === 'boolean'
          ? body.safeExploreOnly
          : db.parentSettings.safeExploreOnly,
    };
    saveDatabase(db);
    res.json(db.parentSettings);
  });

  // Admin auth
  app.post('/api/admin/login', (req, res) => {
    const { passcode } = req.body as { passcode?: string };
    if (!passcode || passcode !== ADMIN_PASSCODE) {
      res.status(401).json({ error: 'Incorrect administrator passcode.' });
      return;
    }
    const token = crypto.randomBytes(24).toString('hex');
    activeTokens.add(token);
    res.json({ token });
  });

  app.get('/api/admin/session', (req, res) => {
    res.json({ authenticated: isAdminAuthenticated(req) });
  });

  app.post('/api/admin/logout', (req, res) => {
    const token = extractToken(req);
    if (token) activeTokens.delete(token);
    res.json({ ok: true });
  });

  // Secure media upload (video, thumbnail, or .glb/.gltf model)
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed.' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: 'No file attached.' });
        return;
      }
      res.json({
        url: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    });
  });

  // Stories CRUD
  app.post('/api/admin/stories', requireAdmin, (req, res) => {
    const input = req.body as Partial<Story>;
    if (!input.title || !input.description) {
      res.status(400).json({ error: 'Story title and description are required.' });
      return;
    }
    const newStory: Story = {
      id: `nourish-${crypto.randomBytes(4).toString('hex')}`,
      chapterLabel: (input.chapterLabel || 'New Chapter').trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category || 'Space Food',
      ageRange: input.ageRange || 'Ages 6–12',
      durationSeconds: Number(input.durationSeconds) || 30,
      thumbnailUrl: input.thumbnailUrl || '/assets/nourish/img1_1.jpg',
      videoUrl: input.videoUrl || undefined,
      scenes:
        Array.isArray(input.scenes) && input.scenes.length > 0
          ? input.scenes
          : [
              {
                id: 'sc-new-1',
                duration: Number(input.durationSeconds) || 30,
                setting: 'harvest',
                imageUrl: input.thumbnailUrl || '/assets/nourish/img1_1.jpg',
                headline: input.title.trim(),
                narration: input.description.trim(),
                characterSpeaker: 'Maya',
                characterDialogue: 'Welcome to our brand new NOURISH-Mars adventure!',
              },
            ],
      captions:
        Array.isArray(input.captions) && input.captions.length > 0
          ? input.captions
          : [{ start: 0, end: Number(input.durationSeconds) || 30, text: input.description.trim() }],
      relatedGameId: input.relatedGameId || undefined,
      relatedQuizId: input.relatedQuizId || undefined,
      published: input.published ?? true,
      createdAt: new Date().toISOString(),
    };
    db.stories.unshift(newStory);
    saveDatabase(db);
    res.status(201).json(newStory);
  });

  app.put('/api/admin/stories/:id', requireAdmin, (req, res) => {
    const idx = db.stories.findIndex((s) => s.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Story not found.' });
      return;
    }
    const updated = { ...db.stories[idx], ...(req.body as Partial<Story>), id: db.stories[idx].id };
    db.stories[idx] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/admin/stories/:id', requireAdmin, (req, res) => {
    db.stories = db.stories.filter((s) => s.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Games CRUD
  app.post('/api/admin/games', requireAdmin, (req, res) => {
    const input = req.body as Partial<GameItem>;
    if (!input.title || !input.description || !input.type) {
      res.status(400).json({ error: 'Game title, description, and type are required.' });
      return;
    }
    const newGame: GameItem = {
      id: `nourish-game-${crypto.randomBytes(4).toString('hex')}`,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category || 'Space Food',
      type: input.type,
      chapterNumber: typeof input.chapterNumber === 'number' ? input.chapterNumber : undefined,
      chapterGameId: input.chapterGameId,
      thumbnailUrl: input.thumbnailUrl || '/assets/nourish/img1_4.jpg',
      storyId: input.storyId || undefined,
      published: input.published ?? true,
      starReward: Number(input.starReward) || 3,
      pairs: input.pairs,
      dragZones: input.dragZones,
      dragItems: input.dragItems,
      scenarios: input.scenarios,
      createdAt: new Date().toISOString(),
    };
    db.games.unshift(newGame);
    saveDatabase(db);
    res.status(201).json(newGame);
  });

  app.put('/api/admin/games/:id', requireAdmin, (req, res) => {
    const idx = db.games.findIndex((g) => g.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Game not found.' });
      return;
    }
    const updated = { ...db.games[idx], ...(req.body as Partial<GameItem>), id: db.games[idx].id };
    db.games[idx] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/admin/games/:id', requireAdmin, (req, res) => {
    db.games = db.games.filter((g) => g.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Quizzes CRUD
  app.post('/api/admin/quizzes', requireAdmin, (req, res) => {
    const input = req.body as Partial<Quiz>;
    if (!input.title || !Array.isArray(input.questions) || input.questions.length === 0) {
      res.status(400).json({ error: 'Quiz title and at least one question are required.' });
      return;
    }
    const newQuiz: Quiz = {
      id: `nourish-quiz-${crypto.randomBytes(4).toString('hex')}`,
      title: input.title.trim(),
      description: (input.description || 'Answer questions to earn stars!').trim(),
      category: input.category || 'Space Food',
      thumbnailUrl: input.thumbnailUrl || '/assets/nourish/img1_5.jpg',
      storyId: input.storyId || undefined,
      published: input.published ?? true,
      starReward: Number(input.starReward) || 5,
      badgeName: input.badgeName || 'Mars Explorer',
      questions: input.questions,
      createdAt: new Date().toISOString(),
    };
    db.quizzes.unshift(newQuiz);
    saveDatabase(db);
    res.status(201).json(newQuiz);
  });

  app.put('/api/admin/quizzes/:id', requireAdmin, (req, res) => {
    const idx = db.quizzes.findIndex((q) => q.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }
    const updated = { ...db.quizzes[idx], ...(req.body as Partial<Quiz>), id: db.quizzes[idx].id };
    db.quizzes[idx] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/admin/quizzes/:id', requireAdmin, (req, res) => {
    db.quizzes = db.quizzes.filter((q) => q.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  // 3D GLB Models CRUD
  app.post('/api/admin/models', requireAdmin, (req, res) => {
    const input = req.body as Partial<NasaModelItem>;
    if (!input.title || !input.glbUrl) {
      res.status(400).json({ error: 'Model title and GLB/GLTF file URL are required.' });
      return;
    }
    const newModel: NasaModelItem = {
      id: `model-${crypto.randomBytes(4).toString('hex')}`,
      title: input.title.trim(),
      subtitle: (input.subtitle || 'Custom 3D GLB/glTF Model').trim(),
      description: (input.description || 'Interactive 3D educational model uploaded via Admin Dashboard.').trim(),
      type: 'custom_glb',
      glbUrl: input.glbUrl,
      credit: (input.credit || 'Uploaded via NOURISH-Mars Studio').trim(),
      sourceUrl: input.sourceUrl || 'https://science.nasa.gov/3d-resources/',
      funFact: (input.funFact || 'Drag to rotate and scroll to zoom around this 3D model!').trim(),
    };
    db.models.unshift(newModel);
    saveDatabase(db);
    res.status(201).json(newModel);
  });

  app.delete('/api/admin/models/:id', requireAdmin, (req, res) => {
    db.models = db.models.filter((m) => m.id !== req.params.id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.post('/api/admin/export-ticket', requireAdmin, (_req, res) => {
    const now = Date.now();
    for (const [k, exp] of zipDownloadTickets.entries()) {
      if (exp < now) zipDownloadTickets.delete(k);
    }
    const ticket = crypto.randomBytes(20).toString('hex');
    zipDownloadTickets.set(ticket, now + 2 * 60 * 1000);
    res.json({ url: `/api/admin/export-zip?ticket=${ticket}` });
  });

  app.get('/api/admin/export-zip', (req, res) => {
    const ticket = typeof req.query.ticket === 'string' ? req.query.ticket : '';
    const ticketExp = ticket ? zipDownloadTickets.get(ticket) : undefined;
    const hasValidTicket = Boolean(ticketExp && ticketExp >= Date.now());
    if (!isAdminAuthenticated(req) && !hasValidTicket) {
      res.status(401).json({ error: 'Administrator sign-in required.' });
      return;
    }
    try {
      const zipBuf = createProjectZipBuffer(process.cwd());
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="nourish-mars-app.zip"');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Length', String(zipBuf.length));
      res.send(zipBuf);
    } catch {
      res.status(500).json({ error: 'Could not generate project ZIP archive.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use('/src/assets/images', express.static(path.resolve(process.cwd(), 'src/assets/images')));
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`NOURISH-Mars server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
