require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToMongoDB = require("./db");
const bodyParser = require("body-parser");
const path = require("path");

connectToMongoDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploadsdefault", express.static(path.join(process.cwd(), "uploads")));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
  })
);
const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/static/index.html"));
});

app.listen(port, () => {
  console.log(`Great! Happy Hacking with port ${port}`);
});

app.use("/api/checkConnection", require("./adminRoutes/checkConnection"));
app.use("/api/admin", require("./adminRoutes/admin"));
app.use("/api/employee", require("./adminRoutes/employee"));
app.use("/api/investor", require("./adminRoutes/investor"));
app.use("/api/loanProcessor", require("./adminRoutes/loan"));
app.use("/api/loanProcessor/v2", require("./adminRoutes/loanV2"));
app.use("/api/recurring", require("./adminRoutes/recurring"));
app.use("/api/tellyCount/", require("./adminRoutes/Count"));
app.use("/api/image", require("./adminRoutes/upload"));
app.use("/api/adminTxn", require("./adminRoutes/adminTransaction"));
