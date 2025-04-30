import { useState, useEffect } from 'react';
import { Container, Typography, Button, CircularProgress, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ProposalCard from '../../components/Proposals/ProposalCard';

export default function ProposalList() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await api.get('/proposals');
        setProposals(response.data);
      } catch (error) {
        console.error('Failed to fetch proposals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Button 
          component={RouterLink}
          to="/"
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Button 
          component={RouterLink} 
          to="/proposals/new" 
          variant="contained"
        >
          Create New Proposal
        </Button>
      </Box>

      {proposals.length === 0 ? (
        <Typography variant="body1">No proposals found. Create your first proposal!</Typography>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
          {proposals.map((proposal) => (
            <ProposalCard key={proposal._id} proposal={proposal} />
          ))}
        </Box>
      )}
    </>
  );
}