import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const currencies = ['MVR', 'USD', 'EUR'];

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [currency, setCurrency] = useState('MVR');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Expense</Text>

        <Text style={styles.label}>Amount</Text>

        <View style={styles.amountRow}>
          <View style={styles.currencyButtons}>
            {currencies.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.currencyButton,
                  currency === item && styles.currencyButtonSelected,
                ]}
                onPress={() => setCurrency(item)}
              >
                <Text
                  style={[
                    styles.currencyText,
                    currency === item && styles.currencyTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.label}>Merchant</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. BUZZ CORNER"
          value={merchant}
          onChangeText={setMerchant}
        />

        <Text style={styles.label}>Category</Text>

        <View style={styles.categoryBox}>
          <Text style={styles.categoryText}>Uncategorized</Text>
        </View>

        <Text style={styles.helperText}>
          Category selection will be connected to your custom categories next.
        </Text>

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Expense</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 30,
    color: '#111111',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 18,
  },

  amountRow: {
    gap: 12,
  },

  currencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  currencyButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#E8E8E8',
  },

  currencyButtonSelected: {
    backgroundColor: '#111111',
  },

  currencyText: {
    fontWeight: '600',
    color: '#444444',
  },

  currencyTextSelected: {
    color: '#FFFFFF',
  },

  amountInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
  },

  categoryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },

  categoryText: {
    fontSize: 16,
    color: '#222222',
  },

  helperText: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 18,
    marginTop: 8,
  },

  saveButton: {
    backgroundColor: '#111111',
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 34,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});