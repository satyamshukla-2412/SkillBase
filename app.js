const fs = require('fs');
const path = require('path');
const http = require('http');

// Pre-load all files at startup so Vercel's AST tracer bundles them into the lambda
// and all requests are served directly from memory with 100% uptime and 0ms latency.
const STATIC_FILES = {
  '/index.html': { content: fs.readFileSync(path.join(__dirname, 'index.html')), type: 'text/html; charset=utf-8' },
  '/login.html': { content: fs.readFileSync(path.join(__dirname, 'login.html')), type: 'text/html; charset=utf-8' },
  '/register.html': { content: fs.readFileSync(path.join(__dirname, 'register.html')), type: 'text/html; charset=utf-8' },
  '/provider.html': { content: fs.readFileSync(path.join(__dirname, 'provider.html')), type: 'text/html; charset=utf-8' },
  '/seeker.html': { content: fs.readFileSync(path.join(__dirname, 'seeker.html')), type: 'text/html; charset=utf-8' },
  '/matches.html': { content: fs.readFileSync(path.join(__dirname, 'matches.html')), type: 'text/html; charset=utf-8' },
  '/profile.html': { content: fs.readFileSync(path.join(__dirname, 'profile.html')), type: 'text/html; charset=utf-8' },
  '/css/style.css': { content: fs.readFileSync(path.join(__dirname, 'css', 'style.css')), type: 'text/css; charset=utf-8' },
  '/style.css': { content: fs.readFileSync(path.join(__dirname, 'style.css')), type: 'text/css; charset=utf-8' },
  '/js/storage.js': { content: fs.readFileSync(path.join(__dirname, 'js', 'storage.js')), type: 'application/javascript; charset=utf-8' },
  '/js/auth.js': { content: fs.readFileSync(path.join(__dirname, 'js', 'auth.js')), type: 'application/javascript; charset=utf-8' },
  '/js/main.js': { content: fs.readFileSync(path.join(__dirname, 'js', 'main.js')), type: 'application/javascript; charset=utf-8' },
  '/js/matches.js': { content: fs.readFileSync(path.join(__dirname, 'js', 'matches.js')), type: 'application/javascript; charset=utf-8' },
  '/js/provider.js': { content: fs.readFileSync(path.join(__dirname, 'js', 'provider.js')), type: 'application/javascript; charset=utf-8' },
  '/js/seeker.js': { content: fs.readFileSync(path.join(__dirname, 'js', 'seeker.js')), type: 'application/javascript; charset=utf-8' },
  '/documentation.html': { content: fs.readFileSync(path.join(__dirname, 'documentation.html')), type: 'text/html; charset=utf-8' },
  '/SkillBase_Project_Documentation.pdf': { content: fs.readFileSync(path.join(__dirname, 'SkillBase_Project_Documentation.pdf')), type: 'application/pdf' }
};

// Clean URL aliases
STATIC_FILES['/'] = STATIC_FILES['/index.html'];
STATIC_FILES['/login'] = STATIC_FILES['/login.html'];
STATIC_FILES['/register'] = STATIC_FILES['/register.html'];
STATIC_FILES['/provider'] = STATIC_FILES['/provider.html'];
STATIC_FILES['/seeker'] = STATIC_FILES['/seeker.html'];
STATIC_FILES['/matches'] = STATIC_FILES['/matches.html'];
STATIC_FILES['/profile'] = STATIC_FILES['/profile.html'];
STATIC_FILES['/documentation'] = STATIC_FILES['/documentation.html'];
STATIC_FILES['/doc'] = STATIC_FILES['/documentation.html'];
STATIC_FILES['/pdf'] = STATIC_FILES['/SkillBase_Project_Documentation.pdf'];

function handler(req, res) {
  let reqPath = (req.url || '/').split('?')[0];
  if (!reqPath.startsWith('/')) reqPath = '/' + reqPath;

  // Direct lookup in preloaded in-memory table
  let entry = STATIC_FILES[reqPath];
  if (!entry && STATIC_FILES[reqPath + '.html']) {
    entry = STATIC_FILES[reqPath + '.html'];
  }

  if (entry) {
    res.writeHead(200, {
      'Content-Type': entry.type,
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(entry.content);
    return;
  }

  // Fallback to filesystem
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json'
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found: ' + reqPath);
  }
}

module.exports = handler;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  http.createServer(handler).listen(PORT, () => {
    console.log(`SkillBase server running at http://localhost:${PORT}`);
  });
}
