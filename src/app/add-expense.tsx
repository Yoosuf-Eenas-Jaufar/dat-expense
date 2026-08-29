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

import {
  UNCATEGORIZED_CATEGORY_ID,
} from '@/stores/expense-store';
import { useStores } from '@/stores';

import type { Currency } from '@/types/expense';

const CURRENCIES: Currency[] = ['MVR', 'USD', 'EUR'];

function getTodayString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseTransactionDate(dateText: string): Date | null {
  const match = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;

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

export default observer(function AddExpenseScreen() {
  const { expense } = useStores();

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [currency, setCurrency] = useState<Currency>('MVR');

  const [categoryId, setCategoryId] = useState(
    UNCATEGORIZED_CATEGORY_ID
  );

  const [date, setDate] = useState(getTodayString());

  const [exchangeRate, setExchangeRate] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);

    if (newCurrency === 'MVR') {
      setExchangeRate('');
    }
  };

  const handleSave = () => {
    if (isSaving) {
      return;
    }

    const parsedAmount = Number(amount.replace(/,/g, '').trim());

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(
        'Invalid amount',
        'Enter an amount greater than zero.'
      );
      return;
    }

    const cleanMerchant = merchant.replace(/\s+/g, ' ').trim();

    if (!cleanMerchant) {
      Alert.alert(
        'Merchant required',
        'Enter the merchant or place where the expense was made.'
      );
      return;
    }

    const transactionDate = parseTransactionDate(date.trim());

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
        exchangeRate.replace(/,/g, '').trim()
      );

      if (!Number.isFinite(rateToMVR) || rateToMVR <= 0) {
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
        exchangeRateToMVR: rateToMVR,
        merchant: cleanMerchant,
        categoryId,
        transactionDateTime: transactionDate.toISOString(),
      });

      router.back();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The expense could not be saved.';

      Alert.alert('Unable to save expense', message);

      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Text style={styles.title}>Add Expense</Text>

            <View style={styles.headerButton} />
          </View>

          <Text style={styles.label}>Amount</Text>

          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#AAAAAA"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Currency</Text>

          <View style={styles.currencyRow}>
            {CURRENCIES.map(item => {
              const selected = currency === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.currencyButton,
                    selected && styles.currencyButtonSelected,
                  ]}
                  onPress={() => handleCurrencyChange(item)}
                >
                  <Text
                    style={[
                      styles.currencyText,
                      selected && styles.currencyTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {currency !== 'MVR' && (
            <>
              <Text style={styles.label}>
                Exchange Rate
              </Text>

              <View style={styles.card}>
                <Text style={styles.exchangeDescription}>
                  1 {currency} =
                </Text>

                <View style={styles.exchangeInputRow}>
                  <Text style={styles.exchangePrefix}>MVR</Text>

                  <TextInput
                    style={styles.exchangeInput}
                    value={exchangeRate}
                    onChangeText={setExchangeRate}
                    placeholder="0.00"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="decimal-pad"
                  />
                </View>

                <Text style={styles.helperText}>
                  The rate used will be saved with this expense.
                </Text>
              </View>
            </>
          )}

          <Text style={styles.label}>Merchant</Text>

          <TextInput
            style={styles.textInput}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="e.g. SJ MALL"
            placeholderTextColor="#AAAAAA"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Category</Text>

          <View style={styles.categoriesContainer}>
            {expense.categories.map(category => {
              const selected = categoryId === category.id;

              return (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selected && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor: category.color,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.categoryButtonText,
                      selected && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Transaction Date</Text>

          <TextInput
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#AAAAAA"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.dateHint}>
            Format: YYYY-MM-DD
          </Text>

          <Pressable
            style={[
              styles.saveButton,
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Expense'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

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
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  headerButton: {
    width: 60,
  },

  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },

  title: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '700',
  },

  label: {
    marginTop: 18,
    marginBottom: 8,
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },

  amountInput: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 18,
    color: '#111111',
    fontSize: 30,
    fontWeight: '700',
  },

  textInput: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: '#111111',
    fontSize: 16,
  },

  currencyRow: {
    flexDirection: 'row',
    gap: 10,
  },

  currencyButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
  },

  currencyButtonSelected: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },

  currencyText: {
    color: '#555555',
    fontSize: 15,
    fontWeight: '600',
  },

  currencyTextSelected: {
    color: '#FFFFFF',
  },

  card: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },

  exchangeDescription: {
    marginBottom: 10,
    color: '#555555',
    fontSize: 14,
  },

  exchangeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  exchangePrefix: {
    marginRight: 10,
    color: '#222222',
    fontSize: 18,
    fontWeight: '600',
  },

  exchangeInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 8,
    color: '#111111',
    fontSize: 20,
    fontWeight: '600',
  },

  helperText: {
    marginTop: 10,
    color: '#888888',
    fontSize: 12,
  },

  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 10,
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
    fontSize: 13,
    fontWeight: '500',
  },

  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },

  dateHint: {
    marginTop: 6,
    color: '#999999',
    fontSize: 12,
  },

  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    borderRadius: 16,
    backgroundColor: '#111111',
    paddingVertical: 17,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});