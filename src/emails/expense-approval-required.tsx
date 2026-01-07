import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ExpenseApprovalRequiredEmailProps {
  approverName: string;
  submitterName: string;
  expenseDescription: string;
  amountCents: number;
  currency: string;
  category: string;
  projectName: string;
  vendor?: string;
  expenseDate: string;
  approvalUrl: string;
  organizationName: string;
  notes?: string;
}

export function ExpenseApprovalRequiredEmail({
  approverName = "Approver",
  submitterName = "Team Member",
  expenseDescription = "Office Supplies",
  amountCents = 5000,
  currency = "USD",
  category = "materials",
  projectName = "Client Project",
  vendor,
  expenseDate = "January 1, 2024",
  approvalUrl = "https://app.photoproos.com",
  organizationName = "Your Organization",
  notes,
}: ExpenseApprovalRequiredEmailProps) {
  const previewText = `Expense approval required: ${expenseDescription} - ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountCents / 100)}`;

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amountCents / 100);

  const categoryLabels: Record<string, string> = {
    labor: "Labor",
    travel: "Travel",
    equipment: "Equipment",
    software: "Software",
    materials: "Materials",
    marketing: "Marketing",
    fees: "Fees & Permits",
    insurance: "Insurance",
    other: "Other",
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logoText}>{organizationName}</Heading>
          </Section>

          <Section style={contentSection}>
            <Section style={approvalBadge}>
              <Text style={badgeIcon}>$</Text>
              <Text style={approvalText}>Expense Approval Required</Text>
            </Section>

            <Heading style={heading}>New Expense Pending Approval</Heading>

            <Text style={paragraph}>Hi {approverName},</Text>
            <Text style={paragraph}>
              {submitterName} has submitted an expense that requires your approval.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Expense Details</Text>
              <Hr style={divider} />

              <Section style={detailRow}>
                <Text style={detailLabel}>Description</Text>
                <Text style={detailValue}>{expenseDescription}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Amount</Text>
                <Text style={detailValueBold}>{formattedAmount}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Category</Text>
                <Text style={detailValue}>{categoryLabels[category] || category}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Project</Text>
                <Text style={detailValue}>{projectName}</Text>
              </Section>

              {vendor && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>Vendor</Text>
                  <Text style={detailValue}>{vendor}</Text>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailLabel}>Date</Text>
                <Text style={detailValue}>{expenseDate}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>Submitted By</Text>
                <Text style={detailValue}>{submitterName}</Text>
              </Section>

              {notes && (
                <>
                  <Hr style={divider} />
                  <Section style={detailRow}>
                    <Text style={detailLabel}>Notes</Text>
                    <Text style={detailValueNotes}>{notes}</Text>
                  </Section>
                </>
              )}
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={approvalUrl}>
                Review & Approve
              </Button>
            </Section>

            <Text style={paragraph}>
              Click the button above to review this expense and approve or reject it.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This notification was sent by {organizationName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
            <Text style={footerText}>
              You are receiving this because you are an expense approver.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ExpenseApprovalRequiredEmail;

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const contentSection = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  padding: "40px 32px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const approvalBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const badgeIcon = {
  color: "#f97316",
  fontSize: "48px",
  margin: "0",
};

const approvalText = {
  color: "#f97316",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "8px 0 0 0",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const paragraph = {
  color: "#a7a7a7",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const detailsBox = {
  backgroundColor: "#191919",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const detailsTitle = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0",
};

const divider = {
  borderColor: "rgba(255, 255, 255, 0.08)",
  margin: "16px 0",
};

const detailRow = {
  marginBottom: "12px",
};

const detailLabel = {
  color: "#7c7c7c",
  fontSize: "14px",
  margin: "0 0 4px 0",
};

const detailValue = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "0",
};

const detailValueBold = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0",
};

const detailValueNotes = {
  color: "#a7a7a7",
  fontSize: "14px",
  fontStyle: "italic" as const,
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
};

const footerText = {
  color: "#7c7c7c",
  fontSize: "12px",
  margin: "4px 0",
};

const footerLink = {
  color: "#3b82f6",
  textDecoration: "none",
};
