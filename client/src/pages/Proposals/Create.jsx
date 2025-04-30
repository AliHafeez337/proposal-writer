import { useState, useEffect } from 'react';
import { Container, Stepper, Step, StepLabel, Box, Button, CircularProgress } from '@mui/material';
import { createProposal, getProposal, updateTitleDescription } from '../../services/proposals';
import { useParams, useNavigate } from 'react-router-dom';
import ProposalBasicInfo from '../../components/Proposals/Create/BasicInfo';
import ProposalDocuments from '../../components/Proposals/Create/Documents';
import ProposalReview from '../../components/Proposals/Create/Review';

const steps = ['Basic Info', 'Documents', 'Review'];

export default function CreateProposal() {
  const { id } = useParams(); // Will be undefined for create mode
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [proposalData, setProposalData] = useState({
    title: '',
    description: '',
    files: []
  });
  const [isLoading, setIsLoading] = useState(!!id); // Loading only in edit mode
  const [errors, setErrors] = useState({ title: false, description: false });

  // Load proposal data in edit mode
  useEffect(() => {
    if (!id) return;

    const loadProposal = async () => {
      try {
        const proposal = await getProposal(id);
        setProposalData({
          title: proposal.title,
          description: proposal.description,
          files: proposal.files || []
        });
      } catch (error) {
        console.error('Failed to load proposal:', error);
        navigate('/proposals');
      } finally {
        setIsLoading(false);
      }
    };
    loadProposal();
  }, [id, navigate]);

  const handleCancel = () => navigate('/proposals');

  const validate = () => {
    const newErrors = {
      title: !proposalData.title.trim(),
      description: !proposalData.description.trim()
    };
    setErrors(newErrors);
    return Object.values(newErrors).some(Boolean);
  };

  const handleNext = async () => {
    if (validate()) return; // Stop if validation fails

    try {
      setIsLoading(true);

      if (id) {
        await updateTitleDescription(id, {
          title: proposalData.title,
          description: proposalData.description
        });
      } 
      // In create mode, make new proposal
      else if (activeStep === 0) {
        const { _id } = await createProposal({
          title: proposalData.title,
          description: proposalData.description
        });
        setProposalData(prev => ({ ...prev, _id }));
      }
      
      setActiveStep(prev => prev + 1);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Container maxWidth="md">
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '400px' }}>
      {activeStep === 0 && (
          <ProposalBasicInfo 
            data={proposalData}
            updateData={setProposalData}
            errors={errors}
          />
        )}
        {activeStep === 1 && (
          <ProposalDocuments 
            data={proposalData}
            updateData={setProposalData}
            id={id}
          />
        )}
        {activeStep === 2 && (
          <ProposalReview 
            data={proposalData}
            id={id}
          />
        )}
      </Box>

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={handleCancel} color="error">
          Cancel
        </Button>
        <Box>
          {activeStep > 0 && (
            <Button onClick={handleBack} sx={{ mr: 2 }}>
              Back
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Next'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}