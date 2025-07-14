const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')
const { Session, User } = require('../models')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'SequelizeValidationError') {
    return response.status(400).send({ error: error?.message })
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    return response.status(400).send({ error: error.errors?.map(err => err.message).join(', ') || 'Unique constraint error' })
  } else if (error.name === 'SequelizeDatabaseError') {
    return response.status(400).send({ error: "Invalid data: " + error.errors?.map(err => err.message).join(', ') || 'Database error' })
  }

  next(error)
}

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const session = await Session.findOne({
        where: { token: authorization.substring(7) }
      })
      if (!session) {
        return res.status(401).json({ error: 'token expired' })
      }
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      const user = await User.findByPk(req.decodedToken.id)
      if (user?.disabled) {
        return res.status(401).json({ error: 'user is disabled'})
      }
    } catch (error){
      return res.status(401).json({ error: 'token invalid' })
    }
  }  else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

module.exports = {
    errorHandler,
    tokenExtractor
}