const jwt = require('jsonwebtoken')
const router = require('express').Router()
const { tokenExtractor } = require('../util/middlewares')
const { User, Session } = require('../models')

router.delete('/', tokenExtractor, async (request, response) => {
    const userId = request.decodedToken.id
    await Session.destroy({
        where: { userId }
    })
    response.status(204).end()
})

module.exports = router