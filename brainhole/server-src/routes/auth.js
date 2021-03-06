import passport from 'passport'
import express from 'express'
import __ from '../models/models'
let router = express.Router()
import sessions from '../api/sessions'
import globals from '../globals'

router.post('/register/', async (req, res) => {
  let User = globals.Models.User
  let {username, password} = req.body
  let exist = await User.findOne({username})
  if (exist) {
    return res.status(401).send(`User ${username} exists!`)
  } else {
    try {
      let account = await User.register(
        new User({
          username,
          active: true
        }),
        password,
      )
      passport.authenticate('local')(req, res, function () {
        res.redirect('/')
      })
    } catch (err) {
      console.error(err)
      return res.status(401).send(`Register failed with username: ${username}!`)
    }
  }
})

router.post('/login/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) { return res.status(401).send('Invalid username or password.') }
    if (!user.active) { return res.status(401).send('Not active user') }
    // console.log(`${user} login successfully!`)
    req.login(user, function (error) {
      if (err) { return next(err) }
      // console.log(`${user} go home!`)
      return res.status(200).send()
    })
  })(req, res, next)
})

router.get('/logout/', function (req, res) {
  req.logout()
  res.redirect('/')
})

router.get('/ws/', function(req, res, next) {
  if (req.user) {
    sessions[req.user.username] = {
      sid: req.cookies['connect.sid'],
      timestamp: new Date()
    }
    return res.status(200).send({
      username: req.user.username,
      sid: req.cookies['connect.sid'],
    })
  } else {
    return res.status(401).send({
      ok: false,
      message: 'not login'
    })
  }
})

export default router
