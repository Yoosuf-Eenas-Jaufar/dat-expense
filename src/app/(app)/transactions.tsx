import Ionicons from '@expo/vector-icons/Ionicons';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  Alert,
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

  const [
    editingTransactionId,
    setEditingTransactionId,
  ] = useState<string | null>(null);

  const transactions = [...expense.expenses].sort(
    (a, b) =>
      new Date(b.transactionDateTime).getTime() -
      new Date(a.transactionDateTime).getTime()
  );

  const changeCategory = (
    expenseId: string,
    merchant: string,
    categoryId: string,
    categoryName: string
  ) => {
    Alert.alert(
      'Remember this merchant?',
      `Should transactions from ${merchant} automatically use the ${categoryName} category?`,
      [
        {
          text: 'No',
          onPress: () => {
            expense.assignCategory(
              expenseId,
              categoryId,
              false
            );

            setEditingTransactionId(null);
          },
        },
        {
          text: 'Yes',
          onPress: () => {
            expense.assignCategory(
              expenseId,
              categoryId,
              true
            );

            setEditingTransactionId(null);
          },
        },
      ]
    );
  };

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
          <Text style={styles.title}>
            Transactions
          </Text>

          <Text style={styles.subtitle}>
            {transactions.length}{' '}
            {transactions.length === 1
              ? 'transaction'
              : 'transactions'}
          </Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={27}
                color="#777777"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No transactions yet
            </Text>

            <Text style={styles.emptyText}>
              Your detected payments and manually added
              expenses will appear here.
            </Text>
          </View>
        ) : (
          transactions.map(transaction => {
            const category =
              expense.getCategory(
                transaction.categoryId
              );

            const isEditing =
              editingTransactionId ===
              transaction.id;

            const categoryColor =
              category?.color ?? '#8E8E93';

            return (
              <View
                key={transaction.id}
                style={styles.transactionCard}
              >
                <View style={styles.transactionTop}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          `${categoryColor}18`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryIconDot,
                        {
                          backgroundColor:
                            categoryColor,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.mainInfo}>
                    <Text
                      style={styles.merchant}
                      numberOfLines={1}
                    >
                      {transaction.merchant}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text style={styles.category}>
                        {category?.name ??
                          'Uncategorized'}
                      </Text>

                      <View
                        style={[
                          styles.sourceBadge,
                          transaction.source ===
                          'sms'
                            ? styles.smsBadge
                            : styles.manualBadge,
                        ]}
                      >
                        <Text
                          style={
                            styles.sourceBadgeText
                          }
                        >
                          {transaction.source ===
                          'sms'
                            ? 'SMS'
                            : 'MANUAL'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.amountContainer}>
                    <Text style={styles.amount}>
                      {formatMVR(
                        transaction.amountMVR
                      )}
                    </Text>

                    {transaction.originalCurrency !==
                      'MVR' && (
                      <Text
                        style={
                          styles.originalAmount
                        }
                      >
                        {
                          transaction.originalCurrency
                        }{' '}
                        {transaction.originalAmount.toFixed(
                          2
                        )}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#999999"
                    />

                    <Text style={styles.detailText}>
                      {formatDate(
                        transaction.transactionDateTime
                      )}
                    </Text>
                  </View>

                  {transaction.referenceNumber && (
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="document-text-outline"
                        size={14}
                        color="#999999"
                      />

                      <Text
                        style={styles.detailText}
                        numberOfLines={1}
                      >
                        Ref:{' '}
                        {
                          transaction.referenceNumber
                        }
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.categoryAction,
                    isEditing &&
                      styles.categoryActionActive,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                  onPress={() =>
                    setEditingTransactionId(
                      isEditing
                        ? null
                        : transaction.id
                    )
                  }
                >
                  <View
                    style={
                      styles.categoryActionLeft
                    }
                  >
                    <View
                      style={[
                        styles.categoryActionIcon,
                        isEditing &&
                          styles.categoryActionIconActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          isEditing
                            ? 'close'
                            : 'pricetag-outline'
                        }
                        size={17}
                        color={
                          isEditing
                            ? '#FFFFFF'
                            : '#555555'
                        }
                      />
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.categoryActionTitle,
                          isEditing &&
                            styles.categoryActionTitleActive,
                        ]}
                      >
                        {isEditing
                          ? 'Close Categories'
                          : 'Change Category'}
                      </Text>

                      {!isEditing && (
                        <Text
                          style={
                            styles.categoryActionSubtitle
                          }
                        >
                          Currently{' '}
                          {category?.name ??
                            'Uncategorized'}
                        </Text>
                      )}
                    </View>
                  </View>

                  {!isEditing && (
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#999999"
                    />
                  )}
                </Pressable>

                {isEditing && (
                  <View style={styles.categoryPicker}>
                    <Text
                      style={
                        styles.categoryPickerTitle
                      }
                    >
                      Choose a category
                    </Text>

                    <Text
                      style={
                        styles.categoryPickerHint
                      }
                    >
                      Select a category for this
                      transaction. You can then choose
                      whether Dat Expense should
                      remember the merchant.
                    </Text>

                    <View
                      style={styles.categoryOptions}
                    >
                      {expense.categories.map(
                        option => {
                          const selected =
                            transaction.categoryId ===
                            option.id;

                          return (
                            <Pressable
                              key={option.id}
                              style={({ pressed }) => [
                                styles.categoryOption,
                                selected &&
                                  styles.categoryOptionSelected,
                                pressed &&
                                  styles.categoryOptionPressed,
                              ]}
                              onPress={() =>
                                changeCategory(
                                  transaction.id,
                                  transaction.merchant,
                                  option.id,
                                  option.name
                                )
                              }
                            >
                              <View
                                style={[
                                  styles.categoryDot,
                                  {
                                    backgroundColor:
                                      option.color,
                                  },
                                ]}
                              />

                              <Text
                                style={[
                                  styles.categoryOptionText,
                                  selected &&
                                    styles.categoryOptionTextSelected,
                                ]}
                              >
                                {option.name}
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
                  </View>
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

  header: {
    marginBottom: 20,
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

  emptyCard: {
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 34,
  },

  emptyIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 54,
    height: 54,
    marginBottom: 14,
    borderRadius: 27,
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

  transactionCard: {
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  transactionTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    marginRight: 12,
    borderRadius: 13,
  },

  categoryIconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  mainInfo: {
    flex: 1,
    marginRight: 10,
  },

  merchant: {
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  category: {
    flexShrink: 1,
    color: '#777777',
    fontSize: 12,
  },

  sourceBadge: {
    marginLeft: 7,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  smsBadge: {
    backgroundColor: '#EEF3F8',
  },

  manualBadge: {
    backgroundColor: '#F1F1F1',
  },

  sourceBadgeText: {
    color: '#777777',
    fontSize: 8,
    fontWeight: '700',
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '700',
  },

  originalAmount: {
    marginTop: 4,
    color: '#888888',
    fontSize: 11,
  },

  detailsSection: {
    marginTop: 15,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor: '#ECECEC',
    paddingTop: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  detailText: {
    flex: 1,
    marginLeft: 7,
    color: '#888888',
    fontSize: 11,
  },

  categoryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    borderRadius: 13,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  categoryActionActive: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },

  categoryActionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryActionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
  },

  categoryActionIconActive: {
    backgroundColor: '#333333',
  },

  categoryActionTitle: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '700',
  },

  categoryActionTitleActive: {
    color: '#FFFFFF',
  },

  categoryActionSubtitle: {
    marginTop: 2,
    color: '#999999',
    fontSize: 10,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  categoryPicker: {
    marginTop: 16,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    paddingTop: 16,
  },

  categoryPickerTitle: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '700',
  },

  categoryPickerHint: {
    marginTop: 4,
    marginBottom: 12,
    color: '#888888',
    fontSize: 11,
    lineHeight: 16,
  },

  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  categoryOptionSelected: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },

  categoryOptionPressed: {
    opacity: 0.75,
  },

  categoryDot: {
    width: 8,
    height: 8,
    marginRight: 7,
    borderRadius: 4,
  },

  categoryOptionText: {
    marginRight: 3,
    color: '#444444',
    fontSize: 12,
    fontWeight: '500',
  },

  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
});