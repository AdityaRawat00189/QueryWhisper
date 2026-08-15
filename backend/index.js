import "dotenv/config";
import express from "express";
import session from 'express-session';
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

// Configs & Middlewares
import connectDB from "./config/dbConnection.js";
import requireAuth from "./middlewares/auth.middleware.js";

// Routes
import authRoute from './routes/auth.route.js';

const PORT = process.env.PORT || 5000;
const app = express();

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
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

// --- Routing ---
app.get("/v0/health", requireAuth, (req, res) => {
    return res.status(200).json({ message: "Server is Healthy" });
});

app.use('/v0/api/auth', authRoute);

// --- Initialization ---
app.listen(PORT, async () => {
    await connectDB();
    console.log(`✅ Server is running on port ${PORT}`);
});