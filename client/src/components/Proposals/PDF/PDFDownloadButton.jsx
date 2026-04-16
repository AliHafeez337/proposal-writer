// src/components/Proposals/PDF/PDFDownloadButton.jsx
import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ProposalPDF from './ProposalPDF.jsx';

export const PDFDownloadButton = ({ proposal }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        disabled
        sx={{ px: 4, py: 1.5 }}
      >
        Loading PDF...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ProposalPDF proposal={proposal} />}
      fileName={`proposal_${proposal.title?.replace(/\s+/g, '_') || 'untitled'}.pdf`}
    >
      {({ loading, error }) => {
        if (error) {
          console.error('PDF Generation Error:', error);
          return (
            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdfIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              Error Generating PDF
            </Button>
          );
        }
        return (
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            disabled={loading}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? 'Preparing PDF...' : 'Download as PDF'}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
};