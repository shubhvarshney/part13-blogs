const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')
const { Op } = require('sequelize')
const { tokenExtractor } = require('../util/middlewares')

const blogFinder = async (req, res, next) => {
  try {
    req.blog = await Blog.findByPk(req.params.id)
    next()
  } catch (error) {
    next(error)
  }
}

router.get('/', async (req, res, next) => {
  try {
    const where = {}
    if (req.query.search) {
      where = {
        [Op.or]: [
          { 
            title: { 
              [Op.iLike]: `%${req.query.search}%` 
            }
          },
          {
            author: {
              [Op.iLike]: `%${req.query.search}%`
            }
          }
        ]
      }
    }

    const blogs = await Blog.findAll({
      attributes: { exclude: ['userId'] },
      include: {
        model: User,
        attributes: ['name', 'username']
      },
      where,
      order: [['likes', 'DESC']]
    })
    res.json(blogs)
  } catch (error) {
    console.log(error)
  }
})

router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const { author, url, title, year } = req.body
    
    // Check if required fields are provided
    if (!url || !title || !year) {
      return res.status(400).json({ error: 'url, title, and year are required' })
    }
    
    // Check if token was properly decoded
    if (!req.decodedToken || !req.decodedToken.id) {
      return res.status(401).json({ error: 'invalid or missing token' })
    }
    
    const user = await User.findByPk(req.decodedToken.id)
    if (!user) {
      return res.status(401).json({ error: 'user not found' })
    }
    
    const blog = await Blog.create({ author, url, title, year, userId: user.id })
    res.status(201).json(blog)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', blogFinder, tokenExtractor, async (req, res, next) => {
  try {
    const blog = req.blog
    if (blog) {
      const user = await User.findByPk(req.decodedToken.id)
      if (blog.userId === user.id) {
        await blog.destroy()
        res.status(204).end()
      } else {
        res.status(403).json({ error: 'Unauthorized' })
      }
    } else {
         res.status(404).end()
     }
  } catch (error) {
    next(error)
  }
})

router.put('/:id', blogFinder, async (req, res, next) => {
  const { likes } = req.body
  const blog = req.blog
  if (blog) {
    blog.likes = likes
    try {
      await blog.save()
      res.json(blog)
    } catch (error) {
      next(error)
    }
  } else {
    res.status(404).end()
  }
})

module.exports = router