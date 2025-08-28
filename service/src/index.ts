import express, { Request, Response, NextFunction } from "express";
import authRoutes from "./routes/auth";
import { connectDB } from "./database";
import { authenticateToken, validateLogin } from "./middleware";
import { login } from "./controllers/authController";
import { getData } from "./controllers/dataController";
import { createTask, deleteTask, getTasks } from "./controllers/taskController";

const app = express();
(async () => {
  try {
    console.log("🔌 Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connected failed", error);
    process.exit(1);
  }
})();

app.get("/", (req, res) => {
  console.log(`${req.method} ${req.originalUrl}`);

  res.send(` Hello ${req.method} ${req.originalUrl}`);
});

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.post("/login", validateLogin, login);
app.get("/data", authenticateToken, getData);

app.post("/secure/tasks", authenticateToken, createTask);
app.get("/secure/tasks", authenticateToken, getTasks);
app.delete("/secure/tasks/:taskId", authenticateToken, deleteTask); 

app.listen(5000, () => {
  console.log("Backend service listening on port 5000");
});

app.use("/auth", authRoutes);