import { Paper, Typography, List, ListItem, ListItemText, Divider, Box, Chip } from '@mui/material';

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
};

const ProposalTimeline = ({ timeline, workBreakdown = [] }) => (
  <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
    <Typography variant="h6" gutterBottom>
      Project Timeline
    </Typography>
    {timeline?.length > 0 ? (
      <List disablePadding>
        {timeline.map((phase, index) => (
          <Box key={index}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={phase.phase || 'Unnamed Phase'}
                primaryTypographyProps={{ fontWeight: 'medium' }}
                secondary={
                  <Box component="div">
                    <Typography 
                      variant="body2" 
                      component="span" 
                      display="block" 
                      sx={{ mt: 1 }}
                    >
                      {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                    </Typography>
                    {phase.tasks?.length > 0 && (
                      <Box component="div">
                        <Typography 
                          variant="caption" 
                          component="span" 
                          display="block" 
                          sx={{ mt: 1 }}
                        >
                          Tasks in this phase:
                        </Typography>
                        <Box 
                          component="span" 
                          display="block" 
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}
                        >
                          {phase.tasks.map((taskIdx, i) => (
                            <Chip 
                              key={i}
                              label={workBreakdown[+taskIdx]?.task || `Task ${+taskIdx + 1}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < timeline.length - 1 && <Divider component="li" />}
          </Box>
        ))}
      </List>
    ) : (
      <Typography variant="body2" color="text.secondary">
        No timeline defined
      </Typography>
    )}
  </Paper>
);

export default ProposalTimeline;