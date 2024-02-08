const express = require('express');
const router = express.Router();

/*------------------------------------------------------------------- signOut ------------------------------------------------------*/

router.get('/api/users/signout', (req, res) => {
    req.headers.authorization = null;
  
    res.send({});
  });
  
  module.exports = router;