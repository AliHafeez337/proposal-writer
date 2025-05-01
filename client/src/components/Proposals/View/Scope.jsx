// src/components/Proposals/View/Scope.jsx
import { Box, Typography, Paper } from '@mui/material';

export default function Scope({ scopeOfWork }) {
  return (
    <Box>
      {/* Scope of Work Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Scope of Work
        </Typography>
        {scopeOfWork ? (
          <Typography variant="body1" whiteSpace="pre-line">
            {scopeOfWork}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No scope of work defined yet
          </Typography>
        )}
      </Paper>
    </Box>
  );
}