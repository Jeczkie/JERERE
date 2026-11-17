const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1>Hello from Railway!</h1><p>Deployed by Jerecho Marquez</p>");
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));