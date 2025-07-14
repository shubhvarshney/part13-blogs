const router = require('express').Router()
const { Blog } = require('../models')
const { fn, col } = require('sequelize');

router.get('/', async (req, res, next) => {
  try {
      const authors = await Blog.findAll({ 
        group: 'author', 
        attributes: [
            'author',
            [fn('COUNT', col('id')), 'articles'],
            [fn('SUM', col('likes')), 'likes']
        ],
        order: [['likes', 'DESC']]
      })
      res.json(authors)
  } catch (error) {
    next(error)
  }
})

module.exports = router