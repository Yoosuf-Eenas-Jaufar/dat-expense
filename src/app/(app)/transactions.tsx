import { observer } from 'mobx-react-lite';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStores } from '@/stores';

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default observer(function TransactionsScreen() {
  const { expense } = useStores();

  const transactions = [...expense.expenses].sort(
    (a, b) =>
      new Date(b.transactionDateTime).getTime() -
      new Date(a.transactionDateTime).getTime()
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Transactions</Text>

        <Text style={styles.subtitle}>
          {transactions.length}{' '}
          {transactions.length === 1 ? 'transaction' : 'transactions'}
        </Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No transactions yet</Text>

            <Text style={styles.emptyText}>
              Your imported and manually added expenses will appear here.
            </Text>
          </View>
        ) : (
          transactions.map(transaction => {
            const category = expense.getCategory(transaction.categoryId);

            return (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.topRow}>
                  <View style={styles.merchantContainer}>
                    <Text style={styles.merchant}>
                      {transaction.merchant}
                    </Text>

                    <Text style={styles.category}>
                      {category?.name ?? 'Uncategorized'}
                    </Text>
                  </View>

                  <Text style={styles.amount}>
                    MVR {transaction.amountMVR.toFixed(2)}
                  </Text>
                </View>

                {transaction.originalCurrency !== 'MVR' && (
                  <Text style={styles.originalAmount}>
                    Original: {transaction.originalCurrency}{' '}
                    {transaction.originalAmount.toFixed(2)}
                  </Text>
                )}

                <Text style={styles.date}>
                  {formatDate(transaction.transactionDateTime)}
                </Text>

                {transaction.referenceNumber && (
                  <Text style={styles.reference}>
                    Ref: {transaction.referenceNumber}
                  </Text>
                )}
              </View>
            );
          })
        )}
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
    color: '#111111',
    fontSize: 26,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    color: '#777777',
    fontSize: 14,
  },

  emptyCard: {
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

  transactionCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  merchantContainer: {
    flex: 1,
    marginRight: 12,
  },

  merchant: {
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },

  category: {
    marginTop: 4,
    color: '#777777',
    fontSize: 13,
  },

  amount: {
    color: '#222222',
    fontSize: 16,
    fontWeight: '700',
  },

  originalAmount: {
    marginTop: 12,
    color: '#555555',
    fontSize: 13,
  },

  date: {
    marginTop: 10,
    color: '#888888',
    fontSize: 12,
  },

  reference: {
    marginTop: 3,
    color: '#AAAAAA',
    fontSize: 11,
  },
});