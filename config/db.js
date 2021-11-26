const mongoose = require('mongoose')

const connectDB = async ()=>{

    try{
             console.log(process.env.DATA_URI)
             const conn = await mongoose.connect(process.env.DATA_URI , {
                 useUnifiedTopology: true,
                 useNewUrlParser : true,
                 useCreateIndex : true
             })

             console.log(`MongoDB connected: ${conn.connection.host}`)
         }
         catch (error) {
             console.error(`Error : ${error.message}`)
             //exit with failure
             process.exit(1)
         }
}

module.exports = connectDB  