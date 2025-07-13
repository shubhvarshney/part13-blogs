const router = require('express').Router()
const { User, Blog } = require('../models')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId']}
    }
  })
  res.json(users)
})

router.post('/', async (req, res, next) => {
  const { username, name } = req.body
  try {
    const user = await User.create({ username, name })
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
})

router.put('/:username', async (req, res, next) => {
  const { username } = req.body
  const user = await User.findOne({ where: { username: req.params.username } })
  if (user) {
    user.username = username
    try {
      await user.save()
      res.json(user)
    } catch (error) {
      next(error)
    }
  } else {
    res.status(404).end()
  }
})

module.exports = router