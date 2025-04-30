// src/components/Proposals/Create/Documents.jsx
import { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';

export default function ProposalDocuments({ data, updateData, id }) {
  const [files, setFiles] = useState([]);
  const [requirements, setRequirements] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (files.length + newFiles.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }
    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      setIsUploading(true);
      await api.post(`/proposals/${id}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFiles([]); // Clear files after successful upload
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!requirements.trim()) {
      alert('Please enter your requirements');
      return;
    }

    try {
      setIsAnalyzing(true);
      await api.post(`/proposals/${id}/process`, {
        requirements
      });
      onNext(); // Move to next step after successful analysis
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* File Upload Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Upload Documents (Max 5)
        </Typography>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          style={{ display: 'none' }}
        />
        <Button
          variant="contained"
          onClick={() => fileInputRef.current.click()}
          sx={{ mb: 2 }}
        >
          Select Files
        </Button>

        {files.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <List dense>
              {files.map((file, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={isUploading}
              startIcon={isUploading ? <CircularProgress size={20} /> : null}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Requirements Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Enter Your Requirements
        </Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Describe what you need in detail..."
        />
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          startIcon={isAnalyzing ? <CircularProgress size={20} /> : null}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </Box>
    </Box>
  );
}