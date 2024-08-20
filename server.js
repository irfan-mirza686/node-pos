import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import rolePermissionRoutes from './routes/rolePermissionRoutes.js'
import brandRoutes from './routes/brandRoutes.js'
import unitRoutes from './routes/unitRoutes.js'
import productRoutes from './routes/productRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import saleRoutes from './routes/saleRoutes.js'
import cloudinary from 'cloudinary'

// dot env config
dotenv.config()

//cloudinary Config
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

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
app.use('/api/v1/customer', customerRoutes)
app.use('/api/v1/sale', saleRoutes)

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
    console.log(`Server running on PORT ${PORT} on ${process.env.NODE_ENV} Mode`)
})