// src/components/Proposals/View/ProposalView.jsx
import { Box, Typography, Button, Stack, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { GlobalStyles } from '@mui/material';
import { PDFDownloadButton } from './PDF/PDFDownloadButton';
import ProposalRequirements from './View/Requirements';
import ProposalDeliverables from './View/Deliverables';
import ProposalWorkPlan from './View/ProposalWorkPlan';
import ProposalTimeline from './View/Timeline';
import ProposalPaymentSchedule from './View/PaymentSchedule';

// Main Proposal View Component
export default function ProposalView({ proposal }) {
  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {proposal.title || 'Project Proposal'}
        </Typography>
        <Stack direction="row" justifyContent="center" spacing={2}>
          <Typography variant="body2">
            <strong>Prepared for:</strong> {proposal.user?.email}
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> {proposal.status}
          </Typography>
        </Stack>
      </Box>

      {/* Executive Summary */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Executive Summary
        </Typography>
        <Typography variant="body1" whiteSpace="pre-line">
          {proposal.content?.executiveSummary || 'No executive summary provided'}
        </Typography>
      </Paper>

      {/* Scope */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Scope of Work
        </Typography>
        <Typography variant="body1" whiteSpace="pre-line">
          {proposal.content?.scopeOfWork || 'No scope defined'}
        </Typography>
      </Paper>

      {/* Requirements */}
      {proposal.content?.requirements?.length > 0 && (
        <ProposalRequirements requirements={proposal.content?.requirements} sx={{ mb: 4 }} />
      )}

      {/* Deliverables */}
      <ProposalDeliverables deliverables={proposal.content?.deliverables} sx={{ mb: 4 }} />

      {/* Pricing */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Pricing Summary
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Total: ${proposal.pricing?.total?.toFixed(2) || '0.00'}
        </Typography>
      </Paper>

      {/* Work Plan */}
      <ProposalWorkPlan workBreakdown={proposal.content?.workBreakdown} sx={{ mb: 4 }} />

      {/* Timeline */}
      <ProposalTimeline timeline={proposal.content?.timeline} sx={{ mb: 4 }} />

      {/* Payment Schedule */}
      {proposal.content?.timeline?.some(p => p.milestones?.length > 0) && (
        <ProposalPaymentSchedule timeline={proposal.content?.timeline} sx={{ mb: 4 }} />
      )}

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <PDFDownloadButton proposal={proposal} />
      </Box>

      <GlobalStyles styles={{
        '@media print': {
          body: {
            padding: '20px',
            fontSize: '12pt'
          },
          '.no-print': {
            display: 'none !important'
          },
          '@page': {
            size: 'A4',
            margin: '1cm'
          }
        }
      }} />
    </Box>
  );
}