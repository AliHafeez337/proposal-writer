import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Divider, List, ListItem, 
  ListItemText, Paper, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import { saveSection } from '../../../services/proposals.js';
import { savePricing } from '../../../services/pricing.js';

export default function DeliverablesWithPricing({ id, deliverables, onUpdate, errors }) {
  const [localDeliverables, setLocalDeliverables] = useState(deliverables || []);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState({
    item: '',
    unit: '',
    count: 1,
    description: '',
    unitPrice: 0
  });

  // Calculate total whenever deliverables change
  useEffect(() => {
    const total = localDeliverables.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.count || 0), 0);
    setTotalPrice(total);
  }, [localDeliverables]);

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
    setNewDeliverable(localDeliverables[index]);
  };

  const handleAddDeliverable = () => {
    setEditingIndex(null);
    setNewDeliverable({
      item: '',
      unit: '',
      count: 1,
      description: '',
      unitPrice: 0
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      // Update existing deliverable
      const updated = [...localDeliverables];
      updated[editingIndex] = newDeliverable;
      setLocalDeliverables(updated);
    } else {
      // Add new deliverable
      setLocalDeliverables([...localDeliverables, newDeliverable]);
    }
    setIsEditing(false);
  };

  const handleDeleteDeliverable = (index) => {
    const updated = localDeliverables.filter((_, i) => i !== index);
    setLocalDeliverables(updated);
  };

  const handleSavePricing = () => {
    setIsSaving(true);

    saveSection(id, "deliverables", localDeliverables)
      .then(data => {
          if (data.content?.deliverables) {
            const dataToSave = { items: data.content.deliverables?.map(item => {
              let unitPrice = item.unitPrice;
              if (!unitPrice) {
                let localDeliverable = localDeliverables.find(d => {
                  if (d._id) {
                    return d._id.toString() === item._id.toString();
                  } else {
                    return d.item === item.item && d.count === item.count && d.description === item.description && d.unit === item.unit;
                  }
                });
                unitPrice = localDeliverable?.unitPrice || 0;
              }
              return {
                deliverableId: item._id,
                unitPrice: unitPrice,
                quantity: item.count
              };
            }) };
        
            savePricing(id, dataToSave)
              .then(data => {
                setIsSaving(false);
                onUpdate(data);
              })
              .catch(error => {
                console.error('Error saving pricing:', error);
                setIsSaving(false);
              });
          }
        })
        .catch(error => {
          console.error('Error saving pricing:', error);
          setIsSaving(false);
        });
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Deliverables & Pricing
      </Typography>

      <List disablePadding>
        {localDeliverables.map((item, index) => (
          <Box key={index}>
            <ListItem alignItems="flex-start" secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => handleEditClick(index)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteDeliverable(index)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            }>
              <ListItemText
                primary={`${item.item} (${item.count} ${item.unit})`}
                secondary={
                  <>
                    {item.description}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Price: ${(item.unitPrice || 0) * (item.count || 1)}
                    </Typography>
                  </>
                }
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItem>
            {index < localDeliverables.length - 1 && <Divider component="li" />}
          </Box>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          startIcon={<AddIcon />}
          onClick={handleAddDeliverable}
          variant="outlined"
        >
          Add Deliverable
        </Button>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle1">
            Total: ${totalPrice}
          </Typography>
          <Button
            variant="contained"
            onClick={handleSavePricing}
            disabled={isSaving || localDeliverables.length === 0 || localDeliverables.some(item => !item.item || !item.unit || !item.unitPrice)}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
        </Stack>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingIndex !== null ? 'Edit Deliverable' : 'Add New Deliverable'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Item Name"
              value={newDeliverable.item}
              onChange={(e) => setNewDeliverable({...newDeliverable, item: e.target.value})}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Unit"
                value={newDeliverable.unit}
                onChange={(e) => setNewDeliverable({...newDeliverable, unit: e.target.value})}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Count"
                type="number"
                value={newDeliverable.count}
                onChange={(e) => setNewDeliverable({...newDeliverable, count: parseInt(e.target.value) || 0})}
                sx={{ width: 100 }}
                inputProps={{ min: 1 }}
              />
            </Stack>
            <TextField
              label="Description"
              value={newDeliverable.description}
              onChange={(e) => setNewDeliverable({...newDeliverable, description: e.target.value})}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Unit Price"
              type="number"
              value={newDeliverable.unitPrice}
              onChange={(e) => setNewDeliverable({...newDeliverable, unitPrice: parseFloat(e.target.value) || 0})}
              InputProps={{
                startAdornment: '$',
              }}
              sx={{ width: 200 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!newDeliverable.item}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}