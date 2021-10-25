const app = require('./app')
const connectDB = require('./config/db')

connectDB()
const PORT = 3000
app.listen(PORT, () => {
    console.log(` app is running on ${PORT} server`)
})