// src/components/Proposals/View/Deliverables.jsx
import { Box, Typography, Divider, List, ListItem, ListItemText, Paper } from '@mui/material';

export default function Deliverables({ deliverables, sx = {} }) {
  return (
    <Box>
      {/* Deliverables Section */}
      <Paper elevation={1} sx={{ p: 3, ...sx }}>
        <Typography variant="h6" gutterBottom>
          Deliverables
        </Typography>
        {deliverables?.length > 0 ? (
          <List disablePadding>
            {deliverables.map((item, index) => (
              <Box key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`${item.item} (${item.count} ${item.unit})`}
                    secondary={item.description}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                {index < deliverables.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No deliverables defined yet
          </Typography>
        )}
      </Paper>
    </Box>
  );
}