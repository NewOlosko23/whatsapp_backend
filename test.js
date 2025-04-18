import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Test server is working!");
});

app.listen(3000, () => {
  console.log("Test server running on http://localhost:3000");
});
