import { Paper, Typography, List, ListItem, ListItemText, Box } from '@mui/material';

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
};

const ProposalPaymentSchedule = ({ timeline, sx = {} }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, ...sx }}>
      <Typography variant="h6" gutterBottom>
        Payment Schedule
      </Typography>
      <List disablePadding>
        {(timeline || []).flatMap((phase, pIdx) => 
          (phase.milestones || []).map((milestone, i) => (
            <ListItem key={`${phase._id || pIdx}-${i}`}>
              <ListItemText
                primary={`${phase.phase || 'Phase'}: ${milestone.name || 'Milestone'}`}
                secondary={
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 0.5 }}>
                    <Typography variant="body2" component="span" color="text.secondary">
                      Due: {formatDate(milestone.dueDate)}
                    </Typography>
                    <Typography variant="body2" component="span" fontWeight="medium">
                      ${milestone.paymentAmount?.toFixed(2) || '0.00'} ({milestone.percentage || 0}%)
                    </Typography>
                  </Box>
                }
                secondaryTypographyProps={{ component: 'div' }}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  )
}

export default ProposalPaymentSchedule;