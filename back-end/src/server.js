import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "@/config/swagger";
import { API_v1 } from "@/routes/index";
import connectDB from "@/config/mongoose";
import { app, server } from "@/lib/socket";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";
import { postService } from "@/services/postService";

require("dotenv").config();

let dbInitPromise = null;

connectDB()

// const ensureDbConnected = async () => {
//   if (!dbInitPromise) {
//     dbInitPromise = connectDB().catch((error) => {
//       dbInitPromise = null;
//       throw error;
//     });
//   }

//   await dbInitPromise;
// };

// Cors
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dev.d2k0kt672erqlu.amplifyapp.com",
    ],
    credentials: true,
  }),
);

// Cookie Parser
app.use(cookieParser());
// Body parser
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpec));
app.get("/api-docs/", swaggerUi.setup(swaggerSpec));

// Provide raw swagger JSON for UI (relative path will resolve with stage)
app.get(["/swagger/swagger.json", "/swagger.json"], (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Serve a minimal Swagger UI HTML that loads assets from CDN (avoids API Gateway MIME/404 issues)
app.get(["/swagger/ui", "/swagger/ui/", "/swagger"], (req, res) => {
  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    <title>VietDurian API Docs</title>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
    <script>
      const specUrl = './swagger.json';
      window.ui = SwaggerUIBundle({
        url: specUrl,
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'BaseLayout'
      });
    </script>
  </body>
  </html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

// Api V1 Routes
app.use("/api/v1", API_v1);

// Background jobs
postService.startPostExpiryJob();

app.get("/", (req, res) => {
  res.send("Welcome to VietDurian API!");
});

// Error responses
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 400;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
  });
});

// (server started in start())
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});
const baseHandler = serverless(app);

module.exports.handler = async (event, context) => {
  await ensureDbConnected();
  return baseHandler(event, context);
};
