// src/components/Proposals/PDF/ProposalPDF.jsx
import { 
  Page, 
  Text, 
  View, 
  Document, 
  StyleSheet, 
  Font,
  Image
} from '@react-pdf/renderer';

// Register fonts (optional)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.ttf', fontWeight: 700 },
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    lineHeight: 1.4
  },
  header: {
    marginBottom: 30,
    borderBottom: '1px solid #eee',
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  subtitle: {
    fontSize: 12,
    color: '#666'
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
    borderBottom: '1px solid #eee',
    paddingBottom: 5
  },
  item: {
    marginBottom: 8,
    fontSize: 12
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 3
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  column: {
    width: '48%'
  },
  timelinePhase: {
    marginBottom: 15,
    paddingLeft: 10,
    borderLeft: '3px solid #1976d2'
  },
  milestone: {
    marginLeft: 10,
    marginTop: 5,
    fontSize: 10,
    color: '#555'
  },
  table: {
    width: '100%',
    marginTop: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #eee',
    paddingVertical: 5
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5'
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    width: '25%'
  }
});

const ProposalPDF = ({ proposal = {} }) => {
  const content = proposal.content || {};
  const deliverables = content.deliverables || [];
  const workBreakdown = content.workBreakdown || [];
  const timeline = content.timeline || [];
  const requirements = content.requirements || [];
  const pricing = proposal.pricing || { total: 0 };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  const formatPrice = (price) => {
    const p = Number(price);
    return isNaN(p) ? '0.00' : p.toFixed(2);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{proposal.title || 'Project Proposal'}</Text>
          <Text style={styles.subtitle}>
            Prepared for: {proposal.user?.email || 'N/A'} | Date: {formatDate(proposal.createdAt || new Date())}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.item}>{content.executiveSummary || 'No executive summary provided'}</Text>
        </View>

        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          <Text style={styles.item}>{content.scopeOfWork || 'No scope defined'}</Text>
        </View>

        {/* Requirements */}
        {requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {requirements.map((req, i) => (
              <Text key={i} style={styles.item}>• {req}</Text>
            ))}
          </View>
        )}

        {/* Two Column Layout for Deliverables and Pricing */}
        <View style={styles.twoColumn}>
          {/* Deliverables */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Deliverables</Text>
            {deliverables.map((item, i) => (
              <View key={i} style={[styles.item, { marginBottom: 12 }]}>
                <Text style={styles.itemTitle}>{item.item} ({item.count || 0} {item.unit || 'units'})</Text>
                <Text>{item.description || ''}</Text>
              </View>
            ))}
          </View>

          {/* Pricing Summary */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Pricing Summary</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Item</Text>
                <Text style={styles.tableCell}>Unit Price</Text>
                <Text style={styles.tableCell}>Qty</Text>
                <Text style={styles.tableCell}>Total</Text>
              </View>
              {deliverables.map((item, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.item || 'Item'}</Text>
                  <Text style={styles.tableCell}>${formatPrice(item.unitPrice)}</Text>
                  <Text style={styles.tableCell}>{item.count || 0}</Text>
                  <Text style={styles.tableCell}>${formatPrice((item.unitPrice || 0) * (item.count || 0))}</Text>
                </View>
              ))}
              <View style={[styles.tableRow, { borderBottom: 'none' }]}>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={styles.tableCell}></Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>${formatPrice(pricing.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Work Breakdown */}
        {workBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Breakdown</Text>
            {workBreakdown.map((task, i) => (
              <View key={i} style={[styles.item, { marginBottom: 10 }]}>
                <Text style={styles.itemTitle}>{task.task} ({task.duration || 0} days)</Text>
                {task.dependencies?.length > 0 && (
                  <Text style={{ fontSize: 10 }}>Depends on: {
                    task.dependencies.map(dep => {
                      if (isNaN(dep)) return dep;
                      return workBreakdown[+dep]?.task || `Task ${+dep + 1}`;
                    }).join(', ')
                  }</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Timeline</Text>
            {timeline.map((phase, i) => (
              <View key={i} style={styles.timelinePhase}>
                <Text style={{ fontWeight: 'bold' }}>{phase.phase}</Text>
                <Text style={{ fontSize: 10, color: '#666' }}>
                  {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                </Text>
                {phase.tasks?.map((t, j) => (
                  <View key={j} style={styles.milestone}>
                    <Text>• {workBreakdown[+t]?.task || `Task ${+t + 1}`}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Payment Schedule */}
        {timeline.some(p => p.milestones?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Schedule</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Phase</Text>
                <Text style={styles.tableCell}>Milestone</Text>
                <Text style={styles.tableCell}>Due Date</Text>
                <Text style={styles.tableCell}>Amount</Text>
              </View>
              {timeline.flatMap(phase => 
                (phase.milestones || []).map((milestone, i) => (
                  <View key={`${phase._id || i}-${i}`} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{phase.phase || 'Phase'}</Text>
                    <Text style={styles.tableCell}>{milestone.name || 'Milestone'}</Text>
                    <Text style={styles.tableCell}>{formatDate(milestone.dueDate)}</Text>
                    <Text style={styles.tableCell}>${formatPrice(milestone.paymentAmount)} ({milestone.percentage}%)</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ProposalPDF;