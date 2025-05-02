import { Box, Paper, Typography, List, ListItem, ListItemText, IconButton, Stack, Divider } from '@mui/material';

const ProposalRequirements = ({ requirements, sx = {} }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, ...sx }}>
      <Typography variant="h6" gutterBottom>
        Requirements
      </Typography>
      <List disablePadding>
        {requirements.map((requirement, index) => (
          <Box key={index}>
            <ListItem 
              alignItems="flex-start"
            >
              <ListItemText
                primary={requirement}
                primaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </ListItem>
            {index < requirements.length - 1 && <Divider component="li" />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}

export default ProposalRequirements;