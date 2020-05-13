const router = require('express').Router();
const axios = require('axios');

router.route('/').post((req, res, next) => {
  const { id, password } = req.body;
  //   When id or password is empty
  if (!id || !password) {
    res.status(401).json({ message: 'failed' });
    return;
  }

  // Generate url
  const url = 'localhost:8080/login';

  axios.post(url, { id, password }).then(({ body }) => {
    if (!body.user) {
      res.status(401).json({ message: 'failed' });
      return;
    }
    req.session.regenerate((error) => {
      if (error) {
        next(error);
        return;
      }
      const { session } = req;
      const { user } = body;
      session.user = user;
      res.json({ user });
    });
  }).catch(next);
});

module.exports = router;