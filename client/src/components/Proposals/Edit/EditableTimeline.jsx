// src/components/Proposals/Edit/EditableTimeline.jsx
import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Box, Typography, List, ListItem, ListItemText,
  Paper, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Stack,
  Divider, MenuItem, Select, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import { saveSection } from '../../../services/proposals.js';

export default function EditableTimeline({ id, timeline = [], workBreakdown = [], onUpdate }) {
  const [phases, setPhases] = useState(timeline);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState({
    phase: '',
    startDate: dayjs(), // Use dayjs() instead of new Date()
    endDate: dayjs().add(7, 'day'), // Use dayjs().add() instead of Date calculation
    tasks: []
  });


  // In handleAddPhase
  const handleAddPhase = () => {
    setEditingIndex(null);
    setCurrentPhase({
      phase: '',
      startDate: dayjs(),
      endDate: dayjs().add(7, 'day'),
      tasks: []
    });
    setIsEditing(true);
  };

  // In handleEditPhase
  const handleEditPhase = (index) => {
    setEditingIndex(index);
    const phaseToEdit = phases[index];
    setCurrentPhase({
      ...phaseToEdit,
      startDate: dayjs(phaseToEdit.startDate), // Convert Date to dayjs
      endDate: dayjs(phaseToEdit.endDate) // Convert Date to dayjs
    });
    setIsEditing(true);
  };

  // In handleSavePhase (if you need to convert back to Date for saving)
  const handleSavePhase = () => {
    const phaseToSave = {
      ...currentPhase,
      startDate: currentPhase.startDate.toDate(), // Convert dayjs to Date if needed
      endDate: currentPhase.endDate.toDate() // Convert dayjs to Date if needed
    };

    let updatedPhases;
    if (editingIndex !== null) {
      updatedPhases = [...phases];
      updatedPhases[editingIndex] = phaseToSave;
    } else {
      updatedPhases = [...phases, phaseToSave];
    }
    setPhases(updatedPhases);
    setIsEditing(false);
  };


  const handleDeletePhase = (index) => {
    const updatedPhases = phases.filter((_, i) => i !== index);
    setPhases(updatedPhases);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    saveSection(id, "timeline", phases)
      .then(data => {
        setIsSaving(false);
        onUpdate(data);
      })
      .catch(error => {
        console.error('Error saving timeline:', error);
        setIsSaving(false);
      });
  };

  const availableTasks = workBreakdown.map((task, index) => ({
    id: index,
    name: task.task
  }));

  console.log('currentPhase', currentPhase);

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Project Timeline
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddPhase}
          variant="outlined"
          size="small"
        >
          Add Phase
        </Button>
      </Box>

      {phases.length > 0 ? (
        <List disablePadding>
          {phases.map((phase, index) => (
            <Box key={index}>
              <ListItem 
                alignItems="flex-start" 
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => handleEditPhase(index)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePhase(index)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={phase.phase}
                  secondary={
                    <Box component="span">
                      {phase.tasks?.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography component="span" variant="caption">Tasks:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {phase.tasks.map((taskIndex, i) => (
                              <Chip
                                key={i}
                                label={workBreakdown[taskIndex]?.task || `Task ${taskIndex + 1}`}
                                size="small"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      <Box component="span" sx={{ mt: 1, display: 'block' }}>
                        {phase.startDate && phase.endDate ? (
                          `${new Date(phase.startDate).toLocaleDateString()} - ${new Date(phase.endDate).toLocaleDateString()}`
                        ) : 'Dates not specified'}
                      </Box>
                    </Box>
                  }
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
              {index < phases.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No timeline defined yet
        </Typography>
      )}

      <Box sx={{ float: 'right' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingIndex !== null ? 'Edit Phase' : 'Add New Phase'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Phase Name"
              value={currentPhase.phase}
              onChange={(e) => setCurrentPhase({...currentPhase, phase: e.target.value})}
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={currentPhase.startDate} // This should already be a dayjs object
                onChange={(newValue) => setCurrentPhase({...currentPhase, startDate: newValue})}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={currentPhase.endDate} // This should already be a dayjs object
                onChange={(newValue) => setCurrentPhase({...currentPhase, endDate: newValue})}
                minDate={currentPhase.startDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            <Select
              multiple
              value={currentPhase.tasks}
              onChange={(e) => setCurrentPhase({
                ...currentPhase,
                tasks: e.target.value
              })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={workBreakdown[value]?.task || `Task ${value + 1}`}
                      size="small"
                    />
                  ))}
                </Box>
              )}
              sx={{ mt: 1 }}
            >
              {availableTasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button
            onClick={handleSavePhase}
            variant="contained"
            disabled={!currentPhase.phase}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}