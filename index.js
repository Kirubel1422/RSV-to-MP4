require("dotenv").config();
const express = require("express");

const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();
const upload = multer({ dest: "public/uploads/" });

app.get("/", (req, res) => {
  res.sendFile(path.resolve("static", "index.html"));
});

app.post("/convert", upload.single("file"), (req, res) => {
  const file_path = req.file.path;
  const output_file_path = path.resolve(
    "public",
    "uploads",
    `${Date.now() + req.file.filename}.mp4`
  );

  console.log(file_path, output_file_path);
  ffmpeg(file_path)
    .outputOptions("-err_detect", "ignore_err")
    .output(output_file_path)
    .on("end", () => {
      res.download(output_file_path, (err) => {
        if (err) {
          console.error(err);
        }
        fs.unlinkSync(file_path);
        fs.unlinkSync(output_file_path);
      });
    })
    .on("error", (err) => {
      console.error(err);
      res.status(500).send("Conversion failed");
      fs.unlinkSync(file_path);
    })
    .run();
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
