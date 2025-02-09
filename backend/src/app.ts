import express, { Application } from "express";
import cors from "cors";
import { configDotenv } from "dotenv";

// import { suiAuthMiddleware } from "./middlewares/auth.middleware";

const app: Application = express();

configDotenv();

// Middleware
app.use(
    cors({
        origin: "*", // process.env.CS_FE_URL,
        credentials: true,
    }),
);
app.use(express.json());
app.set("trust proxy", "loopback");

// app.use(suiAuthMiddleware);

// API Routes
import moduleRoutes from './routes/module.routes';
app.use("/api", moduleRoutes);

export default app;