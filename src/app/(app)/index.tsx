import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStores } from '@/stores';

function formatMVR(amount: number): string {
  return `MVR ${amount.toFixed(2)}`;
}

function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

export default observer(function HomeScreen() {
  const { expense } = useStores();

  const currentMonth = new Date().toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const categoryTotals = expense.currentMonthExpenses.reduce<
    Record<string, number>
  >((totals, transaction) => {
    totals[transaction.categoryId] =
      (totals[transaction.categoryId] ?? 0) + transaction.amountMVR;

    return totals;
  }, {});

  const spendingByCategory = Object.entries(categoryTotals)
    .map(([categoryId, total]) => ({
      category: expense.getCategory(categoryId),
      total,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.month}>{currentMonth}</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Spent this month</Text>

          <Text style={styles.totalAmount}>
            {formatMVR(expense.currentMonthTotalMVR)}
          </Text>

          <Text style={styles.summaryHint}>
            {expense.currentMonthExpenses.length === 0
              ? 'No transactions recorded yet'
              : `${expense.currentMonthExpenses.length} ${
                  expense.currentMonthExpenses.length === 1
                    ? 'transaction'
                    : 'transactions'
                } this month`}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Spending by Category</Text>

        {spendingByCategory.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No spending data yet</Text>

            <Text style={styles.emptyText}>
              Your category breakdown will appear here after expenses are
              recorded.
            </Text>
          </View>
        ) : (
          <View style={styles.categoryCard}>
            {spendingByCategory.map(({ category, total }, index) => (
              <View
                key={category?.id ?? `category-${index}`}
                style={[
                  styles.categoryRow,
                  index === spendingByCategory.length - 1 &&
                    styles.lastCategoryRow,
                ]}
              >
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor: category?.color ?? '#8E8E93',
                      },
                    ]}
                  />

                  <Text style={styles.categoryName}>
                    {category?.name ?? 'Uncategorized'}
                  </Text>
                </View>

                <Text style={styles.categoryAmount}>
                  {formatMVR(total)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {expense.recentTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No transactions yet</Text>

            <Text style={styles.emptyText}>
              Detected payments and manually added expenses will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsCard}>
            {expense.recentTransactions.map((transaction, index) => {
              const category = expense.getCategory(transaction.categoryId);

              return (
                <View
                  key={transaction.id}
                  style={[
                    styles.transactionRow,
                    index === expense.recentTransactions.length - 1 &&
                      styles.lastTransactionRow,
                  ]}
                >
                  <View style={styles.transactionLeft}>
                    <Text style={styles.merchant} numberOfLines={1}>
                      {transaction.merchant}
                    </Text>

                    <Text style={styles.transactionDetails}>
                      {category?.name ?? 'Uncategorized'} ·{' '}
                      {formatTransactionDate(transaction.transactionDateTime)}
                    </Text>
                  </View>

                  <View style={styles.transactionAmountContainer}>
                    <Text style={styles.transactionAmount}>
                      {formatMVR(transaction.amountMVR)}
                    </Text>

                    {transaction.originalCurrency !== 'MVR' && (
                      <Text style={styles.originalAmount}>
                        {transaction.originalCurrency}{' '}
                        {transaction.originalAmount.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/add-expense')}
        >
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </Pressable>
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

  month: {
    marginBottom: 20,
    color: '#111111',
    fontSize: 26,
    fontWeight: '700',
  },

  summaryCard: {
    marginBottom: 30,
    borderRadius: 20,
    backgroundColor: '#111111',
    padding: 22,
  },

  summaryLabel: {
    marginBottom: 8,
    color: '#CCCCCC',
    fontSize: 15,
  },

  totalAmount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
  },

  summaryHint: {
    marginTop: 10,
    color: '#AAAAAA',
    fontSize: 13,
  },

  sectionTitle: {
    marginBottom: 12,
    color: '#111111',
    fontSize: 19,
    fontWeight: '700',
  },

  emptyCard: {
    marginBottom: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  emptyTitle: {
    marginBottom: 6,
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },

  emptyText: {
    color: '#777777',
    fontSize: 14,
    lineHeight: 20,
  },

  categoryCard: {
    marginBottom: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 16,
  },

  lastCategoryRow: {
    borderBottomWidth: 0,
  },

  categoryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryDot: {
    width: 10,
    height: 10,
    marginRight: 10,
    borderRadius: 5,
  },

  categoryName: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '500',
  },

  categoryAmount: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  transactionsCard: {
    marginBottom: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },

  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 16,
  },

  lastTransactionRow: {
    borderBottomWidth: 0,
  },

  transactionLeft: {
    flex: 1,
    marginRight: 12,
  },

  merchant: {
    marginBottom: 4,
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  transactionDetails: {
    color: '#888888',
    fontSize: 13,
  },

  transactionAmountContainer: {
    alignItems: 'flex-end',
  },

  transactionAmount: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  originalAmount: {
    marginTop: 3,
    color: '#888888',
    fontSize: 12,
  },

  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#111111',
    paddingVertical: 16,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});