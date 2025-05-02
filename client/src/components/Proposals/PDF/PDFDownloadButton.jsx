// src/components/Proposals/PDF/PDFDownloadButton.jsx
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ProposalPDF from './ProposalPDF.jsx';

export const PDFDownloadButton = ({ proposal }) => (
  <PDFDownloadLink
    document={<ProposalPDF proposal={proposal} />}
    fileName={`proposal_${proposal.title || 'untitled'}.pdf`}
  >
    {({ loading }) => (
      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        disabled={loading}
        sx={{ px: 4, py: 1.5 }}
      >
        {loading ? 'Preparing PDF...' : 'Download as PDF'}
      </Button>
    )}
  </PDFDownloadLink>
);