import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function ProposalBasicInfo({ data, updateData, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!data.title) newErrors.title = 'Title is required';
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      return setErrors(validationErrors);
    }
    onNext();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <TextField
        fullWidth
        label="Proposal Title"
        value={data.title}
        onChange={(e) => updateData({ title: e.target.value })}
        error={!!errors.title}
        helperText={errors.title}
        sx={{ mb: 3 }}
      />
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Description"
        value={data.description}
        onChange={(e) => updateData({ description: e.target.value })}
        sx={{ mb: 3 }}
      />
    </Box>
  );
}