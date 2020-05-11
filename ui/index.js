const http = require('http');
const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');

const app = express();

// X-Powerds-By header is HTTP header to script own name, versions and so on.
app.disable('x-powered-by');

// Start server.
const server = http.Server(app);
const port = 8080;
server.listen(port);

// Session and cookie settings.(https://github.com/expressjs/session#readme)
const sessionStore = new expressSession.MemoryStore();
const session = expressSession({
  store: sessionStore,
  secret: 'testapp',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: false,
  cookie: {
    secure: false,
    httpOnly: true,
    rolling: true,
    maxAge: 3600000,
  },
});
app.use(session);

// Template settings.
app.set('views', 'views/pages');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb',
}));

// Load route file. No route error handling is defined in this file?? 
app.use('/', require('./router'));

app.use((req, res) => {
  res.status(404);
  res.render('error', {
    param: {
      status: 404,
      url: req.url,
      message: 'not found',
    },
  });
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403);
    res.json(err);
    return;
  }
  if (req.method !== 'GET' || /\/api\/.*/.test(req.url)) {
    res.status(500 || err.status);
    res.json(err);
    return;
  }
  res.render('error');
});

module.exports = app;