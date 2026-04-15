import { Grid, Card, CardContent, Button, Typography, Box, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0.75 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Draft, generate, and export proposals faster.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Proposals
              </Typography>
              <Typography sx={{ mb: 2 }} color="text.secondary">
                Manage your proposals
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" component={Link} to="/proposals">
                  Go to proposals
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5">Quick start</Typography>
              <Typography sx={{ mb: 2 }} color="text.secondary">
                Create a new proposal and move through the steps in minutes.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" component={Link} to="/proposals/new">
                  New proposal
                </Button>
                <Button variant="outlined" component={Link} to="/proposals">
                  View proposals
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}