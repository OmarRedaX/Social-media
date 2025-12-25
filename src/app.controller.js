import path from 'node:path';
import connectDB from './DB/connection.js';
import authController from './modules/auth/auth.controller.js';
import userController from './modules/user/user.controller.js';
import postController from './modules/post/post.controller.js';
import { globalErrorHangling } from './utils/response/error.response.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet'
 
 const limiter = rateLimit({
    limit: 10,
    windowMs: 2*60*1000,
    message:{Error:"Rate limit reached"},
    legacyHeaders:true,
    standardHeaders:'draft-8'
 })

  const postLimiter = rateLimit({
    limit: 8,
    windowMs: 2*60*1000
 })


 const bootstrap = (app , express) => {
    
    // let whitelist = process.env.WHITELIST.split(",") || []
//     let corsOptions = {
//         origin: function (origin, callback) {
//             if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }

//     app.use(cors(corsOptions)); // Enable CORS for all routes

    // access local to global or global to local
    // app.use(async (req, res, next)=> {
    //     if(!whitelist.includes(req.header('origin'))){
    //         return next(new Error('Not Allowed By Cors', {satatus: 403}))
    //     }    
    //     await res.header('Access-control-Allow-Origin', req.header('origin'));
    //     await res.header('Acess-control-Allow-Headers','*')
    //     await res.header('Acess-control-Allow-Private-Network','true')
    //     await res.header('Acess-control-Allow-Methods','*')
    //     console.log("Origin Work");
    //     next();

    // })

    app.use(cors())

    app.use(helmet())

    app.use('/auth',limiter)
    app.use('/post',postLimiter)
    
    app.use('/uploads', express.static(path.resolve('./src/uploads'))); // Serve static files from uploads directory

    app.use(express.json()) // convert buffer data to json

    // Application routes
    app.get('/', (req, res) => res.send('Hello World!'))

    // SUB-ROUTES
    app.use('/auth', authController);
    app.use('/user', userController);
    app.use('/post', postController);

    // 404 Route Handler 
    app.all('/*splat', (req,res,next)=>{
        return res.status(404).json({message : "page not found"})
    })

    // Global Error Handling Middleware
    app.use(globalErrorHangling);

    // DB Connection
    connectDB();
}

export default bootstrap;