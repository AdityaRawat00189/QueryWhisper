import "dotenv/config";
import express from "express";
import cors from "cors";
import session from 'express-session';
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

// Configs & Middlewares
import connectDB from "./config/dbConnection.js";
import requireAuth from "./middlewares/auth.middleware.js";

// Routes
import authRoute from './routes/auth.route.js';
import saveDBRoute from './routes/saveCredentials.route.js'
import executeRoute from './routes/executeQuery.route.js'
import databaseRoute from './routes/database.route.js'

const PORT = process.env.PORT || 5000;
const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- Redis Setup ---
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.connect().catch(console.error);
redisClient.on('connect', () => console.log('✅ Connected to Redis Store successfully'));
redisClient.on('error', (err) => console.log('❌ Redis Client Error', err));

// --- Session Middleware ---
app.use(session({
    store: new RedisStore({ 
        client: redisClient,
        prefix: "querywhisperSession:"
    }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// --- Routing ---
app.get("/v0/health", requireAuth, (req, res) => {
    return res.status(200).json({ message: "Server is Healthy" });
});

app.use('/v0/api/auth', authRoute);
app.use('/v0/api/saveCredentials',requireAuth, saveDBRoute);
app.use("/v0/api/execute-query", requireAuth,executeRoute);
app.use("/v0/api/database", requireAuth, databaseRoute);

// --- Initialization ---
const server = app.listen(PORT, async () => {
    await connectDB();
    console.log(`✅ Server is running on port ${PORT}`);
});

server.requestTimeout = 300000;
server.setTimeout(300000);