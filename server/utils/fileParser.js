const fs = require('fs').promises;
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const extractText = async (filePath, fileType) => {
  try {
    const buffer = await fs.readFile(filePath);

    switch(fileType) {
      case 'application/pdf':
        const pdfData = await pdf(buffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const { value } = await mammoth.extractRawText({ buffer });
        return value;
      
      case 'text/plain':
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