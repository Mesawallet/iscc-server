//
// IMPORTS
// PS: Why are doing "require" instead of "import"?
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const base64 = require("base64-js");
const axios = require("axios");
const upload = multer({ storage: multer.memoryStorage() });

const ISCC_API_URL = "https://iscc.io/api/v1/iscc";

//
// Create an express app instance
const app = express();

//
// Enable CORS for all routes (for development)
app.use(
  cors({
    origin: ["https://mesa-six.vercel.app", "http://localhost:3003"],
  })
);

//
// Upload file to ISCC, get a response
app.post("/iscc", upload.single("file"), (req, res) => {
  //
  // Get the file data from memory buffer
  const file = req.file;
  const fileData = file.buffer;

  console.log(fileData);
  //
  // Encode the file name in base64
  const encodedFileName = base64.fromByteArray(Buffer.from(file.originalname));
  //
  // Set the request headers defined in the ISCC API docs
  const headers = {
    "X-Upload-Filename": encodedFileName,
    "Content-Type": "application/octet-stream",
  };
  //
  // Make the API request
  axios
    .post(ISCC_API_URL, fileData, { headers })
    .then((response) => {
      //
      // Check the response status code
      if (response.status === 201) {
        //
        // File uploaded successfully
        console.log("File uploaded successfully.");
        console.log("Response:", response.data);
        res.json({
          success: true,
          message: "File uploaded successfully.",
          data: response.data,
        });
      } else {
        //
        // An error occurred while uploading the file
        console.error("An error occurred while uploading the file.");
        console.error("Response:", response.data);
        res.json({
          success: false,
          message: "An error occurred while uploading the file.",
          data: response.data,
        });
      }
    })
    .catch((error) => {
      //
      // An error occurred while making the request
      console.error(
        "An error occurred while making the request:",
        error.message
      );
      res.json({
        success: false,
        message: "An error occurred while making the request.",
        error: error.message,
      });
    });

  //
  // Example usage (curl, LOL)
  // curl -X POST -F "file=@IMG_4704.JPG" http://localhost:8000/iscc
  // or fetch('http://localhost:8000/iscc', { method: 'POST', body: new FormData().append('file', fileInput.files[0]) }).then((response) => response.json()).then((data) => console.log('Response:', data)).catch((error) => console.error('An error occurred:', error));
});

//
// Start the server :)
app.listen(8001, () => {
  console.log("Server is listening on port 8001");
});
