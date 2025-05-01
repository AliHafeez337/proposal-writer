// src/components/Proposals/WorkPlanDisplay.jsx
import { Box, Typography, Divider, List, ListItem, ListItemText, Paper } from '@mui/material';

export default function WorkPlanDisplay({ workBreakdown }) {
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Work Breakdown
      </Typography>
      {workBreakdown?.length > 0 ? (
        <List disablePadding>
          {workBreakdown.map((task, index) => (
            <Box key={index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`${task.task} (${task.duration} days)`}
                  secondary={
                    task.dependencies?.length > 0 
                      ? `Depends on: ${task.dependencies.join(', ')}` 
                      : 'No dependencies'
                  }
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
              {index < workBreakdown.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No work breakdown defined yet
        </Typography>
      )}
    </Paper>
  );
}