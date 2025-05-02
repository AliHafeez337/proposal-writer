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

const ProposalPDF = ({ proposal }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{proposal.title || 'Project Proposal'}</Text>
        <Text style={styles.subtitle}>
          Prepared for: {proposal.user?.email} | Date: {new Date(proposal.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.item}>{proposal.content?.executiveSummary}</Text>
      </View>

      {/* Scope of Work */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scope of Work</Text>
        <Text style={styles.item}>{proposal.content?.scopeOfWork}</Text>
      </View>

      {/* Requirements */}
      {proposal.content?.requirements?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {proposal.content.requirements.map((req, i) => (
            <Text key={i} style={styles.item}>• {req}</Text>
          ))}
        </View>
      )}

      {/* Two Column Layout for Deliverables and Pricing */}
      <View style={styles.twoColumn}>
        {/* Deliverables */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>Deliverables</Text>
          {proposal.content?.deliverables?.map((item, i) => (
            <View key={i} style={[styles.item, { marginBottom: 12 }]}>
              <Text style={styles.itemTitle}>{item.item} ({item.count} {item.unit})</Text>
              <Text>{item.description}</Text>
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
            {proposal.content?.deliverables?.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.item}</Text>
                <Text style={styles.tableCell}>${item.unitPrice?.toFixed(2)}</Text>
                <Text style={styles.tableCell}>{item.count}</Text>
                <Text style={styles.tableCell}>${(item.unitPrice * item.count).toFixed(2)}</Text>
              </View>
            ))}
            <View style={[styles.tableRow, { borderBottom: 'none' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL</Text>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}></Text>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}></Text>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>${proposal.pricing?.total?.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Work Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Breakdown</Text>
        {proposal.content?.workBreakdown?.map((task, i) => (
          <View key={i} style={[styles.item, { marginBottom: 10 }]}>
            <Text style={styles.itemTitle}>{task.task} ({task.duration} days)</Text>
            {task.dependencies?.length > 0 && (
              <Text style={{ fontSize: 10 }}>Depends on: {task.dependencies.join(', ')}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Timeline</Text>
        {proposal.content?.timeline?.map((phase, i) => (
          <View key={i} style={styles.timelinePhase}>
            <Text style={{ fontWeight: 'bold' }}>{phase.phase}</Text>
            <Text style={{ fontSize: 10, color: '#666' }}>
              {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
            </Text>
            {phase.milestones?.map((m, j) => (
              <View key={j} style={styles.milestone}>
                <Text>• {m.name}: {m.percentage}% (${m.paymentAmount?.toFixed(2)}) - Due {new Date(m.dueDate).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Payment Schedule */}
      {proposal.content?.timeline?.some(p => p.milestones?.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Phase</Text>
              <Text style={styles.tableCell}>Milestone</Text>
              <Text style={styles.tableCell}>Due Date</Text>
              <Text style={styles.tableCell}>Amount</Text>
            </View>
            {proposal.content.timeline.flatMap(phase => 
              phase.milestones?.map((milestone, i) => (
                <View key={`${phase._id}-${i}`} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{phase.phase}</Text>
                  <Text style={styles.tableCell}>{milestone.name}</Text>
                  <Text style={styles.tableCell}>{new Date(milestone.dueDate).toLocaleDateString()}</Text>
                  <Text style={styles.tableCell}>${milestone.paymentAmount?.toFixed(2)} ({milestone.percentage}%)</Text>
                </View>
              ))
            )}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

export default ProposalPDF;