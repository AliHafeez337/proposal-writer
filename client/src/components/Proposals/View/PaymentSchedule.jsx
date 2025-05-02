import { Paper, Typography, List, ListItem, ListItemText, Divider, Box, Chip } from '@mui/material';

const ProposalPaymentSchedule = ({ timeline, sx = {} }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, ...sx }}>
      <Typography variant="h6" gutterBottom>
        Payment Schedule
      </Typography>
      <List disablePadding>
        {timeline.flatMap(phase => 
          phase.milestones?.map((milestone, i) => (
            <ListItem key={`${phase._id}-${i}`}>
              <ListItemText
                primary={`${phase.phase}: ${milestone.name}`}
                secondary={
                  <Box component={ "span" } sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                    <span>${milestone.paymentAmount?.toFixed(2)} ({milestone.percentage}%)</span>
                  </Box>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  )
}

export default ProposalPaymentSchedule;