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

interface ExpenseApprovalResultEmailProps {
  submitterName: string;
  expenseDescription: string;
  amountCents: number;
  currency: string;
  category: string;
  projectName: string;
  vendor?: string;
  expenseDate: string;
  isApproved: boolean;
  approverName: string;
  rejectionReason?: string;
  viewExpenseUrl: string;
  organizationName: string;
}

export function ExpenseApprovalResultEmail({
  submitterName = "Team Member",
  expenseDescription = "Office Supplies",
  amountCents = 5000,
  currency = "USD",
  category = "materials",
  projectName = "Client Project",
  vendor,
  expenseDate = "January 1, 2024",
  isApproved = true,
  approverName = "Manager",
  rejectionReason,
  viewExpenseUrl = "https://app.photoproos.com",
  organizationName = "Your Organization",
}: ExpenseApprovalResultEmailProps) {
  const previewText = isApproved
    ? `Expense approved: ${expenseDescription}`
    : `Expense rejected: ${expenseDescription}`;

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
            <Section style={isApproved ? approvedBadge : rejectedBadge}>
              <Text style={badgeIcon}>{isApproved ? "✓" : "✕"}</Text>
              <Text style={isApproved ? approvedText : rejectedText}>
                {isApproved ? "Expense Approved" : "Expense Rejected"}
              </Text>
            </Section>

            <Heading style={heading}>
              {isApproved ? "Your Expense Has Been Approved" : "Your Expense Has Been Rejected"}
            </Heading>

            <Text style={paragraph}>Hi {submitterName},</Text>
            <Text style={paragraph}>
              {isApproved
                ? `${approverName} has approved your expense submission.`
                : `${approverName} has rejected your expense submission.`}
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
                <Text style={detailLabel}>Reviewed By</Text>
                <Text style={detailValue}>{approverName}</Text>
              </Section>
            </Section>

            {!isApproved && rejectionReason && (
              <Section style={rejectionBox}>
                <Text style={rejectionTitle}>Reason for Rejection</Text>
                <Text style={rejectionText}>{rejectionReason}</Text>
              </Section>
            )}

            <Section style={buttonSection}>
              <Button style={button} href={viewExpenseUrl}>
                View Expense Details
              </Button>
            </Section>

            {!isApproved && (
              <Text style={paragraph}>
                If you believe this was rejected in error or have questions, please contact your
                manager or resubmit the expense with the requested changes.
              </Text>
            )}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This notification was sent by {organizationName} via{" "}
              <Link href="https://photoproos.com" style={footerLink}>
                PhotoProOS
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ExpenseApprovalResultEmail;

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

const approvedBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const rejectedBadge = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const badgeIcon = {
  fontSize: "48px",
  margin: "0",
  color: "#22c55e",
};

const approvedText = {
  color: "#22c55e",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "8px 0 0 0",
};

const rejectedText = {
  color: "#ef4444",
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

const rejectionBox = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  border: "1px solid rgba(239, 68, 68, 0.3)",
};

const rejectionTitle = {
  color: "#ef4444",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const rejectionText = {
  color: "#ffffff",
  fontSize: "14px",
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
