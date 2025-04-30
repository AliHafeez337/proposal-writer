import { useState } from 'react';
import { Container, Stepper, Step, StepLabel, Box, Button } from '@mui/material';
import ProposalBasicInfo from '../../components/Proposals/Create/BasicInfo';
import ProposalDocuments from '../../components/Proposals/Create/Documents';
import ProposalReview from '../../components/Proposals/Create/Review';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const steps = ['Basic Info', 'Documents', 'Review'];

export default function CreateProposal() {
  const [activeStep, setActiveStep] = useState(0);
  const [proposalData, setProposalData] = useState({
    title: '',
    description: '',
    files: []
  });
  const navigate = useNavigate();

  // Centralized step handler
  const handleStep = (direction) => {
    if (direction === 'next' && activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else if (direction === 'back') {
      setActiveStep(prev => prev - 1);
    }
  };

  // Single cancel handler (reusable)
  const handleCancel = () => {
    if (window.confirm('Discard this proposal?')) {
      navigate('/proposals');
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/proposals', proposalData);
      navigate(`/proposals/${response.data._id}`);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  // Dynamically render current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <ProposalBasicInfo
            data={proposalData}
            updateData={(newData) => setProposalData(prev => ({ ...prev, ...newData }))}
          />
        );
      case 1:
        return (
          <ProposalDocuments
            data={proposalData}
            updateData={(newData) => setProposalData(prev => ({ ...prev, ...newData }))}
          />
        );
      case 2:
        return <ProposalReview data={proposalData} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ minHeight: '400px' }}>
        {renderStepContent()}
      </Box>

      {/* Global Action Buttons (Fixed at bottom) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={handleCancel} color="error">
          Cancel
        </Button>
        <Box>
          {activeStep > 0 && (
            <Button onClick={() => handleStep('back')} sx={{ mr: 2 }}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button 
              variant="contained" 
              onClick={() => handleStep('next')}
            >
              Next
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleSubmit}
            >
              Submit Proposal
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}