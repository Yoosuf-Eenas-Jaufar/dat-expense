import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStores } from '@/stores';
import { UNCATEGORIZED_CATEGORY_ID } from '@/stores/expense-store';
import type { Currency } from '@/types/expense';

const CURRENCIES: Currency[] = ['MVR', 'USD', 'EUR'];

function getTodayString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');
  const day = String(
    now.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseTransactionDate(
  dateText: string
): Date | null {
  const match = dateText.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] =
    match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const now = new Date();

  const date = new Date(
    year,
    month - 1,
    day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export default observer(
  function AddExpenseScreen() {
    const { expense } = useStores();

    const [amount, setAmount] =
      useState('');

    const [merchant, setMerchant] =
      useState('');

    const [currency, setCurrency] =
      useState<Currency>('MVR');

    const [categoryId, setCategoryId] =
      useState(
        UNCATEGORIZED_CATEGORY_ID
      );

    const [date, setDate] =
      useState(getTodayString());

    const [exchangeRate, setExchangeRate] =
      useState('');

    const [isSaving, setIsSaving] =
      useState(false);

    const handleCurrencyChange = (
      newCurrency: Currency
    ) => {
      setCurrency(newCurrency);

      if (newCurrency === 'MVR') {
        setExchangeRate('');
      }
    };

    const handleSave = () => {
      if (isSaving) {
        return;
      }

      const parsedAmount = Number(
        amount
          .replace(/,/g, '')
          .trim()
      );

      if (
        !Number.isFinite(parsedAmount) ||
        parsedAmount <= 0
      ) {
        Alert.alert(
          'Invalid amount',
          'Enter an amount greater than zero.'
        );

        return;
      }

      const cleanMerchant = merchant
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanMerchant) {
        Alert.alert(
          'Merchant required',
          'Enter the merchant or place where the expense was made.'
        );

        return;
      }

      const transactionDate =
        parseTransactionDate(
          date.trim()
        );

      if (!transactionDate) {
        Alert.alert(
          'Invalid date',
          'Enter the date in YYYY-MM-DD format.'
        );

        return;
      }

      let rateToMVR = 1;

      if (currency !== 'MVR') {
        rateToMVR = Number(
          exchangeRate
            .replace(/,/g, '')
            .trim()
        );

        if (
          !Number.isFinite(rateToMVR) ||
          rateToMVR <= 0
        ) {
          Alert.alert(
            'Exchange rate required',
            `Enter how many MVR equal 1 ${currency}.`
          );

          return;
        }
      }

      try {
        setIsSaving(true);

        expense.addManualExpense({
          amount: parsedAmount,
          currency,
          exchangeRateToMVR:
            rateToMVR,
          merchant: cleanMerchant,
          categoryId,
          transactionDateTime:
            transactionDate.toISOString(),
        });

        router.back();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'The expense could not be saved.';

        Alert.alert(
          'Unable to save expense',
          message
        );

        setIsSaving(false);
      }
    };

    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom']}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={
              styles.content
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
          >
            <View style={styles.header}>
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
                onPress={() =>
                  router.back()
                }
                hitSlop={8}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#333333"
                />
              </Pressable>

              <View
                style={
                  styles.headerTextContainer
                }
              >
                <Text style={styles.title}>
                  Add Expense
                </Text>

                <Text style={styles.subtitle}>
                  Record a transaction manually
                </Text>
              </View>

              <View
                style={
                  styles.headerPlaceholder
                }
              />
            </View>

            <Text style={styles.sectionTitle}>
              Amount
            </Text>

            <View style={styles.amountCard}>
              <Text style={styles.amountCurrency}>
                {currency}
              </Text>

              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#B0B0B0"
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.fieldLabel}>
              Currency
            </Text>

            <View style={styles.currencyRow}>
              {CURRENCIES.map(item => {
                const selected =
                  currency === item;

                return (
                  <Pressable
                    key={item}
                    style={({ pressed }) => [
                      styles.currencyButton,
                      selected &&
                        styles.currencyButtonSelected,
                      pressed &&
                        styles.buttonPressed,
                    ]}
                    onPress={() =>
                      handleCurrencyChange(
                        item
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        selected &&
                          styles.currencyTextSelected,
                      ]}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {currency !== 'MVR' && (
              <View
                style={
                  styles.exchangeCard
                }
              >
                <View
                  style={
                    styles.exchangeHeader
                  }
                >
                  <View
                    style={
                      styles.exchangeIcon
                    }
                  >
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={19}
                      color="#555555"
                    />
                  </View>

                  <View
                    style={
                      styles.exchangeHeaderText
                    }
                  >
                    <Text
                      style={
                        styles.exchangeTitle
                      }
                    >
                      Exchange Rate
                    </Text>

                    <Text
                      style={
                        styles.exchangeDescription
                      }
                    >
                      Enter the MVR value
                      used for this expense.
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.exchangeEquation
                  }
                >
                  <Text
                    style={
                      styles.exchangeEquationText
                    }
                  >
                    1 {currency}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color="#888888"
                  />

                  <View
                    style={
                      styles.exchangeInputContainer
                    }
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
                      value={
                        exchangeRate
                      }
                      onChangeText={
                        setExchangeRate
                      }
                      placeholder="0.00"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="information-circle-outline"
                    size={15}
                    color="#888888"
                  />

                  <Text
                    style={
                      styles.helperText
                    }
                  >
                    This rate will be saved
                    permanently with the
                    expense.
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>
              Expense Details
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>
                Merchant
              </Text>

              <View style={styles.inputRow}>
                <Ionicons
                  name="storefront-outline"
                  size={19}
                  color="#888888"
                />

                <TextInput
                  style={styles.textInput}
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="e.g. SJ MALL"
                  placeholderTextColor="#AAAAAA"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.formDivider} />

              <Text style={styles.fieldLabel}>
                Transaction Date
              </Text>

              <View style={styles.inputRow}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#888888"
                />

                <TextInput
                  style={styles.textInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numbers-and-punctuation"
                />
              </View>

              <Text style={styles.dateHint}>
                Format: YYYY-MM-DD
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              Category
            </Text>

            <Text
              style={styles.sectionDescription}
            >
              Choose how this expense should
              be grouped.
            </Text>

            <View
              style={
                styles.categoriesContainer
              }
            >
              {expense.categories.map(
                category => {
                  const selected =
                    categoryId ===
                    category.id;

                  return (
                    <Pressable
                      key={category.id}
                      style={({ pressed }) => [
                        styles.categoryButton,
                        selected &&
                          styles.categoryButtonSelected,
                        pressed &&
                          styles.buttonPressed,
                      ]}
                      onPress={() =>
                        setCategoryId(
                          category.id
                        )
                      }
                    >
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor:
                              category.color,
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.categoryButtonText,
                          selected &&
                            styles.categoryButtonTextSelected,
                        ]}
                      >
                        {category.name}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color="#FFFFFF"
                        />
                      )}
                    </Pressable>
                  );
                }
              )}
            </View>

            <Pressable
              style={[
                styles.saveButton,
                isSaving &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Ionicons
                name={
                  isSaving
                    ? 'hourglass-outline'
                    : 'checkmark-circle-outline'
                }
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.saveButtonText
                }
              >
                {isSaving
                  ? 'Saving...'
                  : 'Save Expense'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },

  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },

  headerPlaceholder: {
    width: 40,
  },

  title: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 3,
    color: '#888888',
    fontSize: 11,
  },

  sectionTitle: {
    marginBottom: 8,
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

  fieldLabel: {
    marginBottom: 8,
    color: '#444444',
    fontSize: 12,
    fontWeight: '600',
  },

  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  amountCurrency: {
    marginRight: 11,
    color: '#888888',
    fontSize: 15,
    fontWeight: '700',
  },

  amountInput: {
    flex: 1,
    padding: 0,
    color: '#111111',
    fontSize: 32,
    fontWeight: '700',
  },

  currencyRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 28,
  },

  currencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },

  currencyButtonSelected: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },

  currencyText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '700',
  },

  currencyTextSelected: {
    marginRight: 5,
    color: '#FFFFFF',
  },

  exchangeCard: {
    marginTop: -10,
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  exchangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  exchangeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginRight: 11,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
  },

  exchangeHeaderText: {
    flex: 1,
  },

  exchangeTitle: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '700',
  },

  exchangeDescription: {
    marginTop: 3,
    color: '#888888',
    fontSize: 11,
  },

  exchangeEquation: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  exchangeEquationText: {
    marginRight: 10,
    color: '#444444',
    fontSize: 14,
    fontWeight: '600',
  },

  exchangeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 11,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
  },

  exchangePrefix: {
    marginRight: 8,
    color: '#777777',
    fontSize: 12,
    fontWeight: '700',
  },

  exchangeInput: {
    flex: 1,
    paddingVertical: 11,
    color: '#111111',
    fontSize: 15,
    fontWeight: '600',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  helperText: {
    flex: 1,
    marginLeft: 6,
    color: '#888888',
    fontSize: 10,
    lineHeight: 15,
  },

  formCard: {
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E4',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 13,
  },

  textInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 13,
    color: '#111111',
    fontSize: 14,
  },

  formDivider: {
    height: 18,
  },

  dateHint: {
    marginTop: 6,
    color: '#999999',
    fontSize: 10,
  },

  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 30,
  },

  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  categoryButtonSelected: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },

  categoryDot: {
    width: 8,
    height: 8,
    marginRight: 7,
    borderRadius: 4,
  },

  categoryButtonText: {
    color: '#444444',
    fontSize: 12,
    fontWeight: '500',
  },

  categoryButtonTextSelected: {
    marginRight: 4,
    color: '#FFFFFF',
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#111111',
    paddingVertical: 16,
  },

  saveButtonDisabled: {
    opacity: 0.55,
  },

  saveButtonText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  buttonPressed: {
    opacity: 0.75,
  },
});