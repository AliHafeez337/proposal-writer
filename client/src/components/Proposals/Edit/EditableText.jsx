import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import EditableTextField from '../../common/EditableTextField.jsx';
import { saveSection } from '../../../services/proposals.js';

export default function EditableText({ id, key1, key2, text1, onUpdate }) {
  const [localText, setLocalText] = useState(text1);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    saveSection(id, key1, localText)
      .then(() => {
        setIsEditing(false);
        setIsSaving(false);
        onUpdate(key1, localText);
      })
      .catch((error) => {
        console.error('Error saving text:', error);
        setIsSaving(false);
      });
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box display="flex" justifyContent={'space-between'}>
        <Typography variant="h6" gutterBottom>
          {key2}
        </Typography>
        <Button onClick={() => setIsEditing(!isEditing)} disabled={isEditing}>
          <EditIcon />
        </Button>
      </Box>
      {isEditing ? (
        <EditableTextField
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          label={key2}
          multiline
        />
      ) : (
        <Typography variant="body1" whiteSpace="pre-line">
          {localText}
        </Typography>
      )}
      {isEditing && (
        <Button 
          sx={{ mt: 2, float: 'right' }}
          onClick={handleSave} 
          disabled={isSaving} 
          startIcon={isSaving ? <CircularProgress size={20} /> : null}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      )}
    </Paper>
  );
}