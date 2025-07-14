const router = require('express').Router()
const { Op } = require('sequelize')
const { User, Blog, UserBlogs } = require('../models')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId']}
    }
  })
  res.json(users)
})

router.get('/:id', async (req, res, next) => {
  try {
    const where = {}
    if (req.query.read) {
      if (req.query.read === 'true') {
        where.read = true
      } else if (req.query.read === 'false') {
        where.read = false
      } else {
        return res.status(400).json({ error: 'Invalid read query parameter' })
      }
    }

    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Blog,
          as: 'blogs',
          attributes: { exclude: ['userId'] }
        },
        {
          model: Blog,
          as: 'readings',
          attributes: { exclude: ['userId'] },
          through: {
            attributes: ['id', 'read'],
            where
          }
        }
      ],
    })
    if (user) {
      res.json(user)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
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