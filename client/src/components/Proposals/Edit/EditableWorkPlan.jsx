// src/components/Proposals/Edit/EditableWorkPlan.jsx
import { useState } from 'react';
import {
  Box, Typography, Divider, List, ListItem,
  ListItemText, Paper, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Stack, Chip, MenuItem, Select
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import { saveSection } from '../../../services/proposals.js';

export default function EditableWorkPlan({ id, workBreakdown = [], onUpdate }) {
  const [tasks, setTasks] = useState(workBreakdown);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    task: '',
    duration: 1,
    dependencies: []
  });

  const handleAddTask = () => {
    setEditingIndex(null);
    setCurrentTask({
      task: '',
      duration: 1,
      dependencies: []
    });
    setIsEditing(true);
  };

  const handleEditTask = (index) => {
    setEditingIndex(index);
    setCurrentTask(tasks[index]);
    setIsEditing(true);
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    setIsEditing(false);
  };

  const handleSaveTask = () => {
    let updatedTasks;
    if (editingIndex !== null) {
      // Update existing task
      updatedTasks = [...tasks];
      updatedTasks[editingIndex] = currentTask;
    } else {
      // Add new task
      updatedTasks = [...tasks, currentTask];
    }
    setTasks(updatedTasks);
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    saveSection(id, "workBreakdown", tasks)
    .then(data => {
        setIsSaving(false);
        onUpdate(data);
      })
      .catch(error => {
        console.error('Error saving work breakdown:', error);
        setIsSaving(false);
      });
  };

  const availableDependencies = tasks
    .filter((_, i) => i !== editingIndex)
    .map((task, i) => ({ id: i, name: task.task }));

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Work Breakdown
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddTask}
          variant="outlined"
          size="small"
        >
          Add Task
        </Button>
      </Box>

      {tasks.length > 0 ? (
        <List disablePadding>
          {tasks.map((task, index) => (
            <Box key={index}>
              <ListItem alignItems="flex-start" secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => handleEditTask(index)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTask(index)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }>
                <ListItemText
                  primary={`${task.task} (${task.duration} days)`}
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    task.dependencies?.length > 0 ? (
                      <div>
                        <Typography variant="caption" component="div">
                          Depends on:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {task.dependencies.map((depIndex, i) => (
                            <Chip 
                              key={i}
                              label={tasks[depIndex]?.task || `Task ${depIndex + 1}`}
                              size="small"
                            />
                          ))}
                        </Box>
                      </div>
                    ) : (
                      <div>No dependencies</div>
                    )
                  }
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
              {index < tasks.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No tasks defined yet
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
          {editingIndex !== null ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Task Name"
              value={currentTask.task}
              onChange={(e) => setCurrentTask({...currentTask, task: e.target.value})}
              fullWidth
            />
            <TextField
              label="Duration (days)"
              type="number"
              value={currentTask.duration}
              onChange={(e) => setCurrentTask({
                ...currentTask,
                duration: Math.max(1, parseInt(e.target.value) || 1)
              })}
              sx={{ width: 120 }}
              inputProps={{ min: 1 }}
            />
            <Select
              multiple
              value={currentTask.dependencies}
              onChange={(e) => setCurrentTask({
                ...currentTask,
                dependencies: e.target.value
              })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={tasks[value]?.task || `Task ${value + 1}`} 
                      size="small" 
                    />
                  ))}
                </Box>
              )}
              sx={{ mt: 1 }}
            >
              {availableDependencies.map((task) => (
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
            onClick={handleSaveTask}
            variant="contained"
            disabled={!currentTask.task}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}