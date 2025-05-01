// src/components/Proposals/Create/Documents.jsx
import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadProposalFiles, deleteProposalFile } from '../../../services/proposals.js';
import { analyzeProposal, analyzeProposal1 } from '../../../services/ai.js';
import Scope from '../../Proposals/View/Scope.jsx';
import Deliverables from '../../Proposals/View/Deliverables.jsx';


export default function ProposalDocuments({ data, updateData }) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize requirements and feedback from props
  const [requirements, setRequirements] = useState(data.userRequirements || '');
  const [feedback, setFeedback] = useState(data.userFeedback || '');
  
  // Update parent data when requirements change
  useEffect(() => {
    updateData({ ...data, userRequirements: requirements });
  }, [requirements, updateData]);
  
  // Update parent data when feedback change
  useEffect(() => {
    updateData({ ...data, userFeedback: feedback });
  }, [feedback, updateData]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (data.files.length + newFiles.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }
    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = async (fileId) => {
    try {
      await deleteProposalFile(data._id, fileId);
      updateData({
        ...data,
        files: data.files.filter(file => file._id !== fileId)
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      const response = await uploadProposalFiles(data._id, files);
      updateData(response);
      setFiles([]);
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
      const response = await analyzeProposal(data._id, { userRequirements: requirements });
      // Update with any changes from the analysis
      updateData({
        ...response,
        userRequirements: requirements
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReAnalyze = async () => {
    if (!feedback.trim()) {
      alert('Please enter your feedback');
      return;
    }

    try {
      setIsReAnalyzing(true);
      const response = await analyzeProposal1(data._id, { userFeedback: feedback });
      // Update with any changes from the analysis
      updateData({
        ...response,
        userFeedback: feedback
      });
    } catch (error) {
      console.error('ReAnalysis failed:', error);
    } finally {
      setIsReAnalyzing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* File Upload Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Documents ({data.files.length + files.length}/5)
        </Typography>

        {/* Existing Files */}
        {data.files.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Uploaded Files:
            </Typography>
            <List dense>
              {data.files.map((file) => (
                <ListItem
                  key={file._id}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => handleRemoveExistingFile(file._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary={file.originalName} 
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* New Files */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          style={{ display: 'none' }}
          disabled={data.files.length + files.length >= 5}
        />
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current.click()}
          disabled={data.files.length + files.length >= 5}
          sx={{ mb: 2 }}
        >
          Add Files
        </Button>

        {files.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Files to Upload:
            </Typography>
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
                  <ListItemText 
                    primary={file.name} 
                    secondary={`${(file.size / 1024).toFixed(1)} KB`}
                  />
                </ListItem>
              ))}
            </List>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={isUploading}
                startIcon={isUploading ? <CircularProgress size={20} /> : null}
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Requirements Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Requirements
        </Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Describe what you need in detail..."
        />
        {
          requirements && (
            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : null}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Button>
            </Stack>
          )
        }
      </Paper>

      {
        data.content?.scopeOfWork && data.content?.deliverables && (
          <>
            {(isAnalyzing || isReAnalyzing) && <Box display={'flex'} justifyContent={'space-around'}><CircularProgress /></Box>}

            {!(isAnalyzing || isReAnalyzing) && (
              <>
                <Scope
                  scopeOfWork={data.content?.scopeOfWork}
                />
                <Deliverables
                  deliverables={data.content?.deliverables}
                />
              </>
            )}

            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feedback
              </Typography>
              <TextField
                multiline
                rows={6}
                fullWidth
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe what you need in detail..."
              />
              {
                data.content?.scopeOfWork && feedback && (
                  <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleReAnalyze}
                      disabled={isReAnalyzing}
                      startIcon={isReAnalyzing ? <CircularProgress size={20} /> : null}
                    >
                      {isReAnalyzing ? 'Reanalyzing...' : 'Reanalyze'}
                    </Button>
                  </Stack>
                )
              }
            </Paper>
          </>
        )
      }
    </Box>
  );
}