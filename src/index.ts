import "dotenv/config";
import express, { type Request, type Response } from "express";
import triageRoutes from "./routes/triage.routes.js";

const app = express();
const port = process.env.PORT ?? "8000";

app.use(express.json());

app.get("/health", (_req:Request, res:Response) => {
  res.json({ status: "ok" });
});

app.use("/api", triageRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
