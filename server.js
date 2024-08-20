import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import rolePermissionRoutes from './routes/rolePermissionRoutes.js'
import brandRoutes from './routes/brandRoutes.js'
import unitRoutes from './routes/unitRoutes.js'
import productRoutes from './routes/productRoutes.js'
// import connectToDatabase from './config/db.js'

// dot env config
dotenv.config()
// connectToDatabase()

// rest object 
const app = express()

//middlewares 
app.use(morgan("dev"))
app.use(express.json())
app.use(cors())


// ROutes...
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/role', rolePermissionRoutes)
app.use('/api/v1/brand', brandRoutes)
app.use('/api/v1/unit', unitRoutes)
app.use('/api/v1/product', productRoutes)

// Handle 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// port 
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})