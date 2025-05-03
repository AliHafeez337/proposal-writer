import React, { useState, useEffect } from 'react';
/**
 * Imports Material-UI (MUI) components used for rendering UI elements in the EditableDeliverablesWithPricing component.
 * These components provide pre-styled React components for creating layout, typography, input fields, dialogs, 
 * and interactive elements with consistent Material Design styling.
 * 
 * @imports
 * - Box: A layout component for flexible container styling
 * - Typography: For rendering text with consistent styling
 * - Divider: A visual separator between elements
 * - List and ListItem: Components for creating structured lists
 * - ListItemText: Text component for list items
 * - Paper: A surface-like container with elevation
 * - TextField: Input field for text and numeric entry
 * - Button: Clickable action element
 * - Dialog, DialogTitle, DialogContent, DialogActions: Components for modal dialogs
 * - IconButton: Clickable icon button
 * - Stack: A layout component for managing vertical or horizontal stacks of elements
 */
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

export default function DeliverablesWithPricing({ id, deliverables, onUpdate }) {
  const [localDeliverables, setLocalDeliverables] = useState(deliverables || []);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  /** 
   * State for a new or edited deliverable with default empty/initial values.
   * Tracks the current deliverable being added or modified in the form.
   * @type {Object} newDeliverable - Contains details of a deliverable item
   * @property {string} item - Name or title of the deliverable
   * @property {string} unit - Unit of measurement for the deliverable
   * @property {number} count - Quantity of the deliverable (defaults to 1)
   * @property {string} description - Detailed description of the deliverable
   * @property {number} unitPrice - Price per unit of the deliverable (defaults to 0)
   */
  const [newDeliverable, setNewDeliverable] = useState({
    item: '',
    unit: '',
    count: 1,
    description: '',
    unitPrice: 0
  });

  // Calculate total whenever deliverables change
  /**
   * Calculates the total price of all deliverables whenever the localDeliverables array changes.
   * Updates the totalPrice state by summing the product of each deliverable's unit price and count.
   * Uses a reduce function to iterate through deliverables, handling cases where unitPrice or count might be undefined.
   * 
   * @effect Updates totalPrice state when localDeliverables changes
   */
  useEffect(() => {
    const total = localDeliverables.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.count || 0), 0);
    setTotalPrice(total);
  }, [localDeliverables]);

  /**
   * Prepares a deliverable for editing by setting the editing state and populating the form.
   * 
   * @param {number} index - The index of the deliverable in the localDeliverables array to be edited
   * @effect Sets editingIndex to the selected index
   * @effect Enables editing mode
   * @effect Populates the newDeliverable state with the selected deliverable's details
   */
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setIsEditing(true);
    setNewDeliverable({
      ...localDeliverables[index],
      unitPrice: localDeliverables[index].unitPrice ?? 0 // Ensure no undefined
    });
  };

  /**
   * Prepares the component for adding a new deliverable by resetting the form and entering edit mode.
   * 
   * @description Clears the editing index, resets the new deliverable to default values, 
   * and sets the component to editing state, enabling the form for a new deliverable entry.
   * 
   * @effect Sets editingIndex to null
   * @effect Resets newDeliverable to initial empty state
   * @effect Enables editing mode for adding a new deliverable
   */
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

  /**
   * Saves a new or edited deliverable to the localDeliverables array.
   * 
   * @description If an existing deliverable is being edited (editingIndex is not null),
   * updates the deliverable at the specified index. If adding a new deliverable,
   * appends the new deliverable to the end of the localDeliverables array.
   * 
   * @effect Updates localDeliverables state with new or modified deliverable
   * @effect Exits editing mode by setting isEditing to false
   */
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

  /**
   * Removes a deliverable from the localDeliverables array at the specified index.
   * 
   * @description Filters out the deliverable at the given index, creating a new array
   * without that specific deliverable and updating the localDeliverables state.
   * 
   * @param {number} index - The index of the deliverable to be deleted
   * 
   * @effect Updates localDeliverables state by removing the specified deliverable
   */
  const handleDeleteDeliverable = (index) => {
    const updated = localDeliverables.filter((_, i) => i !== index);
    setLocalDeliverables(updated);
  };

  /**
   * Saves the pricing for deliverables in a proposal.
   * 
   * @description Handles saving deliverable pricing by first saving the deliverables section,
   * then saving the pricing details with unit prices and quantities. Maps local deliverables
   * to server-side deliverable data, matching by ID or item details.
   * 
   * @effect Updates the proposal's deliverables and pricing on the server
   * @effect Calls onUpdate with the updated data upon successful save
   * @effect Sets isSaving state to track saving progress
   * 
   * @throws {Error} Logs and handles errors during saving process
   */
  const handleSavePricing = () => {
    setIsSaving(true);

    saveSection(id, "deliverables", localDeliverables)
      .then(data => {
          if (data.content?.deliverables) {
            const dataToSave = { items: data.content.deliverables?.map(item => {
              let localDeliverable = localDeliverables.find(d => {
                if (d._id) {
                  return d._id.toString() === item._id.toString();
                } else {
                  return d.item === item.item && d.count === item.count && d.description === item.description && d.unit === item.unit;
                }
              });
              return {
                deliverableId: item._id,
                unitPrice:  localDeliverable?.unitPrice || item.unitPrice || 0,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
        Deliverables & Pricing
        </Typography>
        <Button 
          startIcon={<AddIcon />}
          onClick={handleAddDeliverable}
          variant="outlined"
          size="small"
        >
          Add Deliverable
        </Button>
      </Box>

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
                    <Box component="span" sx={{ display: 'block', mt: 1, fontSize: '0.875rem' }}>
                      Price: ${(item.unitPrice || 0) * (item.count || 1)}
                    </Box>
                  </>
                }
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItem>
            {index < localDeliverables.length - 1 && <Divider component="li" />}
          </Box>
        ))}
      </List>

      <Box sx={{ float: 'right' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle1">
            Total: ${totalPrice}
          </Typography>
          <Button
            variant="contained"
            onClick={handleSavePricing}
            disabled={isSaving || localDeliverables.length === 0 || localDeliverables.some(item => !item.item || !item.unitPrice)}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? 'Saving...' : 'Save'}
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
              value={newDeliverable.unitPrice ?? 0} // Fallback to 0 if undefined
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setNewDeliverable({
                  ...newDeliverable,
                  unitPrice: isNaN(value) ? 0 : value // Ensure it's always a number
                });
              }}
              InputProps={{
                startAdornment: '$',
              }}
              sx={{ width: 200 }}
              inputProps={{
                min: 0,
                step: "0.01" // Allow decimal values
              }}
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