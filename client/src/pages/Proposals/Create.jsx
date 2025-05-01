import { useState, useEffect, useRef } from 'react';
import { Container, Stepper, Step, StepLabel, Box, Button, CircularProgress, Alert } from '@mui/material';
import { createProposal, getProposal, updateTitleDescription } from '../../services/proposals';
import { useParams, useNavigate } from 'react-router-dom';
import ProposalBasicInfo from '../../components/Proposals/Create/BasicInfo';
import ProposalDocuments from '../../components/Proposals/Create/Documents';
import GenerateProposal from '../../components/Proposals/Create/Generate';
import ProposalReview from '../../components/Proposals/Create/Review';

const steps = ['Basic Info', 'Analysis', 'Generate', 'Review'];

export default function CreateProposal() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [proposalData, setProposalData] = useState({
    _id: useParams().id || null,
    title: '',
    description: '',
    files: []
  });
  const [isLoading, setIsLoading] = useState(!!proposalData._id); // Loading only in edit mode
  const [errors, setErrors] = useState({ title: false, description: false, pricing: false });
  const initialStatusSet = useRef(false);

  useEffect(() => {
    if (activeStep === 3) {
      if (proposalData.content.deliverables.some(deliverable => !deliverable.unitPrice)) {
        setActiveStep(2);
        setErrors({ ...errors, pricing: true });
      }
    } else if (activeStep === 2) {
      if (!proposalData.content.scopeOfWork) {
        setActiveStep(1);
        setErrors({ ...errors, scopeOfWork: true });
      }
    }
  }, [activeStep]);

  useEffect(() => {
    if (!initialStatusSet.current && proposalData.status) {
      if (proposalData.status === 'draft') {
        setActiveStep(1);
      } else if (proposalData.status === 'initial_analysis') {
        setActiveStep(1);
      } else if (proposalData.status === 'reviewing') {
        setActiveStep(2);
      } else if (proposalData.status === 'complete') {
        setActiveStep(3);
      }
      initialStatusSet.current = true;
    }
  }, [proposalData.status]); // Only depend on status

  // Load proposal data in edit mode
  useEffect(() => {
    if (!proposalData._id) return;

    const loadProposal = async () => {
      try {
        const proposal = await getProposal(proposalData._id);
        setProposalData(proposal);
      } catch (error) {
        console.error('Failed to load proposal:', error);
        navigate('/proposals');
      } finally {
        setIsLoading(false);
      }
    };
    loadProposal();
  }, [proposalData._id, navigate]);

  const handleCancel = () => navigate('/proposals');

  const validate = () => {
    const newErrors = {
      title: !proposalData.title.trim()
    };
    setErrors(newErrors);
    return Object.values(newErrors).some(Boolean);
  };

  const handleNext = async () => {
    if (validate()) return; // Stop if validation fails

    try {
      setIsLoading(true);

      // In create mode, make new proposal
      if (activeStep === 0) {
        if (proposalData._id) {
          await updateTitleDescription(proposalData._id, {
            title: proposalData.title,
            description: proposalData.description
          });
        } else {
          const { _id } = await createProposal({
            title: proposalData.title,
            description: proposalData.description
          });
          setProposalData(prev => ({ ...prev, _id }));
        }
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
          />
        )}
        {activeStep === 2 && (
          <GenerateProposal 
            data={proposalData}
            updateData={setProposalData}
            errors={errors}
          />
        )}
        {activeStep === 3 && (
          <ProposalReview 
            data={proposalData}
          />
        )}
      </Box>

      {/* Error message */}
      {(errors.title || errors.pricing || errors.scopeOfWork) && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {errors.title && <div>Title is required</div>}
          {errors.scopeOfWork && <div>Analysis not done</div>}
          {errors.pricing && <div>Pricing is required</div>}
        </Alert>
      )}

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