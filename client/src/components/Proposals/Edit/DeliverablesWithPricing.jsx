// src/components/Proposals/View/DeliverablesWithPricing.jsx
import React, { useState } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText, Paper, TextField, Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { savePricing } from '../../../services/pricing.js';

export default function DeliverablesWithPricing({ id, deliverables, onPricingChange, errors }) {
  const [localDeliverables, setLocalDeliverables] = useState(deliverables);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handlePriceChange = (index, value) => {
    const updated = [...localDeliverables];
    updated[index].unitPrice = Number(value);
    setLocalDeliverables(updated);
    // Update total price
    const total = updated.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.count || 0), 0);
    setTotalPrice(total);
    // onPricingChange(updated);
  };

  const handleSavePricing = () => {
    setIsSaving(true);
    const dataToSave = { "items": [] };
    localDeliverables.forEach(item => {
      if (item.unitPrice) {
        dataToSave.items.push({
          "deliverableId": item._id,
          "unitPrice": item.unitPrice,
        });
      }
    });

    savePricing(id, dataToSave)
      .then(() => {
        setIsSaving(false);
        onPricingChange(localDeliverables);
      })
      .catch(error => {
        console.error('Error saving pricing:', error);
        setIsSaving(false);
      });
  };

  const isDisabled = localDeliverables.some(item => item.unitPrice === undefined || item.unitPrice === '');

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Deliverables & Pricing
      </Typography>
      {localDeliverables?.length > 0 ? (
        <List disablePadding>
          {localDeliverables.map((item, index) => (
            <Box key={index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`${item.item} (${item.count} ${item.unit})`}
                  secondary={item.description}
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Unit Price"
                  type="number"
                  size="small"
                  value={item.unitPrice || ''}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  sx={{ width: 120 }}
                  InputProps={{
                    startAdornment: '$',
                  }}
                  error={errors.pricing && item.unitPrice === undefined}
                />
              </ListItem>
              {index < localDeliverables.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No deliverables defined yet
        </Typography>
      )}

      <List disablePadding>
        <ListItem alignItems="flex-start">
          <Box sx={{ flex: 1 }}></Box>
          <TextField
            label="Total Price"
            type="number"
            size="small"
            value={totalPrice || ''}
            disabled
            sx={{ width: 120 }}
            InputProps={{
              startAdornment: '$',
            }}
            error={errors.pricing}
          />
        </ListItem>
        <ListItem alignItems="flex-start">
          <Box sx={{ flex: 1 }}></Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleSavePricing}
            disabled={isDisabled}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? 'Saving...' : 'Save Pricing'}
          </Button>
        </ListItem>
      </List>
    </Paper>
  );
}