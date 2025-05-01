// src/components/common/EditableTextField.jsx
import { TextField } from '@mui/material';

export default function EditableTextField({ 
  value, 
  onChange, 
  label, 
  multiline = false, 
  rows = 4,
  fullWidth = true
}) {
  return (
    <TextField
      // label={label}
      value={value || ''}
      onChange={onChange}
      multiline={multiline}
      rows={rows}
      fullWidth={fullWidth}
      variant="outlined"
      sx={{ mt: 1 }}
    />
  );
}