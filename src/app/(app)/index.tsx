import { Ionicons } from '@expo/vector-icons';
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

  const categoryTotals =
    expense.currentMonthExpenses.reduce<Record<string, number>>(
      (totals, transaction) => {
        totals[transaction.categoryId] =
          (totals[transaction.categoryId] ?? 0) +
          transaction.amountMVR;

        return totals;
      },
      {}
    );

  const spendingByCategory = Object.entries(categoryTotals)
    .map(([categoryId, total]) => ({
      category: expense.getCategory(categoryId),
      total,
    }))
    .sort((a, b) => b.total - a.total);

  const recentTransactions =
    expense.recentTransactions.slice(0, 5);

  const transactionCount =
    expense.currentMonthExpenses.length;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.monthLabel}>
              Spending overview
            </Text>

            <Text style={styles.month}>
              {currentMonth}
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Spent this month
          </Text>

          <Text style={styles.totalAmount}>
            {formatMVR(
              expense.currentMonthTotalMVR
            )}
          </Text>

          <View style={styles.summaryFooter}>
            <View style={styles.summaryStat}>
              <Ionicons
                name="receipt-outline"
                size={16}
                color="#BDBDBD"
              />

              <Text style={styles.summaryHint}>
                {transactionCount === 0
                  ? 'No transactions yet'
                  : `${transactionCount} ${
                      transactionCount === 1
                        ? 'transaction'
                        : 'transactions'
                    }`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Spending by Category
          </Text>
        </View>

        {spendingByCategory.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="pie-chart-outline"
                size={26}
                color="#777777"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No spending data yet
            </Text>

            <Text style={styles.emptyText}>
              Your category breakdown will appear here
              after expenses are recorded.
            </Text>
          </View>
        ) : (
          <View style={styles.categoryCard}>
            {spendingByCategory.map(
              ({ category, total }, index) => (
                <View
                  key={
                    category?.id ??
                    `category-${index}`
                  }
                  style={[
                    styles.categoryRow,
                    index ===
                      spendingByCategory.length - 1 &&
                      styles.lastCategoryRow,
                  ]}
                >
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryDot,
                        {
                          backgroundColor:
                            category?.color ??
                            '#8E8E93',
                        },
                      ]}
                    />

                    <Text style={styles.categoryName}>
                      {category?.name ??
                        'Uncategorized'}
                    </Text>
                  </View>

                  <Text style={styles.categoryAmount}>
                    {formatMVR(total)}
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent Transactions
          </Text>

          {expense.recentTransactions.length >
            0 && (
            <Pressable
              onPress={() =>
                router.push('/transactions')
              }
              hitSlop={10}
            >
              <Text style={styles.viewAllText}>
                View all
              </Text>
            </Pressable>
          )}
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="wallet-outline"
                size={26}
                color="#777777"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No transactions yet
            </Text>

            <Text style={styles.emptyText}>
              Detected payments and manually added
              expenses will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsCard}>
            {recentTransactions.map(
              (transaction, index) => {
                const category =
                  expense.getCategory(
                    transaction.categoryId
                  );

                return (
                  <View
                    key={transaction.id}
                    style={[
                      styles.transactionRow,
                      index ===
                        recentTransactions.length -
                          1 &&
                        styles.lastTransactionRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.transactionIcon,
                        {
                          backgroundColor:
                            `${category?.color ?? '#8E8E93'}18`,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.transactionIconDot,
                          {
                            backgroundColor:
                              category?.color ??
                              '#8E8E93',
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.transactionLeft}>
                      <Text
                        style={styles.merchant}
                        numberOfLines={1}
                      >
                        {transaction.merchant}
                      </Text>

                      <View
                        style={
                          styles.transactionMetaRow
                        }
                      >
                        <Text
                          style={
                            styles.transactionDetails
                          }
                          numberOfLines={1}
                        >
                          {category?.name ??
                            'Uncategorized'}
                          {' · '}
                          {formatTransactionDate(
                            transaction.transactionDateTime
                          )}
                        </Text>

                        {transaction.source ===
                          'sms' && (
                          <View style={styles.smsBadge}>
                            <Text
                              style={styles.smsBadgeText}
                            >
                              SMS
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View
                      style={
                        styles.transactionAmountContainer
                      }
                    >
                      <Text
                        style={styles.transactionAmount}
                      >
                        {formatMVR(
                          transaction.amountMVR
                        )}
                      </Text>

                      {transaction.originalCurrency !==
                        'MVR' && (
                        <Text
                          style={styles.originalAmount}
                        >
                          {transaction.originalCurrency}{' '}
                          {transaction.originalAmount.toFixed(
                            2
                          )}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }
            )}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={() =>
            router.push('/add-expense')
          }
        >
          <Ionicons
            name="add"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.addButtonText}>
            Add Expense
          </Text>
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  monthLabel: {
    marginBottom: 3,
    color: '#888888',
    fontSize: 13,
    fontWeight: '500',
  },

  month: {
    color: '#111111',
    fontSize: 27,
    fontWeight: '700',
  },

  summaryCard: {
    marginBottom: 30,
    borderRadius: 22,
    backgroundColor: '#111111',
    padding: 22,
  },

  summaryLabel: {
    marginBottom: 8,
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '500',
  },

  totalAmount: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  summaryFooter: {
    marginTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3A3A3A',
    paddingTop: 14,
  },

  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryHint: {
    marginLeft: 7,
    color: '#BDBDBD',
    fontSize: 13,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#111111',
    fontSize: 19,
    fontWeight: '700',
  },

  viewAllText: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },

  emptyCard: {
    alignItems: 'center',
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  emptyIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    marginBottom: 14,
    borderRadius: 26,
    backgroundColor: '#F2F2F2',
  },

  emptyTitle: {
    marginBottom: 6,
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },

  emptyText: {
    maxWidth: 280,
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  categoryCard: {
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC',
    paddingVertical: 16,
  },

  lastCategoryRow: {
    borderBottomWidth: 0,
  },

  categoryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 14,
    fontWeight: '600',
  },

  transactionsCard: {
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },

  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC',
    paddingVertical: 15,
  },

  lastTransactionRow: {
    borderBottomWidth: 0,
  },

  transactionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    marginRight: 12,
    borderRadius: 12,
  },

  transactionIconDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },

  transactionLeft: {
    flex: 1,
    marginRight: 10,
  },

  merchant: {
    marginBottom: 4,
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  transactionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionDetails: {
    flexShrink: 1,
    color: '#888888',
    fontSize: 12,
  },

  smsBadge: {
    marginLeft: 6,
    borderRadius: 5,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  smsBadgeText: {
    color: '#777777',
    fontSize: 8,
    fontWeight: '700',
  },

  transactionAmountContainer: {
    alignItems: 'flex-end',
  },

  transactionAmount: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '700',
  },

  originalAmount: {
    marginTop: 3,
    color: '#888888',
    fontSize: 11,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#111111',
    paddingVertical: 16,
  },

  addButtonPressed: {
    opacity: 0.8,
  },

  addButtonText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});