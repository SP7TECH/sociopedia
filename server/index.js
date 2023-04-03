import { MongoClient } from "mongodb";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// IMPORTING ROUTES

import { register } from "./controllers/auth.js";
import authRoutes from "./routes/auth.js";

// CONFIG

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// FILE STORAGE - info from github repo of multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// ROUTES WITH FILES

app.post("/api/auth/register", upload.single("picture"), register);

// ROUTES WITH FILES

app.use("/api/auth", authRoutes);

export let client;

async function main() {
  const PORT = process.env.PORT || 5001;
  const uri = process.env.MONGO_URL;

  client = new MongoClient(uri);

  try {
    await client.connect().then(() => {
      console.log("Connected to DB");
      app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
    });
  } catch (error) {
    console.error(error);
  }
}

main().catch(console.error);
