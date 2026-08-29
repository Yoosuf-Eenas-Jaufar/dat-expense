import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStores } from '@/stores';

export default observer(function CategoriesScreen() {
  const { expense } = useStores();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleAddCategory = () => {
    const cleanName = newCategoryName.replace(/\s+/g, ' ').trim();

    if (!cleanName) {
      Alert.alert('Category name required', 'Enter a category name.');
      return;
    }

    try {
      expense.addCategory(cleanName);

      setNewCategoryName('');
      setShowAddForm(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The category could not be created.';

      Alert.alert('Unable to add category', message);
    }
  };

  const startRenameCategory = (categoryId: string, currentName: string) => {
    setEditingCategoryId(categoryId);
    setEditingCategoryName(currentName);
  };

  const cancelRenameCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const saveRenamedCategory = () => {
    if (!editingCategoryId) {
      return;
    }

    const cleanName = editingCategoryName.replace(/\s+/g, ' ').trim();

    if (!cleanName) {
      Alert.alert('Category name required', 'Enter a category name.');
      return;
    }

    expense.renameCategory(editingCategoryId, cleanName);

    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const confirmDeleteCategory = (categoryId: string, categoryName: string) => {
    Alert.alert(
      'Delete category?',
      `Delete ${categoryName}? Existing expenses using this category will become Uncategorized.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            expense.deleteCategory(categoryId);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Categories</Text>

            <Text style={styles.subtitle}>
              Organize how your spending is grouped.
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => {
              setShowAddForm(!showAddForm);
              setNewCategoryName('');
            }}
          >
            <Text style={styles.addButtonText}>
              {showAddForm ? 'Cancel' : '+ New'}
            </Text>
          </Pressable>
        </View>

        {showAddForm && (
          <View style={styles.addCard}>
            <Text style={styles.formTitle}>New Category</Text>

            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="e.g. Coffee"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleAddCategory}
            />

            <Pressable
              style={styles.saveButton}
              onPress={handleAddCategory}
            >
              <Text style={styles.saveButtonText}>Add Category</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionTitle}>Your Categories</Text>

        <View style={styles.categoriesCard}>
          {expense.categories.map((category, index) => {
            const isEditing = editingCategoryId === category.id;

            return (
              <View
                key={category.id}
                style={[
                  styles.categoryContainer,
                  index === expense.categories.length - 1 &&
                    styles.lastCategoryContainer,
                ]}
              >
                {isEditing ? (
                  <View style={styles.renameContainer}>
                    <TextInput
                      style={styles.renameInput}
                      value={editingCategoryName}
                      onChangeText={setEditingCategoryName}
                      autoFocus
                      selectTextOnFocus
                      returnKeyType="done"
                      onSubmitEditing={saveRenamedCategory}
                    />

                    <View style={styles.renameButtons}>
                      <Pressable
                        style={styles.smallSecondaryButton}
                        onPress={cancelRenameCategory}
                      >
                        <Text style={styles.smallSecondaryButtonText}>
                          Cancel
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.smallPrimaryButton}
                        onPress={saveRenamedCategory}
                      >
                        <Text style={styles.smallPrimaryButtonText}>
                          Save
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor: category.color,
                          },
                        ]}
                      />

                      <View style={styles.categoryTextContainer}>
                        <Text style={styles.categoryName}>
                          {category.name}
                        </Text>

                        {category.isProtected && (
                          <Text style={styles.protectedText}>
                            Default category
                          </Text>
                        )}
                      </View>
                    </View>

                    {!category.isProtected && (
                      <View style={styles.categoryActions}>
                        <Pressable
                          style={styles.actionButton}
                          onPress={() =>
                            startRenameCategory(category.id, category.name)
                          }
                        >
                          <Text style={styles.actionButtonText}>Rename</Text>
                        </Pressable>

                        <Pressable
                          style={styles.deleteButton}
                          onPress={() =>
                            confirmDeleteCategory(
                              category.id,
                              category.name
                            )
                          }
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Learned Merchants</Text>

        <Text style={styles.sectionDescription}>
          When you tell Dat Expense to remember a merchant, future
          transactions from that merchant will automatically use its saved
          category.
        </Text>

        {expense.merchantRules.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No merchant rules yet</Text>

            <Text style={styles.emptyText}>
              Change a transaction's category and choose to remember the
              merchant to create a rule.
            </Text>
          </View>
        ) : (
          <View style={styles.rulesCard}>
            {expense.merchantRules.map((rule, index) => {
              const category = expense.getCategory(rule.categoryId);

              return (
                <View
                  key={rule.id}
                  style={[
                    styles.ruleRow,
                    index === expense.merchantRules.length - 1 &&
                      styles.lastRuleRow,
                  ]}
                >
                  <View style={styles.ruleLeft}>
                    <Text style={styles.ruleMerchant}>
                      {rule.displayMerchantName}
                    </Text>

                    <Text style={styles.ruleDescription}>
                      Automatically categorize as
                    </Text>
                  </View>

                  <View style={styles.ruleCategory}>
                    <View
                      style={[
                        styles.ruleCategoryDot,
                        {
                          backgroundColor: category?.color ?? '#8E8E93',
                        },
                      ]}
                    />

                    <Text style={styles.ruleCategoryText}>
                      {category?.name ?? 'Uncategorized'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How learning works</Text>

          <Text style={styles.infoText}>
            Categories use permanent internal IDs. This means you can rename a
            category without breaking existing expenses or learned merchant
            rules.
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  title: {
    color: '#111111',
    fontSize: 26,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 4,
    color: '#777777',
    fontSize: 14,
  },

  addButton: {
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  addCard: {
    marginBottom: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  formTitle: {
    marginBottom: 12,
    color: '#222222',
    fontSize: 16,
    fontWeight: '700',
  },

  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#111111',
    fontSize: 15,
  },

  saveButton: {
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingVertical: 13,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  sectionTitle: {
    marginBottom: 8,
    color: '#111111',
    fontSize: 19,
    fontWeight: '700',
  },

  sectionDescription: {
    marginBottom: 12,
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
  },

  categoriesCard: {
    marginBottom: 30,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },

  categoryContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 15,
  },

  lastCategoryContainer: {
    borderBottomWidth: 0,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  categoryDot: {
    width: 12,
    height: 12,
    marginRight: 11,
    borderRadius: 6,
  },

  categoryTextContainer: {
    flex: 1,
  },

  categoryName: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  protectedText: {
    marginTop: 3,
    color: '#999999',
    fontSize: 11,
  },

  categoryActions: {
    flexDirection: 'row',
    gap: 6,
  },

  actionButton: {
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  actionButtonText: {
    color: '#333333',
    fontSize: 11,
    fontWeight: '600',
  },

  deleteButton: {
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 11,
    fontWeight: '600',
  },

  renameContainer: {
    gap: 10,
  },

  renameInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111111',
    fontSize: 15,
  },

  renameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },

  smallSecondaryButton: {
    borderRadius: 8,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  smallSecondaryButtonText: {
    color: '#444444',
    fontSize: 12,
    fontWeight: '600',
  },

  smallPrimaryButton: {
    borderRadius: 8,
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  smallPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  emptyCard: {
    marginBottom: 30,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  emptyTitle: {
    marginBottom: 6,
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  emptyText: {
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
  },

  rulesCard: {
    marginBottom: 30,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 16,
  },

  lastRuleRow: {
    borderBottomWidth: 0,
  },

  ruleLeft: {
    flex: 1,
    marginRight: 12,
  },

  ruleMerchant: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  ruleDescription: {
    marginTop: 3,
    color: '#888888',
    fontSize: 11,
  },

  ruleCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ruleCategoryDot: {
    width: 8,
    height: 8,
    marginRight: 7,
    borderRadius: 4,
  },

  ruleCategoryText: {
    color: '#444444',
    fontSize: 13,
    fontWeight: '600',
  },

  infoCard: {
    borderRadius: 16,
    backgroundColor: '#EBF3FF',
    padding: 18,
  },

  infoTitle: {
    marginBottom: 6,
    color: '#17375E',
    fontSize: 14,
    fontWeight: '700',
  },

  infoText: {
    color: '#45627E',
    fontSize: 12,
    lineHeight: 18,
  },
});