const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Ensure this is at the top of your file
const stream = require("stream"); // Added
const SCOPE = ["https://www.googleapis.com/auth/drive.file"];

const parentid = "1HSSXSrnydq2KBRjUixEdOiFg55m0uVJZ";
// Authenticate with Google Drive
async function authorize() {
  // Load environment variables directly using process.env
  const client_email = process.env.CLIENT_EMAIL;
  const private_key = process.env.PRIVATE_KEY.replace(/\\n/gm, "\n"); // Correctly format the private key

  const jwtClient = new google.auth.JWT(client_email, null, private_key, SCOPE);

  try {
    const tokens = await jwtClient.authorize();
    if (tokens.access_token === null) {
      console.log(
        "Provided service account does not have permission to generate access tokens"
      );
    } else {
      console.log("Successfully authorized");
    }
  } catch (error) {
    console.log("Error making request to generate access token:", error);
  }

  return jwtClient;
}

// To run the authorize function and check for errors or tokens
authorize()
  .then((jwtClient) => {
    console.log("Authorization successful, JWT client ready for use");
  })
  .catch((error) => {
    console.error("Failed to authorize", error);
  });

// Upload a file to Google Drive and return the file ID
async function uploadFile(file) {
  const authClient = await authorize();
  const drive = google.drive({ version: "v3", auth: authClient });
  console.log(file);
  const fileMetadata = {
    name: file.originalname, // Use original file name
    parents: [parentid], // Update your folder ID here
  };

  const media = {
    mimeType: "application/pdf", // Make sure this matches your file type
    body: new stream.PassThrough().end(file.buffer), // Modified
  };

  console.log(fileMetadata, media);
  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    return file.data.id;
  } catch (error) {
    console.error("Error during file upload:", error);
    throw new Error("File upload failed.");
  }
}

// Make a file publicly readable and return its public URL
async function retrieveShareableLink(fileId) {
  const authClient = await authorize();
  const drive = google.drive({ version: "v3", auth: authClient });

  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  const result = await drive.files.get({
    fileId: fileId,
    fields: "webViewLink, webContentLink",
  });

  console.log(result.data.webViewLink);

  return result.data.webViewLink; // Or webContentLink depending on your needs
}

module.exports = { uploadFile, retrieveShareableLink };
