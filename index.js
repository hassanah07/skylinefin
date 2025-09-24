require("dotenv").config();
const express = require("express");
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
const cors = require("cors");
const connectToMongoDB = require("./db");
const bodyParser = require("body-parser");
const path = require("path");

connectToMongoDB();

const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
  })
);
const port = process.env.PORT;

// var corsOptions = {
//   origin: [
//     "https://www.guidewale.com",
//     "https://guidewale.com",
//     "https://admin.guidewale.com",
//     "http://localhost:3000",
//   ],
//   optionsSuccessStatus: 200, // For legacy browser support
// };

// app.use(cors(corsOptions));
app.use(cors());

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "/static/index.html"));
// });

app.listen(port, () => {
  console.log("Great! Happy Hacking");
});
// Rouote for My Blog
// app.options("/api/blogpost/write", (req, res) => {
//   res.header("Access-Control-Allow-Origin", "https://guidewale.com");
//   res.header("Access-Control-Allow-Methods", "POST");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   res.status(200).send();
// });
app.use("/api/admin", require("./routes/admin"));
// app.use("/api/blogpost", require("./routes/blogdata"));
// app.use("/api/contact", require("./routes/contact"));
// app.use("/api/admin", require("./routes/admin"));
// app.use("/api/student", require("./routes/student"));
// app.use("/api/mentor", require("./routes/mentor"));
// app.use("/api/storekeeper", require("./routes/storekeeper"));
