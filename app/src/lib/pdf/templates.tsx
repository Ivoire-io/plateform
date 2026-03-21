import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// ─── Brand constants ───
const BRAND_COLOR = "#FF6B35";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#555555";
const BORDER_COLOR = "#E0E0E0";
const BG_LIGHT = "#FFF8F5";

// ─── Helpers ───
function formatDate(): string {
  const now = new Date();
  return now.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// A) PitchDeckPDF — One page per slide, landscape A4
// ────────────────────────────────────────────────────────────────────────────────

interface PitchDeckSlide {
  title: string;
  content: string;
  notes?: string;
}

interface PitchDeckProps {
  slides: PitchDeckSlide[];
  projectName: string;
  tagline: string;
}

const pitchStyles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  // Cover slide
  coverContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coverProjectName: {
    fontSize: 42,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
    marginBottom: 16,
    textAlign: "center",
  },
  coverTagline: {
    fontSize: 18,
    color: TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 40,
    maxWidth: 500,
  },
  coverDate: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  // Content slides
  slideTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BRAND_COLOR,
  },
  slideContent: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 1.8,
    flex: 1,
  },
  slideNotes: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    fontStyle: "italic",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  slideNumber: {
    position: "absolute",
    bottom: 30,
    right: 50,
    fontSize: 11,
    color: TEXT_SECONDARY,
  },
});

export function PitchDeckPDF({ slides, projectName, tagline }: PitchDeckProps) {
  return (
    <Document>
      {/* Cover slide */}
      <Page size="A4" orientation="landscape" style={pitchStyles.page}>
        <View style={pitchStyles.coverContainer}>
          <Text style={pitchStyles.coverProjectName}>{projectName}</Text>
          <Text style={pitchStyles.coverTagline}>{tagline}</Text>
        </View>
        <Text style={pitchStyles.coverDate}>{formatDate()}</Text>
      </Page>

      {/* Content slides */}
      {slides.map((slide, index) => (
        <Page
          key={index}
          size="A4"
          orientation="landscape"
          style={pitchStyles.page}
        >
          <Text style={pitchStyles.slideTitle}>{slide.title}</Text>
          <Text style={pitchStyles.slideContent}>{slide.content}</Text>
          {slide.notes && (
            <Text style={pitchStyles.slideNotes}>{slide.notes}</Text>
          )}
          <Text style={pitchStyles.slideNumber}>{index + 2}</Text>
        </Page>
      ))}
    </Document>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// B) OnePagerPDF — Single A4 portrait page, 6 sections
// ────────────────────────────────────────────────────────────────────────────────

interface OnePagerProps {
  projectName: string;
  tagline: string;
  problem: string;
  solution: string;
  market: string;
  model: string;
  team: string;
  ask: string;
}

const onePagerStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: BRAND_COLOR,
  },
  headerProjectName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
    marginBottom: 6,
  },
  headerTagline: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontStyle: "italic",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  sectionCell: {
    width: "48%",
    marginBottom: 16,
    marginRight: "2%",
    padding: 12,
    backgroundColor: BG_LIGHT,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: BRAND_COLOR,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 10,
    color: TEXT_PRIMARY,
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: TEXT_SECONDARY,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 8,
  },
});

export function OnePagerPDF({
  projectName,
  tagline,
  problem,
  solution,
  market,
  model,
  team,
  ask,
}: OnePagerProps) {
  const sections = [
    { label: "Probleme", text: problem },
    { label: "Solution", text: solution },
    { label: "Marche", text: market },
    { label: "Modele economique", text: model },
    { label: "Equipe", text: team },
    { label: "Demande", text: ask },
  ];

  return (
    <Document>
      <Page size="A4" style={onePagerStyles.page}>
        <View style={onePagerStyles.header}>
          <Text style={onePagerStyles.headerProjectName}>{projectName}</Text>
          <Text style={onePagerStyles.headerTagline}>{tagline}</Text>
        </View>

        <View style={onePagerStyles.grid}>
          {sections.map((section, index) => (
            <View key={index} style={onePagerStyles.sectionCell}>
              <Text style={onePagerStyles.sectionLabel}>{section.label}</Text>
              <Text style={onePagerStyles.sectionText}>{section.text}</Text>
            </View>
          ))}
        </View>

        <Text style={onePagerStyles.footer}>
          {`G\u00e9n\u00e9r\u00e9 par ivoire.io \u2014 ${formatDate()}`}
        </Text>
      </Page>
    </Document>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// C) CahierDesChargesPDF — Multi-page A4 portrait, parsed markdown
// ────────────────────────────────────────────────────────────────────────────────

interface CahierDesChargesProps {
  projectName: string;
  content: string;
}

const cahierStyles = StyleSheet.create({
  titlePage: {
    padding: 60,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  titleLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 16,
  },
  titleProjectName: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
    textAlign: "center",
    marginBottom: 12,
  },
  titleDivider: {
    width: 80,
    height: 3,
    backgroundColor: BRAND_COLOR,
    marginBottom: 24,
  },
  titleDate: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  contentPage: {
    padding: 50,
    paddingTop: 70,
    paddingBottom: 60,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  pageHeader: {
    position: "absolute",
    top: 25,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 8,
  },
  pageHeaderText: {
    fontSize: 9,
    color: TEXT_SECONDARY,
  },
  pageFooter: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 9,
    color: TEXT_SECONDARY,
  },
  heading2: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  heading3: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
    marginTop: 14,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 11,
    color: TEXT_PRIMARY,
    lineHeight: 1.7,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 11,
    color: TEXT_PRIMARY,
    lineHeight: 1.7,
    marginBottom: 4,
    paddingLeft: 16,
  },
  listBullet: {
    position: "absolute",
    left: 0,
    fontSize: 11,
    color: BRAND_COLOR,
  },
  listItemRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 11,
    color: BRAND_COLOR,
    width: 16,
  },
  listItemText: {
    fontSize: 11,
    color: TEXT_PRIMARY,
    lineHeight: 1.7,
    flex: 1,
  },
});

interface ParsedBlock {
  type: "h2" | "h3" | "paragraph" | "list_item";
  text: string;
}

function parseMarkdown(content: string): ParsedBlock[] {
  const lines = content.split("\n");
  const blocks: ParsedBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4) });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3) });
    } else if (trimmed.startsWith("# ")) {
      // Treat top-level headings as h2 in body
      blocks.push({ type: "h2", text: trimmed.slice(2) });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({ type: "list_item", text: trimmed.slice(2) });
    } else if (/^\d+\.\s/.test(trimmed)) {
      blocks.push({ type: "list_item", text: trimmed.replace(/^\d+\.\s/, "") });
    } else {
      blocks.push({ type: "paragraph", text: trimmed });
    }
  }

  return blocks;
}

export function CahierDesChargesPDF({
  projectName,
  content,
}: CahierDesChargesProps) {
  const blocks = parseMarkdown(content);

  return (
    <Document>
      {/* Title page */}
      <Page size="A4" style={cahierStyles.titlePage}>
        <Text style={cahierStyles.titleLabel}>Cahier des charges</Text>
        <Text style={cahierStyles.titleProjectName}>{projectName}</Text>
        <View style={cahierStyles.titleDivider} />
        <Text style={cahierStyles.titleDate}>{formatDate()}</Text>
      </Page>

      {/* Content pages */}
      <Page size="A4" style={cahierStyles.contentPage} wrap>
        <View
          style={cahierStyles.pageHeader}
          fixed
        >
          <Text style={cahierStyles.pageHeaderText}>{projectName}</Text>
          <Text style={cahierStyles.pageHeaderText}>Cahier des charges</Text>
        </View>

        {blocks.map((block, index) => {
          switch (block.type) {
            case "h2":
              return (
                <Text key={index} style={cahierStyles.heading2}>
                  {block.text}
                </Text>
              );
            case "h3":
              return (
                <Text key={index} style={cahierStyles.heading3}>
                  {block.text}
                </Text>
              );
            case "list_item":
              return (
                <View key={index} style={cahierStyles.listItemRow}>
                  <Text style={cahierStyles.bulletText}>{"\u2022"}</Text>
                  <Text style={cahierStyles.listItemText}>{block.text}</Text>
                </View>
              );
            case "paragraph":
            default:
              return (
                <Text key={index} style={cahierStyles.paragraph}>
                  {block.text}
                </Text>
              );
          }
        })}

        <Text
          style={cahierStyles.pageFooter}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// D) CertificatePDF — Official-looking timestamp certificate
// ────────────────────────────────────────────────────────────────────────────────

interface CertificateProps {
  projectName: string;
  hash: string;
  timestamp: string;
  ownerName: string;
}

const certStyles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  border: {
    flex: 1,
    borderWidth: 3,
    borderColor: BRAND_COLOR,
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  innerBorder: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  shieldIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 36,
    textAlign: "center",
  },
  divider: {
    width: 120,
    height: 2,
    backgroundColor: BRAND_COLOR,
    marginBottom: 36,
  },
  label: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: "center",
  },
  value: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: TEXT_PRIMARY,
    marginBottom: 24,
    textAlign: "center",
  },
  hashLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: "center",
  },
  hash: {
    fontSize: 9,
    fontFamily: "Courier",
    color: TEXT_PRIMARY,
    backgroundColor: BG_LIGHT,
    padding: 10,
    marginBottom: 24,
    textAlign: "center",
    borderRadius: 4,
    maxWidth: 400,
  },
  timestampLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: "center",
  },
  timestampValue: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    marginBottom: 40,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textAlign: "center",
  },
  footerBrand: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND_COLOR,
    textAlign: "center",
    marginTop: 2,
  },
});

export function CertificatePDF({
  projectName,
  hash,
  timestamp,
  ownerName,
}: CertificateProps) {
  return (
    <Document>
      <Page size="A4" style={certStyles.page}>
        <View style={certStyles.border}>
          <View style={certStyles.innerBorder} />

          <Text style={certStyles.shieldIcon}>{"\uD83D\uDD12"}</Text>

          <Text style={certStyles.title}>{"Certificat d'horodatage"}</Text>
          <Text style={certStyles.subtitle}>
            Preuve de conception horodatee
          </Text>

          <View style={certStyles.divider} />

          <Text style={certStyles.label}>Projet</Text>
          <Text style={certStyles.value}>{projectName}</Text>

          <Text style={certStyles.label}>Proprietaire</Text>
          <Text style={certStyles.value}>{ownerName}</Text>

          <Text style={certStyles.hashLabel}>Empreinte numerique (SHA-256)</Text>
          <Text style={certStyles.hash}>{hash}</Text>

          <Text style={certStyles.timestampLabel}>Date de certification</Text>
          <Text style={certStyles.timestampValue}>{timestamp}</Text>

          <View style={certStyles.footer}>
            <Text style={certStyles.footerText}>
              {"V\u00e9rifi\u00e9 et certifi\u00e9 par"}
            </Text>
            <Text style={certStyles.footerBrand}>ivoire.io</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
