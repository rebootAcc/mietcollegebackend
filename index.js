const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoDbConnect = require("./connection");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const userRouter = require("./routes/userrouter");
const syllabusRouter = require("./routes/syllabusroute");
const resultRouter = require("./routes/resultrouter");
const examScheduleRouter = require("./routes/examschedulerouter");
const studentRouter = require("./routes/studentrouter");
const grievanceRouter = require("./routes/grievancerouter");
const noticeRouter = require("./routes/noticerouter");
const referRouter = require("./routes/referrouter");
require("dotenv").config();
const port = process.env.PORT;
MongoDbConnect();

const tempDir = path.join(__dirname, "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.use(cors());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/temp/" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/users", userRouter);
app.use("/api/syllabuses", syllabusRouter);
app.use("/api/results", resultRouter);
app.use("/api/exam-schedule", examScheduleRouter);
app.use("/api/students", studentRouter);
app.use("/api/grievances", grievanceRouter);
app.use("/api/notices", noticeRouter);
app.use("/api/referral", referRouter);

app.get("/api/", async (req, res) => {
  return res.status(200).send("Hello World! from MIET College Backend");
});

app.listen(port, () => {
  console.log(`Port starts on ${port}`);
});
