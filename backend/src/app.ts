import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js"


const app= express();
app.use(cookieParser());

const allowed = (process.env.FRONTEND_URLS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(cors({
  origin(origin, callback) {
   
    if (!origin) return callback(null, true);

    if (allowed.includes(origin)) return callback(null, true);

    callback(new Error(`CORS blocked: ${origin}`));
  },
   credentials: true,
}));

app.use(helmet());
app.use(morgan("dev"));

app.use(express.json({ limit: "100kb" }));


app.get("/", (req, res) =>{
    res.send("Server running...");
});

app.use("/api",routes)

export default app;