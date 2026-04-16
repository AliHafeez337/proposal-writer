// Helper function to delete physical file (add to your utils/fileStorage.js)
const fs = require('fs').promises;
const path = require('path');

async function deleteFileFromStorage(filePath) { // Function to delete a file from storage
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(__dirname, '..', 'uploads', path.basename(filePath));

    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('File already deleted or missing from storage:', filePath);
      return; // If file is already gone, consider it success
    }
    console.error('Failed to delete file from storage:', filePath, error);
    throw error;
  }
}

module.exports = { deleteFileFromStorage };