// src/components/Proposals/Create/Generate.jsx
import { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Paper } from '@mui/material';
import { generateProposal } from '../../../services/ai';
import Scope from '../../Proposals/View/Scope';
import DeliverablesWithPricing from '../Edit/DeliverablesWithPricing';
import WorkPlanDisplay from '../View/WorkPlanDisplay';
import TimelineDisplay from '../View/TimelineDisplay';
import EditableText from '../Edit/EditableText';

export default function GenerateProposal({ data, updateData, errors }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  console.log('GenerateProposal data:', data);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await generateProposal(data._id);
      
      updateData(response);
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to generate proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecutiveSummaryChange = (key1, data1) => {
    updateData({ ...data, content: { ...data.content, [key1]: data1 } })
  };

  const handlePricingChange = (updatedDeliverables) => {
    updateData({ ...data, deliverables: updatedDeliverables });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Final Proposal
        </Typography>
        
        <Typography variant="body1" paragraph>
          Click the button below to generate your complete proposal document 
          based on the information you've provided.
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerate}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : null}
          >
            {isGenerating ? 'Generating...' : 'Generate Full Proposal'}
          </Button>
        </Box>
      </Paper>

      {data.content && data.content.executiveSummary && data.content.workBreakdown && (
        <>
          <EditableText id={data._id} key1="executiveSummary" key2="Executive Summary" text1={data.content.executiveSummary} onUpdate={handleExecutiveSummaryChange} />
          <EditableText id={data._id} key1="scopeOfWork" key2="Scope of Work" text1={data.content.scopeOfWork} onUpdate={handleExecutiveSummaryChange} />
          <DeliverablesWithPricing
            id={data._id}
            deliverables={data.content.deliverables} 
            onPricingChange={handlePricingChange}
            errors={errors}
          />
          <WorkPlanDisplay 
            workBreakdown={data.content.workBreakdown}
          />
          <TimelineDisplay timeline={data.content.timeline} />
        </>
      )}
      {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      </Box> */}
    </Box>
  );
}