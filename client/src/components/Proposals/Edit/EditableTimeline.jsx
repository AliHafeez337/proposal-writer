// src/components/Proposals/Edit/EditableTimeline.jsx
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Box, Typography, List, ListItem, ListItemText,
  Paper, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Stack,
  Divider, MenuItem, Select, Chip, Grid, InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import { saveSection } from '../../../services/proposals.js';

// Helper function to calculate the total percentage of all milestones except the one being edited (if provided)
const calculateTotalPercentage = (allPhases, currentPhaseIndex = null) => {
  let total = 0;
  
  allPhases.forEach((phase, index) => {
    // Skip the current phase if we're editing it (since we'll calculate its milestones separately)
    if (index !== currentPhaseIndex) {
      phase.milestones?.forEach(milestone => {
        total += milestone.percentage || 0;
      });
    }
  });
  
  return total;
};

export default function EditableTimeline({ id, timeline = [], workBreakdown = [], total = 0, onUpdate }) {
  const [phases, setPhases] = useState(timeline);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState({
    phase: '',
    startDate: dayjs(), // Use dayjs() instead of new Date()
    endDate: dayjs().add(7, 'day'), // Use dayjs().add() instead of Date calculation
    tasks: [],
    milestones: [
      {
        name: 'Initial',
        dueDate: dayjs().add(7, 'day'),
        percentage: 30,
        paymentAmount: 0
      }
    ]
  });

  useEffect(() => {
    setPhases(timeline);
  }, [timeline]);

  // Add a new phase
  const handleAddPhase = () => {
    setEditingIndex(null);
    setCurrentPhase({
      phase: '',
      startDate: dayjs(),
      endDate: dayjs().add(7, 'day'),
      tasks: [],
      milestones: [
        {
          name: 'Initial',
          dueDate: dayjs().add(3, 'day'),
          percentage: 0,
          paymentAmount: 0
        }
      ]
    });
    setIsEditing(true);
  };

  // Remove a phase
  const handleDeletePhase = (index) => {
    const updatedPhases = phases.filter((_, i) => i !== index);
    setPhases(updatedPhases);
    setIsEditing(false);
  };

  // Update a phase
  const handleEditPhase = (index) => {
    setEditingIndex(index);
    const phaseToEdit = phases[index];
    setCurrentPhase({
      ...phaseToEdit,
      startDate: dayjs(phaseToEdit.startDate),
      endDate: dayjs(phaseToEdit.endDate),
      milestones: phaseToEdit.milestones?.map(milestone => ({
        ...milestone,
        dueDate: dayjs(milestone.dueDate)
      })) || [
        {
          name: 'Initial',
          dueDate: dayjs(phaseToEdit.endDate),
          percentage: 100/timeline.length,
          paymentAmount: Number((total * (100/timeline.length)) / 100)
        }
      ]
    });
    setIsEditing(true);
  };

  // Save the phase being edited
  const handleSavePhase = () => {
    const globalTotal = calculateTotalPercentage(phases, editingIndex) +
                       currentPhase.milestones.reduce((sum, m) => sum + m.percentage, 0);
    
    if (globalTotal > 100) {
      alert('Total percentage across all phases cannot exceed 100%');
      return;
    }
  
    const phaseToSave = {
      ...currentPhase,
      startDate: currentPhase.startDate.toDate(),
      endDate: currentPhase.endDate.toDate(),
      milestones: currentPhase.milestones.map(milestone => ({
        ...milestone,
        dueDate: milestone.dueDate.toDate()
      }))
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

  // Milestone handlers
  const handleAddMilestone = () => {
    setCurrentPhase(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          name: `Milestone ${prev.milestones.length + 1}`,
          dueDate: dayjs(prev.endDate),
          percentage: 0,
          paymentAmount: 0
        }
      ]
    }));
  };

  const handleDeleteMilestone = (index) => {
    setCurrentPhase(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleMilestoneChange = (index, field, value) => {
    setCurrentPhase(prev => {
      // Calculate total percentage from all OTHER phases
      const otherPhasesTotalPercentage = calculateTotalPercentage(phases, editingIndex);
      
      // Calculate current phase's total percentage excluding the milestone being edited
      const currentPhaseOtherMilestonesTotal = prev.milestones.reduce(
        (total, milestone, i) => total + (i === index ? 0 : milestone.percentage),
        0
      );
  
      let newValue = field === 'percentage' || field === 'paymentAmount' 
        ? Number(value) 
        : value;

      const updatedMilestones = [...prev.milestones];
      let paymentAmount = updatedMilestones[index]?.paymentAmount || 0;
  
      // If changing percentage, enforce the 100% limit across all phases
      if (field === 'percentage') {
        const maxAllowedPercentage = 100 - (otherPhasesTotalPercentage + currentPhaseOtherMilestonesTotal);
        newValue = Math.min(Math.max(newValue, 0), maxAllowedPercentage);
        
        if (Number(value) > maxAllowedPercentage) {
          console.warn(`Total percentage across all phases cannot exceed 100%. Adjusted to ${newValue}%`);
        }

        paymentAmount = Number(total * (newValue / 100));
      }

      if (paymentAmount) {
        paymentAmount = Math.round(paymentAmount * 100) / 100;
      }
  
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        [field]: newValue,
        paymentAmount
      };
  
      return { ...prev, milestones: updatedMilestones };
    });
  };

  // Save this section.
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

  // Available tasks for the dropdown
  const availableTasks = workBreakdown.map((task, index) => ({
    id: index,
    name: task.task
  }));

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
                    <>
                      <Typography 
                        component="span" 
                        variant="body2" 
                        display="block" 
                        sx={{ mt: 1 }}
                      >
                        {phase.startDate && phase.endDate ? (
                          `${new Date(phase.startDate).toLocaleDateString()} - ${new Date(phase.endDate).toLocaleDateString()}`
                        ) : 'Dates not specified'}
                      </Typography>
                      
                      {phase.tasks?.length > 0 && (
                        <Typography 
                          component="span" 
                          variant="body2" 
                          display="block" 
                          sx={{ mt: 1 }}
                        >
                          <Typography component="span" variant="caption">Tasks:</Typography>
                          <Box 
                            component="span" 
                            display="block"
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}
                          >
                            {phase.tasks.map((taskIndex, i) => (
                              <Chip
                                key={i}
                                label={workBreakdown[taskIndex]?.task || `Task ${taskIndex + 1}`}
                                size="small"
                              />
                            ))}
                          </Box>
                        </Typography>
                      )}

                      {phase.milestones?.length > 0 && (
                        <>
                          <Typography 
                            variant="caption" 
                            component="span" 
                            display="block" 
                            sx={{ mt: 1 }}
                          >
                            Milestones:
                          </Typography>
                          <Box 
                            component="span" 
                            display="block" 
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}
                          >
                            {phase.milestones.map((milestone, i) => (
                              <Chip 
                                key={i}
                                label={`${milestone.name} (${milestone.percentage}%)`}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </>
                  }
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                  secondaryTypographyProps={{ component: 'div' }}
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
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {editingIndex !== null ? 'Edit Phase' : 'Add New Phase'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Phase Name"
              value={currentPhase.phase}
              onChange={(e) => setCurrentPhase({...currentPhase, phase: e.target.value})}
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={currentPhase.startDate}
                onChange={(newValue) => setCurrentPhase({...currentPhase, startDate: newValue})}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={currentPhase.endDate}
                onChange={(newValue) => setCurrentPhase({...currentPhase, endDate: newValue})}
                minDate={currentPhase.startDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            <Select
              multiple
              value={currentPhase.tasks}
              onChange={(e) => setCurrentPhase({...currentPhase, tasks: e.target.value})}
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

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Milestones</Typography>

                <Typography variant="body2">
                  Global Total: {calculateTotalPercentage(phases)}%
                  {calculateTotalPercentage(phases) === 100 && (
                    <Typography component="span" color="success.main" sx={{ ml: 1 }}>
                      (Complete)
                    </Typography>
                  )}
                </Typography>

                <Button 
                  startIcon={<AddIcon />} 
                  onClick={handleAddMilestone}
                  size="small"
                >
                  Add Milestone
                </Button>
              </Box>

              {currentPhase.milestones?.map((milestone, index) => (
                <Box key={index} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Milestone Name"
                        value={milestone.name}
                        onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <DatePicker
                        label="Due Date"
                        value={milestone.dueDate}
                        onChange={(newValue) => handleMilestoneChange(index, 'dueDate', newValue)}
                        minDate={currentPhase.startDate}
                        maxDate={currentPhase.endDate}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField
                        label="Percentage"
                        type="number"
                        value={milestone.percentage}
                        onChange={(e) => handleMilestoneChange(index, 'percentage', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { min: 0, max: 100 }
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <TextField
                        label="Payment Amount"
                        type="number"
                        value={milestone.paymentAmount}
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid sx={{ display: 'flex', alignItems: 'center' }} size={{ xs: 12, sm: 1 }}>
                      <IconButton 
                        onClick={() => handleDeleteMilestone(index)}
                        color="error"
                        disabled={currentPhase.milestones.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button
            onClick={handleSavePhase}
            variant="contained"
            disabled={!currentPhase.phase || !currentPhase.milestones?.length}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}