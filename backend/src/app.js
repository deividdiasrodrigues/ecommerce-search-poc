require("dotenv").config();
const express = require("express");
const cors = require("cors");
const searchRoutes = require("./routes/search");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes
app.use("/", searchRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
