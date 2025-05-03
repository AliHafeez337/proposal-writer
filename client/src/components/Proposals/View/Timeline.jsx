import { Paper, Typography, List, ListItem, ListItemText, Divider, Box, Chip } from '@mui/material';

const ProposalTimeline = ({ timeline }) => (
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
                primary={phase.phase}
                primaryTypographyProps={{ fontWeight: 'medium' }}
                secondary={
                  <>
                    <Typography 
                      variant="body2" 
                      component="span" 
                      display="block" 
                      sx={{ mt: 1 }}
                    >
                      {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                    </Typography>
                    {phase.milestones?.length > 0 && (
                      <>
                        <Typography 
                          variant="caption" 
                          component="span" 
                          display="block" 
                          sx={{ mt: 1 }}
                        >
                          Depends on:
                        </Typography>
                        <Box 
                          component="span" 
                          display="block" 
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}
                        >
                          {phase.tasks.map((dep, i) => (
                            <Chip 
                              key={i}
                              label={`${timeline[+dep].phase}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </>
                }
                secondaryTypographyProps={{ component: 'div' }}
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