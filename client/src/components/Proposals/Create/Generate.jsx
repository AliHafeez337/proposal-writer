// src/components/Proposals/Create/Generate.jsx
import { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Paper } from '@mui/material';
import { generateProposal } from '../../../services/ai';
import EditableText from '../Edit/EditableText';
import EditableRequirements from '../Edit/EditableRequirements';
import DeliverablesWithPricing from '../Edit/EditableDeliverablesWithPricing';
import EditableWorkPlan from '../Edit/EditableWorkPlan';
import EditableTimeline from '../Edit/EditableTimeline';

export default function GenerateProposal({ data, updateData }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // AI generation function
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

  const handleUpdate = (data) => {
    updateData({ ...data, ...data });
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
            disabled={isGenerating || data.content.timeline?.length > 0}
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
          <EditableRequirements
            id={data._id}
            requirements={data.content?.requirements || []}
            onUpdate={handleUpdate}
          />
          <DeliverablesWithPricing
            id={data._id}
            deliverables={data.content.deliverables}
            onUpdate={handleUpdate}
          />
          <EditableWorkPlan 
            id={data._id}
            workBreakdown={data.content?.workBreakdown}
            onUpdate={handleUpdate}
          />
          <EditableTimeline 
            id={data._id}
            timeline={data.content?.timeline}
            workBreakdown={data.content?.workBreakdown || []}
            total={data.pricing?.total || 0}
            onUpdate={handleUpdate}
          />
        </>
      )}
    </Box>
  );
}