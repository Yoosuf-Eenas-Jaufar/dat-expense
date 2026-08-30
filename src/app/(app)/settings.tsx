import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getAutomaticSmsDetectionEnabled,
  setAutomaticSmsDetectionEnabled,
} from '@/services/automatic-sms-settings';

import {
  hasSmsPermission,
  readCurrentMonth455Messages,
  requestSmsPermission,
} from '@/services/android-sms-reader';

import { importCurrentMonthMessages } from '@/services/current-month-import';
import { importPaymentMessage } from '@/services/payment-import';
import { parsePaymentMessage } from '@/services/transaction-parser';
import { useStores } from '@/stores';

function formatLastScan(dateString: string | null): string {
  if (!dateString) {
    return 'Not scanned yet';
  }

  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default observer(function SettingsScreen() {
  const { expense } = useStores();

  const [paymentMessage, setPaymentMessage] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  const [
    automaticDetectionEnabled,
    setAutomaticDetectionState,
  ] = useState(false);

  const [isChangingDetection, setIsChangingDetection] =
    useState(false);

  const [isScanning, setIsScanning] =
    useState(false);

  const [lastScanResult, setLastScanResult] =
    useState<string | null>(null);

  const parsedMessage =
    parsePaymentMessage(paymentMessage);

  const requiresExchangeRate =
    parsedMessage !== null &&
    parsedMessage.originalCurrency !== 'MVR';

  useEffect(() => {
    const loadAutomaticDetectionSetting =
      async () => {
        try {
          const enabled =
            await getAutomaticSmsDetectionEnabled();

          if (!enabled) {
            setAutomaticDetectionState(false);
            return;
          }

          const permissionGranted =
            await hasSmsPermission();

          if (!permissionGranted) {
            await setAutomaticSmsDetectionEnabled(
              false
            );

            setAutomaticDetectionState(false);

            return;
          }

          setAutomaticDetectionState(true);
        } catch (error) {
          console.warn(
            'Failed to load automatic SMS setting:',
            error
          );
        }
      };

    void loadAutomaticDetectionSetting();
  }, []);

  const scanCurrentMonthPayments =
    async () => {
      const messages =
        await readCurrentMonth455Messages();

      const result =
        await importCurrentMonthMessages(
          messages.map(
            message => message.body
          ),
          expense
        );

      setLastScanResult(
        `${result.imported} new · ` +
          `${result.alreadyScanned} already scanned`
      );

      return {
        messagesFound: messages.length,
        ...result,
      };
    };

  const ensureSmsPermission =
    async (): Promise<boolean> => {
      let permissionGranted =
        await hasSmsPermission();

      if (!permissionGranted) {
        permissionGranted =
          await requestSmsPermission();
      }

      return permissionGranted;
    };

  const handleManualScan = async () => {
    if (
      isScanning ||
      isChangingDetection
    ) {
      return;
    }

    try {
      setIsScanning(true);

      const permissionGranted =
        await ensureSmsPermission();

      if (!permissionGranted) {
        Alert.alert(
          'SMS access required',
          'SMS access is required to scan payment messages from 455.'
        );

        return;
      }

      const result =
        await scanCurrentMonthPayments();

      Alert.alert(
        'Scan complete',
        [
          `Messages from 455: ${result.messagesFound}`,
          `New transactions: ${result.imported}`,
          `Already scanned: ${result.alreadyScanned}`,
          `Invalid: ${result.invalid}`,
          `Exchange rate required: ${result.exchangeRateRequired}`,
        ].join('\n')
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The payment scan could not be completed.';

      Alert.alert(
        'Scan failed',
        message
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutomaticDetectionToggle =
    async (enabled: boolean) => {
      if (
        isChangingDetection ||
        isScanning
      ) {
        return;
      }

      try {
        setIsChangingDetection(true);

        if (!enabled) {
          await setAutomaticSmsDetectionEnabled(
            false
          );

          setAutomaticDetectionState(false);

          return;
        }

        const permissionGranted =
          await ensureSmsPermission();

        if (!permissionGranted) {
          await setAutomaticSmsDetectionEnabled(
            false
          );

          setAutomaticDetectionState(false);

          Alert.alert(
            'SMS access required',
            'Automatic SMS detection needs SMS access to read payment messages from 455.'
          );

          return;
        }

        await setAutomaticSmsDetectionEnabled(
          true
        );

        setAutomaticDetectionState(true);

        const result =
          await scanCurrentMonthPayments();

        if (result.imported > 0) {
          Alert.alert(
            'Payments detected',
            `${result.imported} new ${
              result.imported === 1
                ? 'transaction was'
                : 'transactions were'
            } added.`
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Automatic SMS detection could not be enabled.';

        await setAutomaticSmsDetectionEnabled(
          false
        );

        setAutomaticDetectionState(false);

        Alert.alert(
          'Unable to enable detection',
          message
        );
      } finally {
        setIsChangingDetection(false);
      }
    };

  const handleImport = () => {
    const rate =
      exchangeRate.trim().length > 0
        ? Number(
            exchangeRate
              .replace(/,/g, '')
              .trim()
          )
        : undefined;

    const result =
      importPaymentMessage(
        paymentMessage,
        expense,
        rate
      );

    if (!result.success) {
      Alert.alert(
        'Unable to import',
        result.message
      );

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
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Settings
        </Text>

        <Text style={styles.sectionTitle}>
          Payment Detection
        </Text>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View
              style={
                styles.settingTextContainer
              }
            >
              <Text style={styles.itemTitle}>
                Automatic SMS Detection
              </Text>

              <Text
                style={
                  styles.itemDescription
                }
              >
                Scan payment messages from
                455 when Dat Expense opens or
                returns to the foreground.
              </Text>
            </View>

            <Switch
              value={
                automaticDetectionEnabled
              }
              onValueChange={
                handleAutomaticDetectionToggle
              }
              disabled={
                isChangingDetection ||
                isScanning
              }
            />
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              Status
            </Text>

            <Text
              style={[
                styles.statusValue,
                automaticDetectionEnabled
                  ? styles.statusEnabled
                  : styles.statusDisabled,
              ]}
            >
              {isChangingDetection
                ? 'Updating...'
                : automaticDetectionEnabled
                  ? 'On'
                  : 'Off'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              Last scan
            </Text>

            <Text style={styles.statusValue}>
              {formatLastScan(
                expense.lastSuccessfulSmsScanAt
              )}
            </Text>
          </View>

          <Pressable
            style={[
              styles.scanButton,
              (isScanning ||
                isChangingDetection) &&
                styles.buttonDisabled,
            ]}
            onPress={handleManualScan}
            disabled={
              isScanning ||
              isChangingDetection
            }
          >
            <Text
              style={styles.scanButtonText}
            >
              {isScanning
                ? 'Scanning...'
                : 'Scan Payments Now'}
            </Text>
          </Pressable>

          <Text style={styles.scanHint}>
            Manual scanning works even when
            Automatic SMS Detection is turned
            off.
          </Text>

          {lastScanResult && (
            <Text style={styles.scanResult}>
              {lastScanResult}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>
            Base Currency
          </Text>

          <Text
            style={styles.itemDescription}
          >
            MVR
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Import Payment Message
        </Text>

        <Text
          style={styles.sectionDescription}
        >
          Paste a supported payment message
          from 455 to manually test the
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
              <Text
                style={styles.previewTitle}
              >
                Detected Transaction
              </Text>

              <View style={styles.previewRow}>
                <Text
                  style={
                    styles.previewLabel
                  }
                >
                  Merchant
                </Text>

                <Text
                  style={
                    styles.previewValue
                  }
                >
                  {parsedMessage.merchant}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text
                  style={
                    styles.previewLabel
                  }
                >
                  Amount
                </Text>

                <Text
                  style={
                    styles.previewValue
                  }
                >
                  {
                    parsedMessage.originalCurrency
                  }{' '}
                  {parsedMessage.originalAmount.toFixed(
                    2
                  )}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text
                  style={
                    styles.previewLabel
                  }
                >
                  Account
                </Text>

                <Text
                  style={
                    styles.previewValue
                  }
                >
                  ••••{' '}
                  {
                    parsedMessage.accountSuffix
                  }
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text
                  style={
                    styles.previewLabel
                  }
                >
                  Reference
                </Text>

                <Text
                  style={
                    styles.previewValue
                  }
                >
                  {
                    parsedMessage.referenceNumber
                  }
                </Text>
              </View>
            </View>
          )}

          {requiresExchangeRate &&
            parsedMessage && (
              <View
                style={
                  styles.exchangeSection
                }
              >
                <Text
                  style={
                    styles.exchangeLabel
                  }
                >
                  Exchange Rate
                </Text>

                <Text
                  style={
                    styles.exchangeHint
                  }
                >
                  Enter how many MVR equal
                  1{' '}
                  {
                    parsedMessage.originalCurrency
                  }.
                </Text>

                <View
                  style={styles.exchangeRow}
                >
                  <Text
                    style={
                      styles.exchangePrefix
                    }
                  >
                    MVR
                  </Text>

                  <TextInput
                    style={
                      styles.exchangeInput
                    }
                    value={exchangeRate}
                    onChangeText={
                      setExchangeRate
                    }
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
              paymentMessage
                .trim()
                .length === 0 &&
                styles.buttonDisabled,
            ]}
            onPress={handleImport}
            disabled={
              paymentMessage.trim()
                .length === 0
            }
          >
            <Text
              style={
                styles.importButtonText
              }
            >
              Import Transaction
            </Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Already Scanned Protection
          </Text>

          <Text style={styles.infoText}>
            Dat Expense uses each payment's
            Reference No. to recognize messages
            already scanned and prevents them
            from being saved twice.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>
            About
          </Text>

          <Text
            style={styles.itemDescription}
          >
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

  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
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

  card: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingTextContainer: {
    flex: 1,
    marginRight: 14,
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

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
  },

  statusLabel: {
    color: '#777777',
    fontSize: 12,
  },

  statusValue: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '600',
  },

  statusEnabled: {
    color: '#2E7D32',
  },

  statusDisabled: {
    color: '#777777',
  },

  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingVertical: 14,
  },

  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  scanHint: {
    marginTop: 8,
    color: '#888888',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },

  scanResult: {
    marginTop: 10,
    color: '#666666',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
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

  importButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  buttonDisabled: {
    opacity: 0.4,
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