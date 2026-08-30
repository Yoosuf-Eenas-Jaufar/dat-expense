import Ionicons from '@expo/vector-icons/Ionicons';
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
} from '../../services/automatic-sms-settings';

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

  const [paymentMessage, setPaymentMessage] =
    useState('');

  const [exchangeRate, setExchangeRate] =
    useState('');

  const [
    automaticDetectionEnabled,
    setAutomaticDetectionState,
  ] = useState(false);

  const [
    isChangingDetection,
    setIsChangingDetection,
  ] = useState(false);

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
            (message: { body: string }) =>
              message.body
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
        <View style={styles.header}>
          <Text style={styles.title}>
            Settings
          </Text>

          <Text style={styles.subtitle}>
            Payment detection and app preferences
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Payment Detection
        </Text>

        <View style={styles.card}>
          <View style={styles.detectionHeader}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={22}
                color="#555555"
              />
            </View>

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
                Scan payment messages from 455
                when Dat Expense opens or returns
                to the foreground.
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

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Ionicons
                name="radio-button-on-outline"
                size={15}
                color="#888888"
              />

              <Text style={styles.statusLabel}>
                Automatic detection
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                automaticDetectionEnabled
                  ? styles.statusBadgeEnabled
                  : styles.statusBadgeDisabled,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  automaticDetectionEnabled
                    ? styles.statusEnabledText
                    : styles.statusDisabledText,
                ]}
              >
                {isChangingDetection
                  ? 'Updating'
                  : automaticDetectionEnabled
                    ? 'On'
                    : 'Off'}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Ionicons
                name="time-outline"
                size={15}
                color="#888888"
              />

              <Text style={styles.statusLabel}>
                Last scan
              </Text>
            </View>

            <Text style={styles.statusValue}>
              {formatLastScan(
                expense.lastSuccessfulSmsScanAt
              )}
            </Text>
          </View>

          <Pressable
            onPress={handleManualScan}
            disabled={
              isScanning ||
              isChangingDetection
            }
            style={[
              styles.scanButton,
              (isScanning ||
                isChangingDetection) &&
                styles.scanButtonDisabled,
            ]}
          >
            <Ionicons
              name={
                isScanning
                  ? 'sync-outline'
                  : 'scan-outline'
              }
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={styles.scanButtonText}
            >
              {isScanning
                ? 'Scanning...'
                : 'Scan Payments Now'}
            </Text>
          </Pressable>

          <Text style={styles.scanHint}>
            You can scan manually even when
            Automatic SMS Detection is turned off.
          </Text>

          {lastScanResult && (
            <View style={styles.scanResultBox}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#55745A"
              />

              <Text style={styles.scanResult}>
                {lastScanResult}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Preferences
        </Text>

        <View style={styles.preferenceCard}>
          <View style={styles.preferenceIcon}>
            <Ionicons
              name="cash-outline"
              size={21}
              color="#555555"
            />
          </View>

          <View style={styles.preferenceText}>
            <Text style={styles.itemTitle}>
              Base Currency
            </Text>

            <Text
              style={styles.itemDescription}
            >
              All spending totals are shown in MVR.
            </Text>
          </View>

          <View style={styles.currencyBadge}>
            <Text
              style={styles.currencyBadgeText}
            >
              MVR
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Manual Message Import
        </Text>

        <Text
          style={styles.sectionDescription}
        >
          Paste a supported payment SMS from 455
          to import it manually.
        </Text>

        <View style={styles.importCard}>
          <View style={styles.importHeader}>
            <View style={styles.importIcon}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#555555"
              />
            </View>

            <View style={styles.importHeaderText}>
              <Text style={styles.importTitle}>
                Payment Message
              </Text>

              <Text
                style={styles.importDescription}
              >
                Dat Expense will detect the
                merchant, amount and reference.
              </Text>
            </View>
          </View>

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
              <View style={styles.previewHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#55745A"
                />

                <Text
                  style={styles.previewTitle}
                >
                  Transaction detected
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text
                  style={styles.previewLabel}
                >
                  Merchant
                </Text>

                <Text
                  style={styles.previewValue}
                >
                  {parsedMessage.merchant}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text
                  style={styles.previewLabel}
                >
                  Amount
                </Text>

                <Text
                  style={styles.previewValue}
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
                  style={styles.previewLabel}
                >
                  Account
                </Text>

                <Text
                  style={styles.previewValue}
                >
                  ••••{' '}
                  {
                    parsedMessage.accountSuffix
                  }
                </Text>
              </View>

              <View
                style={[
                  styles.previewRow,
                  styles.lastPreviewRow,
                ]}
              >
                <Text
                  style={styles.previewLabel}
                >
                  Reference
                </Text>

                <Text
                  style={styles.previewValue}
                  numberOfLines={1}
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
                  Enter how many MVR equal 1{' '}
                  {
                    parsedMessage.originalCurrency
                  }.
                </Text>

                <View
                  style={styles.exchangeRow}
                >
                  <View
                    style={
                      styles.exchangePrefixBox
                    }
                  >
                    <Text
                      style={
                        styles.exchangePrefix
                      }
                    >
                      MVR
                    </Text>
                  </View>

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
            <Ionicons
              name="download-outline"
              size={18}
              color="#FFFFFF"
            />

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
          <View style={styles.infoIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#45627E"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Already scanned protection
            </Text>

            <Text style={styles.infoText}>
              Dat Expense uses each payment's
              Reference No. to recognize messages
              that have already been scanned and
              prevents them from being saved twice.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          About
        </Text>

        <View style={styles.aboutCard}>
          <View style={styles.aboutIcon}>
            <Ionicons
              name="wallet-outline"
              size={23}
              color="#555555"
            />
          </View>

          <View style={styles.aboutText}>
            <Text style={styles.itemTitle}>
              Dat Expense
            </Text>

            <Text
              style={styles.itemDescription}
            >
              Expense tracking with SMS payment
              detection.
            </Text>
          </View>

          <Text style={styles.versionText}>
            v1.0.0
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

  header: {
    marginBottom: 28,
  },

  title: {
    color: '#111111',
    fontSize: 27,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 4,
    color: '#888888',
    fontSize: 13,
  },

  sectionTitle: {
    marginBottom: 9,
    color: '#111111',
    fontSize: 19,
    fontWeight: '700',
  },

  sectionDescription: {
    marginTop: -2,
    marginBottom: 12,
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
  },

  card: {
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  detectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    marginRight: 12,
    borderRadius: 13,
    backgroundColor: '#F2F2F2',
  },

  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },

  itemTitle: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  itemDescription: {
    marginTop: 4,
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 17,
    marginBottom: 2,
    backgroundColor: '#ECECEC',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },

  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusLabel: {
    marginLeft: 7,
    color: '#777777',
    fontSize: 12,
  },

  statusValue: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '600',
  },

  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  statusBadgeEnabled: {
    backgroundColor: '#EDF6EE',
  },

  statusBadgeDisabled: {
    backgroundColor: '#F1F1F1',
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  statusEnabledText: {
    color: '#437447',
  },

  statusDisabledText: {
    color: '#777777',
  },

  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
    marginTop: 14,
    borderRadius: 13,
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  scanButtonText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  scanButtonDisabled: {
    opacity: 0.45,
  },

  scanHint: {
    marginTop: 8,
    color: '#999999',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },

  scanResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#F2F7F2',
    padding: 10,
  },

  scanResult: {
    marginLeft: 6,
    color: '#55745A',
    fontSize: 11,
    fontWeight: '600',
  },

  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  preferenceIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
  },

  preferenceText: {
    flex: 1,
    marginRight: 12,
  },

  currencyBadge: {
    borderRadius: 9,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  currencyBadgeText: {
    color: '#444444',
    fontSize: 11,
    fontWeight: '700',
  },

  importCard: {
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  importHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  importIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginRight: 11,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
  },

  importHeaderText: {
    flex: 1,
  },

  importTitle: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  importDescription: {
    marginTop: 3,
    color: '#888888',
    fontSize: 11,
    lineHeight: 16,
  },

  messageInput: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    padding: 14,
    color: '#111111',
    fontSize: 13,
    lineHeight: 19,
  },

  previewCard: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#F5F7F5',
    padding: 14,
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  previewTitle: {
    marginLeft: 6,
    color: '#445E47',
    fontSize: 13,
    fontWeight: '700',
  },

  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E8E4',
    paddingVertical: 7,
  },

  lastPreviewRow: {
    borderBottomWidth: 0,
  },

  previewLabel: {
    color: '#888888',
    fontSize: 11,
  },

  previewValue: {
    flex: 1,
    marginLeft: 20,
    color: '#333333',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },

  exchangeSection: {
    marginTop: 16,
  },

  exchangeLabel: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '600',
  },

  exchangeHint: {
    marginTop: 4,
    marginBottom: 10,
    color: '#888888',
    fontSize: 11,
  },

  exchangeRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  exchangePrefixBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#E0E0E0',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 12,
  },

  exchangePrefix: {
    color: '#555555',
    fontSize: 13,
    fontWeight: '700',
  },

  exchangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#111111',
    fontSize: 14,
  },

  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingVertical: 14,
  },

  importButtonText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  infoCard: {
    flexDirection: 'row',
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#EBF3FF',
    padding: 18,
  },

  infoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    marginBottom: 5,
    color: '#17375E',
    fontSize: 14,
    fontWeight: '700',
  },

  infoText: {
    color: '#45627E',
    fontSize: 12,
    lineHeight: 18,
  },

  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  aboutIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    marginRight: 12,
    borderRadius: 13,
    backgroundColor: '#F2F2F2',
  },

  aboutText: {
    flex: 1,
  },

  versionText: {
    marginLeft: 12,
    color: '#999999',
    fontSize: 11,
    fontWeight: '600',
  },
});