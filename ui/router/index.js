const express = require('express');
const csurf = require('csurf');

const router = express.Router();

// Console to CLI.
router.all('/*', (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Measures to CSRF.(https://www.shadan-kun.com/blog/measure/2640/)
// This app doesn't hold cookie to prevent CSRF.
router.use(csurf({
  cookie: false,
}));

// Storing token setting.
router.use((req, res, next) => {
  const locals = res.locals;
  locals.csrfToken = req.csrfToken();
  return next();
});

router.get('/csrf-token', (req, res) => {
  res.json({ token: res.locals.csrfToken });
});

router.use(express.static('public'));

// Render login page.
router.use('/login', (req, res, next) => {
  res.render('login');
});

router.get('/logout', (req, res, next) => {
  if (!req.session.user) {
    // When use isn't logged in.
    res.redirect('/login');
    return;
  }
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect('/login');
  });
});

const urlsRoutedLoginPage = /^\/(login(\/.*)?|logout)$/;

const apisAccessibleWithoutLogin = /^\/api\/login$/;

// Routing /login/*
router.get(urlsRoutedLoginPage, (req, res) => {
  res.render('login');
});

router.use((req, res, next) => {
  if (apisAccessibleWithoutLogin.test(req.url)) {
    next();
    return;
  }
  const { session } = req;
  //   Check authenticaton
  const authenticated = session && session.authenticated;
  if (authenticated) {
    next();
    return;
  }
  if (req.method !== 'GET' || /\/api\/.*/.test(req.url)) {
    next({ status: 401 });
    return;
  }
  res.redirect('/login');
});

// Static file route
router.use(express.static('public_authenticated'));

// API route
router.use('/api', require('./api'));

// Route after logout
router.get('/*', (req, res) => {
  res.header('Content-Type', 'text/html');
  res.render('app');
});

module.exports = router;