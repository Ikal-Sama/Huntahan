import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import {connectDB} from './lib/db.js'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import mediaRoutes from './routes/media.route.js'
import { app, server } from './lib/socket.js'

dotenv.config()
const PORT  = process.env.PORT

const __dirname = path.resolve();

// app.use(express.json());

app.use(express.json({ limit: "50mb" })); // Allow up to 10MB JSON body
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

// app.use(cors()); // Allow all origins

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))


app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/media", mediaRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../client/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
    })
}

server.listen(PORT, () => {
    console.log("Server is running on PORT:"+ PORT);
    connectDB()
})