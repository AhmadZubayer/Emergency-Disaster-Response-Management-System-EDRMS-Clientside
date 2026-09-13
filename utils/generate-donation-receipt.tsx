import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
      fontWeight: 'normal',
    },
  ],
});

Font.register({
  family: 'Lora',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-normal.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-700-normal.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/lora@latest/latin-400-italic.ttf',
      fontStyle: 'italic',
    },
  ],
});

export interface DonationReceiptData {
  receiptNo: string;
  date: string;
  receivedFrom: string;
  contact: string;
  donationAmount: number | string;
  inWords?: string;
  paymentMethod: string;
  transactionId: string;
  campaignTitle: string;
  reliefOrg: string;
}

const numberToWords = (num: number): string => {
  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const convertLessThanOneThousand = (n: number): string => {
    let result = '';
    if (n >= 100) {
      result += `${units[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n >= 20) {
      result += `${tens[Math.floor(n / 10)]} `;
      n %= 10;
    }
    if (n > 0) {
      result += `${units[n]} `;
    }
    return result.trim();
  };

  if (num === 0) return 'Zero US Dollars Only';

  const intPart = Math.floor(num);
  const decimalPart = Math.round((num - intPart) * 100);

  let words = '';
  const millions = Math.floor(intPart / 1000000);
  const thousands = Math.floor((intPart % 1000000) / 1000);
  const remainder = intPart % 1000;

  if (millions > 0) {
    words += `${convertLessThanOneThousand(millions)} Million `;
  }
  if (thousands > 0) {
    words += `${convertLessThanOneThousand(thousands)} Thousand `;
  }
  if (remainder > 0) {
    words += `${convertLessThanOneThousand(remainder)} `;
  }

  words = `${words.trim()} US Dollars`;

  if (decimalPart > 0) {
    words += ` and ${convertLessThanOneThousand(decimalPart)} Cents`;
  }

  return `${words.trim()} Only`;
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    backgroundColor: '#ffffff',
    fontFamily: 'Lora',
    fontSize: 12,
    color: '#1f2937',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
  },
  titleContainer: {
    width: '60%',
  },
  mainTitle: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 22,
    color: '#111827',
    lineHeight: 1.25,
    textTransform: 'uppercase',
  },
  contactInfoContainer: {
    width: '38%',
    borderLeftWidth: 1.5,
    borderLeftColor: '#cbd5e1',
    paddingLeft: 16,
    flexDirection: 'column',
    gap: 4,
  },
  contactText: {
    fontFamily: 'Lora',
    fontSize: 12,
    color: '#374151',
    textAlign: 'left',
  },
  headerDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#059669',
    marginBottom: 36,
  },
  receiptHeadingContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  receiptHeading: {
    fontFamily: 'Lora',
    fontWeight: 'bold',
    fontSize: 26,
    color: '#065f46',
    letterSpacing: 1.5,
  },
  table: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 36,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#cbd5e1',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  cellHalf: {
    width: '50%',
    flexDirection: 'column',
  },
  cellBorderRight: {
    borderRightWidth: 1.5,
    borderRightColor: '#cbd5e1',
  },
  cellHeader: {
    backgroundColor: '#f3f4f6',
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  cellHeaderText: {
    fontFamily: 'Lora',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#111827',
    textTransform: 'uppercase',
  },
  cellValue: {
    backgroundColor: '#ffffff',
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  cellValueText: {
    fontFamily: 'Lora',
    fontSize: 12,
    color: '#1f2937',
  },
  footerSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  footerGreeting: {
    fontFamily: 'Lora',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#065f46',
    marginBottom: 6,
  },
  footerSubtitle: {
    fontFamily: 'Lora',
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 10,
  },
  bulletText: {
    fontFamily: 'Lora',
    fontSize: 12,
    color: '#4b5563',
  },
  bottomDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginTop: 20,
    marginBottom: 16,
  },
  copyrightText: {
    fontFamily: 'Lora',
    fontSize: 12,
    color: '#6b7280',
  },
});

export const DonationReceiptDocument = ({ data }: { data: DonationReceiptData }) => {
  const numericAmount = typeof data.donationAmount === 'number' ? data.donationAmount : parseFloat(data.donationAmount || '0');
  const inWords = data.inWords || numberToWords(numericAmount || 0);

  return (
    <Document>
      <Page size="A3" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              EMERGENCY DISASTER RESPONSE{'\n'}AND MANAGEMENT SYSTEM
            </Text>
          </View>
          <View style={styles.contactInfoContainer}>
            <Text style={styles.contactText}>support@edrms.org</Text>
            <Text style={styles.contactText}>Contact: 01123456789</Text>
            <Text style={styles.contactText}>Address: Bashundhara, Dhaka, Bangladesh</Text>
          </View>
        </View>

        <View style={styles.headerDivider} />

        <View style={styles.receiptHeadingContainer}>
          <Text style={styles.receiptHeading}>DONATION RECEIPT</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.cellHalf, styles.cellBorderRight]}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>RECEIPT NO</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{data.receiptNo || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.cellHalf}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>DATE</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{data.date || new Date().toLocaleDateString()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.cellHalf, styles.cellBorderRight]}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>RECEIVED FROM</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{data.receivedFrom || 'Anonymous'}</Text>
              </View>
            </View>
            <View style={styles.cellHalf}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>CONTACT</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{data.contact || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.cellHalf, styles.cellBorderRight]}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>DONATION AMOUNT</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>${Number(numericAmount).toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.cellHalf}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>IN WORDS</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{inWords}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.cellHalf, styles.cellBorderRight]}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>PAYMENT METHOD</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{data.paymentMethod || 'STRIPE'}</Text>
              </View>
            </View>
            <View style={styles.cellHalf}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>TRANSACTION ID</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{data.transactionId || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableRowLast}>
            <View style={[styles.cellHalf, styles.cellBorderRight]}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>DONATION CAMPAIGN TITLE</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{data.campaignTitle || 'General Relief Fund'}</Text>
              </View>
            </View>
            <View style={styles.cellHalf}>
              <View style={styles.cellHeader}>
                <Text style={styles.cellHeaderText}>RELIEF ORG</Text>
              </View>
              <View style={styles.cellValue}>
                <Text style={styles.cellValueText}>{data.reliefOrg || 'EDRMS Relief Committee'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerGreeting}>
            Thank you for your generosity and support.
          </Text>
          <Text style={styles.footerSubtitle}>
            Thank you for your contribution to mankind.
          </Text>

          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              This receipt has been produced by the system and does not need any signature.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>
              Donations are controlled by the relief organizations, and the EDRMS system does not take any ownership.
            </Text>
          </View>
        </View>

        <View style={styles.bottomDivider} />

        <Text style={styles.copyrightText}>
          &copy; 2025 Emergency Disaster Response and Management System. All rights reserved.
        </Text>
      </Page>
    </Document>
  );
};

export const generateDonationReceipt = async (data: DonationReceiptData) => {
  const blob = await pdf(<DonationReceiptDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Donation-Receipt-${data.receiptNo || 'EDRMS'}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default generateDonationReceipt;
