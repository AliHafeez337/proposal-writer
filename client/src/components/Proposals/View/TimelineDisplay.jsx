// src/components/Proposals/View/TimelineDisplay.jsx
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

export default function TimelineDisplay({ timeline }) {
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Project Timeline
      </Typography>
      {timeline?.length > 0 ? (
        <List disablePadding>
          {timeline.map((phase, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemText
                primary={phase.phase}
                secondary={
                  <>
                    {phase.tasks?.length > 0 && (
                      <span>Tasks: {phase.tasks.join(', ')}<br /></span>
                    )}
                    {phase.startDate && phase.endDate ? (
                      `${new Date(phase.startDate).toLocaleDateString()} - ${new Date(phase.endDate).toLocaleDateString()}`
                    ) : 'Dates not specified'}
                  </>
                }
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No timeline defined yet
        </Typography>
      )}
    </Paper>
  );
}