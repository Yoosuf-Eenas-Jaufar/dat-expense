import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { importPaymentMessage } from '@/services/payment-import';
import { parsePaymentMessage } from '@/services/transaction-parser';
import { useStores } from '@/stores';

export default observer(function SettingsScreen() {
  const { expense } = useStores();

  const [paymentMessage, setPaymentMessage] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  const parsedMessage = parsePaymentMessage(paymentMessage);

  const requiresExchangeRate =
    parsedMessage !== null &&
    parsedMessage.originalCurrency !== 'MVR';

  const handleImport = () => {
    const rate =
      exchangeRate.trim().length > 0
        ? Number(exchangeRate.replace(/,/g, '').trim())
        : undefined;

    const result = importPaymentMessage(
      paymentMessage,
      expense,
      rate
    );

    if (!result.success) {
      Alert.alert('Unable to import', result.message);
      return;
    }

    Alert.alert(
      'Payment imported',
      `${result.merchant} was added to your transactions.`
    );

    setPaymentMessage('');
    setExchangeRate('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Payment Detection</Text>

          <Text style={styles.itemDescription}>
            Automatic Android payment detection will be connected later.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Base Currency</Text>
          <Text style={styles.itemDescription}>MVR</Text>
        </View>

        <Text style={styles.sectionTitle}>Import Payment Message</Text>

        <Text style={styles.sectionDescription}>
          Paste a supported payment message from 455 to test Dat Expense's
          transaction parser.
        </Text>

        <View style={styles.importCard}>
          <TextInput
            style={styles.messageInput}
            value={paymentMessage}
            onChangeText={setPaymentMessage}
            placeholder="Paste a 455 transaction message here..."
            placeholderTextColor="#999999"
            multiline
            textAlignVertical="top"
          />

          {parsedMessage && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Detected Transaction</Text>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Merchant</Text>
                <Text style={styles.previewValue}>
                  {parsedMessage.merchant}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Amount</Text>
                <Text style={styles.previewValue}>
                  {parsedMessage.originalCurrency}{' '}
                  {parsedMessage.originalAmount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Account</Text>
                <Text style={styles.previewValue}>
                  •••• {parsedMessage.accountSuffix}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Reference</Text>
                <Text style={styles.previewValue}>
                  {parsedMessage.referenceNumber}
                </Text>
              </View>
            </View>
          )}

          {requiresExchangeRate && parsedMessage && (
            <View style={styles.exchangeSection}>
              <Text style={styles.exchangeLabel}>
                Exchange Rate
              </Text>

              <Text style={styles.exchangeHint}>
                Enter how many MVR equal 1{' '}
                {parsedMessage.originalCurrency}.
              </Text>

              <View style={styles.exchangeRow}>
                <Text style={styles.exchangePrefix}>MVR</Text>

                <TextInput
                  style={styles.exchangeInput}
                  value={exchangeRate}
                  onChangeText={setExchangeRate}
                  placeholder="0.00"
                  placeholderTextColor="#999999"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}

          <Pressable
            style={[
              styles.importButton,
              paymentMessage.trim().length === 0 &&
                styles.importButtonDisabled,
            ]}
            onPress={handleImport}
            disabled={paymentMessage.trim().length === 0}
          >
            <Text style={styles.importButtonText}>
              Import Transaction
            </Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Duplicate Protection</Text>

          <Text style={styles.infoText}>
            Dat Expense uses each payment's Reference No. to prevent the same
            transaction from being saved more than once.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>About</Text>

          <Text style={styles.itemDescription}>
            Dat Expense version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    marginBottom: 24,
    color: '#111111',
    fontSize: 26,
    fontWeight: '700',
  },

  card: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  itemTitle: {
    marginBottom: 6,
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },

  itemDescription: {
    color: '#777777',
    fontSize: 14,
    lineHeight: 20,
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 6,
    color: '#111111',
    fontSize: 19,
    fontWeight: '700',
  },

  sectionDescription: {
    marginBottom: 12,
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
  },

  importCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  messageInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    color: '#111111',
    fontSize: 14,
    lineHeight: 20,
  },

  previewCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    padding: 14,
  },

  previewTitle: {
    marginBottom: 10,
    color: '#222222',
    fontSize: 14,
    fontWeight: '700',
  },

  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  previewLabel: {
    color: '#777777',
    fontSize: 12,
  },

  previewValue: {
    flex: 1,
    marginLeft: 20,
    color: '#222222',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },

  exchangeSection: {
    marginTop: 16,
  },

  exchangeLabel: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },

  exchangeHint: {
    marginTop: 4,
    marginBottom: 10,
    color: '#777777',
    fontSize: 12,
  },

  exchangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  exchangePrefix: {
    marginRight: 10,
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },

  exchangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111111',
    fontSize: 16,
  },

  importButton: {
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingVertical: 14,
  },

  importButtonDisabled: {
    opacity: 0.4,
  },

  importButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  infoCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#EBF3FF',
    padding: 18,
  },

  infoTitle: {
    marginBottom: 6,
    color: '#17375E',
    fontSize: 14,
    fontWeight: '700',
  },

  infoText: {
    color: '#45627E',
    fontSize: 12,
    lineHeight: 18,
  },
});