declare global {
  var _CONFIG: TopLevelConfig;
}
import "reflect-metadata";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import validator from "express-validator";
import serveStatic from "serve-static";
import path from "path";

import router from "./api/index";
import { TopLevelConfig } from "./config/types/config";
import initConfig from "./config";
import helmet from "helmet";
import { InitService } from "./services/init.service";

import { setupSwagger } from "./docs/swagger";

const app = express();
// Allow all origins and all methods for CORS, including preflight
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Accept",
      "Content-Type",
      "access-control-allow-origin",
      "x-api-applicationid",
      "authorization",
    ],
    credentials: true,
  })
);

// Explicitly handle preflight requests for all routes
app.options("*", cors());

app.use(helmet()); // Secure HTTP headers
app.use(helmet.hidePoweredBy()); // Disable X-Powered-By header

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Middleware
app.use(validator());
app.use("/_resources", serveStatic(path.join(__dirname, "..", "_resources")));
// Set cross-origin header so frontend on a different port can load uploaded images
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}, serveStatic(path.join(__dirname, "..", "public", "uploads")));

// Setup Swagger for API documentation
setupSwagger(app);

// API routes
router(app);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({ message: err.message });
});

import { initWebSockets } from "./socket";

// Initiate the server
const initApp = async () => {
  try {
    let _CONFIG: TopLevelConfig = await initConfig();
    global._CONFIG = _CONFIG;

    // Initialize system with default institute and user
    await InitService.initializeSystem();

    const server = app.listen(_CONFIG._VALS.PORT, () => {
      console.log(
        JSON.stringify({
          status: "success",
          message: `Server is running on port ${_CONFIG._VALS.PORT}`,
        })
      );
    });

    // Initialize WebSockets
    initWebSockets(server);

  } catch (err) {
    console.error("Failed to load configuration and start the server:", err);
    process.exit(1);
  }
};

initApp();

export default app;
