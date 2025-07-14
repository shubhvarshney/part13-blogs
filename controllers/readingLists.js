const jwt = require('jsonwebtoken')
const { tokenExtractor } = require('../util/middlewares')
const router = require('express').Router()
const { UserBlogs } = require('../models')

router.post('/', tokenExtractor, async (request, response, next) => {
    const { blogId, userId } = request.body
    if (!blogId || !userId) {
        return response.status(400).json({ error: 'blogId and userId are required' })
    }

    if (request.decodedToken.id !== userId) {
        return response.status(403).json({ error: 'You can only add to your own reading list' })
    }

    try {
        const userBlogs = await UserBlogs.create({
            blogId,
            userId
        })
        return response.status(201).json(userBlogs)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', tokenExtractor,async (request, response, next) => {
    const { read } = request.body
    const { id } = request.params
    try {
        const userBlog = await UserBlogs.findByPk(id)
        if (request.decodedToken.id !== userBlog.userId) {
            return response.status(403).json({ error: 'You can only update your own reading list' })
        }
        if (!userBlog) {
            return response.status(404).json({ error: 'UserBlog not found' })
        }
        userBlog.read = read
        await userBlog.save()
        return response.json(userBlog)
    } catch (error) {
        next(error)
    }
})

module.exports = router