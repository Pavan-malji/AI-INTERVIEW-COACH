import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import interviewRoutes from './routes/interview.js'
import authRoutes from './routes/auth.js'

dotenv.config()

const app = express()
//Middlewares
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/interview', interviewRoutes)

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` })
})
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
})

//DB connection server start only if mongoconnected
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.log('MongoDB connection failed:', err.message)
    process.exit(1) // stops the server if DB fails
  })
