
const currentUser = require('salahorg/middlewares/current-user');
const express = require('express');
const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
    console.log({ currentUser: req.currentUser || null });
    res.send({ currentUser: req.currentUser || null });
  });
  

  module.exports = router;