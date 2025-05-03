// src/components/Proposals/Edit/EditableRequirements.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { saveSection } from '../../../services/proposals.js';

export default function EditableRequirements({ id, requirements = [], onUpdate }) {
  const [localRequirements, setLocalRequirements] = useState(requirements);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRequirement, setCurrentRequirement] = useState('');

  useEffect(() => {
    setLocalRequirements(requirements);
  }, [requirements]);

  const handleAddRequirement = () => {
    setEditingIndex(null);
    setCurrentRequirement('');
    setIsEditing(true);
  };

  const handleEditRequirement = (index) => {
    setEditingIndex(index);
    setCurrentRequirement(localRequirements[index]);
    setIsEditing(true);
  };

  const handleDeleteRequirement = (index) => {
    const updated = localRequirements.filter((_, i) => i !== index);
    setLocalRequirements(updated);
    handleSave(updated);
  };

  const handleSaveRequirement = () => {
    let updatedRequirements;
    if (editingIndex !== null) {
      updatedRequirements = [...localRequirements];
      updatedRequirements[editingIndex] = currentRequirement;
    } else {
      updatedRequirements = [...localRequirements, currentRequirement];
    }
    setLocalRequirements(updatedRequirements);
    setIsEditing(false);
    handleSave(updatedRequirements);
  };

  // Save this section
  const handleSave = (updatedRequirements) => {
    saveSection(id, "requirements", updatedRequirements)
      .then(data => onUpdate(data))
      .catch(error => console.error('Error saving requirements:', error));
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Requirements
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddRequirement}
          variant="outlined"
          size="small"
        >
          Add Requirement
        </Button>
      </Box>

      {localRequirements?.length > 0 ? (
        <List disablePadding>
          {localRequirements.map((requirement, index) => (
            <Box key={index}>
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => handleEditRequirement(index)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteRequirement(index)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={requirement}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
              {index < localRequirements.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No requirements defined yet
        </Typography>
      )}

      {/* Edit Dialog */}
      {isEditing && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <TextField
            label="Requirement"
            value={currentRequirement}
            onChange={(e) => setCurrentRequirement(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button
              onClick={handleSaveRequirement}
              variant="contained"
              disabled={!currentRequirement.trim()}
            >
              Save
            </Button>
          </Box>
        </Paper>
      )}
    </Paper>
  );
}