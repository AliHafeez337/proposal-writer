import { Paper, Divider, Chip, Typography, List, ListItem, ListItemText, Box } from '@mui/material';

const ProposalWorkPlan = ({ workBreakdown, sx = {} }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, ...sx }}>
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
                    task.dependencies?.length > 0 ? (
                      <Typography 
                        component="span" 
                        variant="body2"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                      >
                        Depends on: 
                        {task.dependencies.map((dep, i) => (
                          <Chip key={i} label={dep} size="small" />
                        ))}
                      </Typography>
                    ) : null
                  }
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
              {index < workBreakdown.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No work breakdown defined
        </Typography>
      )}
    </Paper>
  )
};

export default ProposalWorkPlan;