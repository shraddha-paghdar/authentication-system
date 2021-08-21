const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')

const saltRounds = 10
const models = require('../models')
const { v4: uuid } = require('uuid')

const privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys/jwtRS256.key'))

const jsonwebtoken = require('jsonwebtoken')


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Authentication App' });
});


/* API to create new account */
router.post('/create_account', async (req, res) => {
  try {
    const user = await models.User.findByPk(req.body.email)
    if (user) {
      throw new Error('User already exists!. Please login instead')
    }
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)

    let newUser = await models.User.create({
      email: req.body.email.trim().toLowerCase(),
      uuid: uuid(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hashedPassword,
      countryCode: req.body.countryCode,
      phoneNumber: req.body.phoneNumber,
      isVerified: false,
    })

    if (newUser) {
      newUser = newUser.get({
        plain: true,
      })
      delete newUser.password
    }

    res.send(newUser)
  } catch (err) {
    res.status(501).send(err.message)
  }
})

/**
 * Login and provide a basic user profile
 * along with a signed JWT token
 */
router.post('/login', (req, res) => {
  if (!req.body.email) {
    res.status(401).send('Email not found')
    return
  }

  req.body.email = req.body.email.toLowerCase().trim()

  if (req.body.email.length > 256) {
    res.status(401).send('Invalid Email')
    return
  }

  if (!req.body.password) {
    res.status(401).send('Password too short')
    return
  }

  return models.User.unscoped().findByPk(req.body.email).then((user) => {
    if (!user) {
      throw new Error('Enter Correct Username or Password.')
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw new Error('Enter Correct Username or Password.')
    }

    const loggedInUser = user.get({
      plain: true,
    })
    const jwt = {
      email: user.email,
    }

    delete loggedInUser.password

    const token = jsonwebtoken.sign(jwt, privateKey, {
      expiresIn: '7d',
      algorithm: 'RS256',
    })
    loggedInUser.token = token
    res.status(200).send(loggedInUser)
  }).catch((err) => {
    console.error(err)
    res.status(401).send(err.message)
  })
})

/* Sync the database */
router.get('/syncDb', (req, res) => {
  return models.sequelize.authenticate()
    .then(() => {
      return models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    })
    .then(() => {
      return models.sequelize.sync({
        force: true,
      })
    })
    .then(() => {
      models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
      res.send('Database sync complete')
    }).catch(err => {
      console.log(err);
    })
})


module.exports = router;
