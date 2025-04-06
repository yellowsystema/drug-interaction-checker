require('dotenv').config(); // Load environment variables from .env
const fs = require('fs'); // File system module

// Get the path to the service account JSON file from the environment variable
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS is not set in the environment variables.');
    process.exit(1);
}

// Read and print the JSON file
try {
    const credentials = fs.readFileSync(credentialsPath, 'utf8'); // Read the file
    console.log('Service Account JSON File Contents:', JSON.parse(credentials)); // Parse and print the JSON
} catch (error) {
    console.error('Error reading the service account JSON file:', error.message);
}