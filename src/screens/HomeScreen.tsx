import { useNavigation } from '@react-navigation/native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const currentMonth = new Date().toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.month}>{currentMonth}</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Spent this month</Text>
          <Text style={styles.totalAmount}>MVR 0.00</Text>

          <Text style={styles.transactionCount}>
            No transactions recorded yet
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
        </View>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No spending data yet</Text>
          <Text style={styles.emptyDescription}>
            Your category breakdown will appear here after expenses are
            recorded.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          <Pressable>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptyDescription}>
            Payments detected by Dat Expense and expenses you add manually
            will appear here.
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.addButtonText}>+ Add Expense</Text>
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

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  month: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 20,
  },

  summaryCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 22,
    marginBottom: 30,
  },

  summaryLabel: {
    fontSize: 15,
    color: '#CCCCCC',
    marginBottom: 8,
  },

  totalAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  transactionCount: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 10,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111111',
  },

  viewAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 6,
  },

  emptyDescription: {
    fontSize: 14,
    color: '#777777',
    lineHeight: 20,
  },

  addButton: {
    backgroundColor: '#111111',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});