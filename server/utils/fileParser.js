const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const extractText = async (filePath, fileType) => { // Function to extract text from different file types
  // Supported file types: PDF, DOCX, TXT
  try {
    // Resolve path if it's not absolute (for existing entries with relative 'uploads/...' path)
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(__dirname, '..', 'uploads', path.basename(filePath));

    let buffer;
    try {
      buffer = await fs.readFile(absolutePath);
    } catch (readError) {
      if (readError.code === 'ENOENT') {
        const error = new Error(`File not found: ${filePath}`);
        error.code = 'FILE_NOT_FOUND';
        throw error;
      }
      throw readError;
    }

    switch(fileType) {
...
      case 'application/pdf': // PDF file type
        const pdfData = await pdf(buffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': // DOCX file type
        const { value } = await mammoth.extractRawText({ buffer });
        return value;
      
      case 'text/plain': // TXT file type
        return buffer.toString();
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    throw new Error(`Failed to parse ${fileType} file`);
  }
};

module.exports = { extractText };