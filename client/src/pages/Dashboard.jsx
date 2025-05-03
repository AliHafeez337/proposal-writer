import { Container, Grid, Card, CardContent, CardActions, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Proposals
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Manage your proposals
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={Link} 
                to="/proposals"
                variant="contained"
                fullWidth
              >
                Go to Proposals
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}