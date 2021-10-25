var jwt = require('jsonwebtoken');

const genrateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET , {
        expiresIn : process.env.JWT_EXPIRE
    })
}

module.exports = genrateToken