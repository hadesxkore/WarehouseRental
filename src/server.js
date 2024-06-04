const admin = require('firebase-admin');
const express = require('express');
const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

// Function to list all users
const listAllUsers = async (nextPageToken) => {
  let users = [];
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    users = users.concat(result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  return users;
};

// Endpoint to fetch user data
app.get('/api/users', async (req, res) => {
  try {
    const users = await listAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
