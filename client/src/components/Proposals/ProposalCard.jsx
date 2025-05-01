import { Card, CardContent, Typography, Button, CardActions, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { deleteProposal } from '../../services/proposals.js';

export default function ProposalCard({ proposal, onDelete }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {proposal.title || 'Untitled Proposal'}
        </Typography>
        <Typography gutterBottom variant="p" component="div">
          {proposal.description || ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {proposal.status}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Created: {new Date(proposal.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updated: {new Date(proposal.updatedAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',  mt: 'auto' }}>
        <CardActions>
          <Button
            component={Link}
            to={`/proposals/edit/${proposal._id}`}
            size="small"
          >
            Edit
          </Button>
        </CardActions>
        <CardActions>
          <Button 
            size="small" 
            component={Link} 
            to={`/proposals/${proposal._id}`}
          >
            View Details
          </Button>
        </CardActions>
        <CardActions>
          <Button 
            size="small" 
            onClick={onDelete}
            color="error"
          >
            Delete
          </Button>
        </CardActions>
      </Box>
    </Card>
  );
}