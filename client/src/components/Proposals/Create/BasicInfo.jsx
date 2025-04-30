import { TextField, Box } from '@mui/material';

export default function ProposalBasicInfo({ data, updateData, errors }) {
  const handleChange = (field) => (e) => {
    updateData(prev => ({
      ...prev,
      [field]: e.target.value || '' // Ensure empty string instead of undefined
    }));
  };

  return (
    <Box>
      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={data.title}
        onChange={handleChange('title')}
        error={errors.title}
        helperText={errors.title && "Title is required"}
        required
      />
      <TextField
        label="Description"
        multiline
        rows={4}
        fullWidth
        margin="normal"
        value={data.description}
        onChange={handleChange('description')}
        error={errors.description}
        helperText={errors.description && "Description is required"}
        required
      />
    </Box>
  );
}