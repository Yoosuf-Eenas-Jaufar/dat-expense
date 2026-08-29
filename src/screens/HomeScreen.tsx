import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.month}>August 2026</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.label}>Spent this month</Text>
        <Text style={styles.amount}>MVR 0.00</Text>
      </View>

      <Text style={styles.sectionTitle}>Spending by Category</Text>
      <Text style={styles.emptyText}>No expenses yet.</Text>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <Text style={styles.emptyText}>
        Your recent expenses will appear here.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  month: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  amount: {
    fontSize: 30,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
  },
});