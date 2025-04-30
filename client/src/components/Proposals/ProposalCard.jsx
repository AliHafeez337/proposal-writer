import { Card, CardContent, Typography, Button, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ProposalCard({ proposal }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {proposal.title || 'Untitled Proposal'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {proposal.status}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created: {new Date(proposal.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions sx={{ mt: 'auto' }}>
        <Button 
          size="small" 
          component={Link} 
          to={`/proposals/${proposal._id}`}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}