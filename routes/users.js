var express = require('express');
var router = express.Router();
const fs = require('fs')
const path = require('path')
const models = require('../models')
const jsonwebtoken = require('jsonwebtoken')

const publicKey = fs.readFileSync(path.join(__dirname, '..', 'keys/jwtRS256.key.pub'))

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

const checkAutentication = (req, res, next) => {
  if (!req.header('authorization')) {
    res.status(403).send('Unauthorized')
    return
  }

  jsonwebtoken.verify(req.headers.authorization, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      res.status(403).send(('Unauthorized'))
    } else if (!decoded.email) {
      res.status(403).send(('Unauthorized'))
    } else {
      req.token = decoded
      next()
    }
  })
}

router.get('/my-profile', checkAutentication, async (req, res) => {
  try {
    console.log(req.token)
    const user = await models.User.findByPk(req.token.email)
    if (!user) {
      throw new Error('User not found!')
    }
    res.send(user)
  } catch (error) {
    res.status(501).send(error.message);
  }
})

module.exports = router;
