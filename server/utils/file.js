// Helper function to delete physical file (add to your utils/fileStorage.js)
const fs = require('fs').promises;

async function deleteFileFromStorage(filePath) { // Function to delete a file from storage
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete file from storage:', filePath, error);
    throw error;
  }
}

module.exports = { deleteFileFromStorage };