import Ionicons from '@expo/vector-icons/Ionicons';
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

  const [showAddForm, setShowAddForm] =
    useState(false);

  const [newCategoryName, setNewCategoryName] =
    useState('');

  const [
    editingCategoryId,
    setEditingCategoryId,
  ] = useState<string | null>(null);

  const [
    editingCategoryName,
    setEditingCategoryName,
  ] = useState('');

  const handleAddCategory = () => {
    const cleanName = newCategoryName
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanName) {
      Alert.alert(
        'Category name required',
        'Enter a category name.'
      );

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

      Alert.alert(
        'Unable to add category',
        message
      );
    }
  };

  const startRenameCategory = (
    categoryId: string,
    currentName: string
  ) => {
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

    const cleanName = editingCategoryName
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanName) {
      Alert.alert(
        'Category name required',
        'Enter a category name.'
      );

      return;
    }

    try {
      expense.renameCategory(
        editingCategoryId,
        cleanName
      );

      setEditingCategoryId(null);
      setEditingCategoryName('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The category could not be renamed.';

      Alert.alert(
        'Unable to rename category',
        message
      );
    }
  };

  const confirmDeleteCategory = (
    categoryId: string,
    categoryName: string
  ) => {
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
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Categories
          </Text>

          <Text style={styles.subtitle}>
            {expense.categories.length}{' '}
            {expense.categories.length === 1
              ? 'category'
              : 'categories'}
          </Text>
        </View>

        <Pressable
          style={[
            styles.newCategoryButton,
            showAddForm &&
              styles.newCategoryButtonCancel,
          ]}
          onPress={() => {
            setShowAddForm(
              previous => !previous
            );

            setNewCategoryName('');
          }}
        >
          <Ionicons
            name={
              showAddForm
                ? 'close'
                : 'add-circle-outline'
            }
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.newCategoryButtonText
            }
          >
            {showAddForm
              ? 'Cancel'
              : 'New Category'}
          </Text>
        </Pressable>

        {showAddForm && (
          <View style={styles.addCard}>
            <View style={styles.addCardHeader}>
              <View style={styles.formIcon}>
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color="#555555"
                />
              </View>

              <View style={styles.formHeading}>
                <Text style={styles.formTitle}>
                  Create Category
                </Text>

                <Text
                  style={
                    styles.formDescription
                  }
                >
                  Add a new category for your
                  expenses.
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={
                setNewCategoryName
              }
              placeholder="e.g. Coffee"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={
                handleAddCategory
              }
            />

            <Pressable
              style={styles.saveButton}
              onPress={handleAddCategory}
            >
              <Ionicons
                name="add"
                size={18}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.saveButtonText
                }
              >
                Add Category
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Your Categories
        </Text>

        <View style={styles.categoriesCard}>
          {expense.categories.map(
            (category, index) => {
              const isEditing =
                editingCategoryId ===
                category.id;

              return (
                <View
                  key={category.id}
                  style={[
                    styles.categoryContainer,
                    index ===
                      expense.categories.length -
                        1 &&
                      styles.lastCategoryContainer,
                  ]}
                >
                  {isEditing ? (
                    <View
                      style={
                        styles.renameContainer
                      }
                    >
                      <View
                        style={
                          styles.renameHeader
                        }
                      >
                        <View
                          style={[
                            styles.categoryIcon,
                            {
                              backgroundColor:
                                `${category.color}18`,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.categoryIconDot,
                              {
                                backgroundColor:
                                  category.color,
                              },
                            ]}
                          />
                        </View>

                        <Text
                          style={
                            styles.renameTitle
                          }
                        >
                          Rename category
                        </Text>
                      </View>

                      <TextInput
                        style={
                          styles.renameInput
                        }
                        value={
                          editingCategoryName
                        }
                        onChangeText={
                          setEditingCategoryName
                        }
                        autoFocus
                        selectTextOnFocus
                        returnKeyType="done"
                        onSubmitEditing={
                          saveRenamedCategory
                        }
                      />

                      <View
                        style={
                          styles.renameButtons
                        }
                      >
                        <Pressable
                          style={
                            styles.secondaryButton
                          }
                          onPress={
                            cancelRenameCategory
                          }
                        >
                          <Text
                            style={
                              styles.secondaryButtonText
                            }
                          >
                            Cancel
                          </Text>
                        </Pressable>

                        <Pressable
                          style={
                            styles.primaryButton
                          }
                          onPress={
                            saveRenamedCategory
                          }
                        >
                          <Text
                            style={
                              styles.primaryButtonText
                            }
                          >
                            Save
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View
                      style={
                        styles.categoryRow
                      }
                    >
                      <View
                        style={
                          styles.categoryLeft
                        }
                      >
                        <View
                          style={[
                            styles.categoryIcon,
                            {
                              backgroundColor:
                                `${category.color}18`,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.categoryIconDot,
                              {
                                backgroundColor:
                                  category.color,
                              },
                            ]}
                          />
                        </View>

                        <View
                          style={
                            styles.categoryTextContainer
                          }
                        >
                          <Text
                            style={
                              styles.categoryName
                            }
                          >
                            {category.name}
                          </Text>

                          {category.isProtected && (
                            <View
                              style={
                                styles.defaultBadge
                              }
                            >
                              <Text
                                style={
                                  styles.defaultBadgeText
                                }
                              >
                                DEFAULT
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {!category.isProtected && (
                        <View
                          style={
                            styles.categoryActions
                          }
                        >
                          <Pressable
                            style={
                              styles.iconButton
                            }
                            onPress={() =>
                              startRenameCategory(
                                category.id,
                                category.name
                              )
                            }
                          >
                            <Ionicons
                              name="pencil-outline"
                              size={17}
                              color="#555555"
                            />
                          </Pressable>

                          <Pressable
                            style={
                              styles.deleteIconButton
                            }
                            onPress={() =>
                              confirmDeleteCategory(
                                category.id,
                                category.name
                              )
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={17}
                              color="#D32F2F"
                            />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            }
          )}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>
              Learned Merchants
            </Text>

            <Text
              style={
                styles.sectionDescription
              }
            >
              Merchants with saved category
              preferences.
            </Text>
          </View>

          {expense.merchantRules.length >
            0 && (
            <View style={styles.countBadge}>
              <Text
                style={styles.countBadgeText}
              >
                {expense.merchantRules.length}
              </Text>
            </View>
          )}
        </View>

        {expense.merchantRules.length ===
        0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="sparkles-outline"
                size={25}
                color="#777777"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No learned merchants yet
            </Text>

            <Text style={styles.emptyText}>
              Change a transaction's category
              and choose to remember the merchant
              to create a rule.
            </Text>
          </View>
        ) : (
          <View style={styles.rulesCard}>
            {expense.merchantRules.map(
              (rule, index) => {
                const category =
                  expense.getCategory(
                    rule.categoryId
                  );

                const categoryColor =
                  category?.color ??
                  '#8E8E93';

                return (
                  <View
                    key={rule.id}
                    style={[
                      styles.ruleRow,
                      index ===
                        expense.merchantRules
                          .length -
                          1 &&
                        styles.lastRuleRow,
                    ]}
                  >
                    <View
                      style={styles.ruleLeft}
                    >
                      <View
                        style={
                          styles.merchantIcon
                        }
                      >
                        <Ionicons
                          name="storefront-outline"
                          size={18}
                          color="#666666"
                        />
                      </View>

                      <View
                        style={
                          styles.ruleTextContainer
                        }
                      >
                        <Text
                          style={
                            styles.ruleMerchant
                          }
                          numberOfLines={1}
                        >
                          {
                            rule.displayMerchantName
                          }
                        </Text>

                        <Text
                          style={
                            styles.ruleDescription
                          }
                        >
                          Automatically categorized
                          as
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.ruleCategory
                      }
                    >
                      <View
                        style={[
                          styles.ruleCategoryDot,
                          {
                            backgroundColor:
                              categoryColor,
                          },
                        ]}
                      />

                      <Text
                        style={
                          styles.ruleCategoryText
                        }
                        numberOfLines={1}
                      >
                        {category?.name ??
                          'Uncategorized'}
                      </Text>
                    </View>
                  </View>
                );
              }
            )}
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="bulb-outline"
              size={20}
              color="#45627E"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Merchant learning
            </Text>

            <Text style={styles.infoText}>
              When you choose to remember a
              merchant, Dat Expense automatically
              applies that category to future
              transactions from the same merchant.
            </Text>
          </View>
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
    marginBottom: 18,
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

  newCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
    marginBottom: 28,
    borderRadius: 14,
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  newCategoryButtonCancel: {
    backgroundColor: '#555555',
  },

  newCategoryButtonText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  addCard: {
    marginTop: -14,
    marginBottom: 28,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  addCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  formIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
  },

  formHeading: {
    flex: 1,
  },

  formTitle: {
    color: '#222222',
    fontSize: 16,
    fontWeight: '700',
  },

  formDescription: {
    marginTop: 3,
    color: '#888888',
    fontSize: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#111111',
    fontSize: 15,
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingVertical: 13,
  },

  saveButtonText: {
    marginLeft: 5,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  sectionHeaderText: {
    flex: 1,
    marginRight: 12,
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

  countBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBEBEB',
    paddingHorizontal: 8,
  },

  countBadgeText: {
    color: '#555555',
    fontSize: 12,
    fontWeight: '700',
  },

  categoriesCard: {
    marginBottom: 30,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },

  categoryContainer: {
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC',
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

  categoryIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 12,
  },

  categoryIconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  categoryTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },

  categoryName: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '600',
  },

  defaultBadge: {
    marginTop: 5,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  defaultBadgeText: {
    color: '#888888',
    fontSize: 8,
    fontWeight: '700',
  },

  categoryActions: {
    flexDirection: 'row',
    gap: 7,
  },

  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
  },

  deleteIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF1F1',
  },

  renameContainer: {
    gap: 12,
  },

  renameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  renameTitle: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '600',
  },

  renameInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
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

  secondaryButton: {
    borderRadius: 9,
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  secondaryButtonText: {
    color: '#444444',
    fontSize: 12,
    fontWeight: '600',
  },

  primaryButton: {
    borderRadius: 9,
    backgroundColor: '#111111',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  emptyCard: {
    alignItems: 'center',
    marginBottom: 30,
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
    fontSize: 15,
    fontWeight: '600',
  },

  emptyText: {
    maxWidth: 280,
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  rulesCard: {
    marginBottom: 30,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
  },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC',
    paddingVertical: 15,
  },

  lastRuleRow: {
    borderBottomWidth: 0,
  },

  ruleLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },

  merchantIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    marginRight: 11,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
  },

  ruleTextContainer: {
    flex: 1,
  },

  ruleMerchant: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '600',
  },

  ruleDescription: {
    marginTop: 3,
    color: '#888888',
    fontSize: 10,
  },

  ruleCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '42%',
  },

  ruleCategoryDot: {
    width: 8,
    height: 8,
    marginRight: 6,
    borderRadius: 4,
  },

  ruleCategoryText: {
    flexShrink: 1,
    color: '#444444',
    fontSize: 12,
    fontWeight: '600',
  },

  infoCard: {
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: '#EBF3FF',
    padding: 18,
  },

  infoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    marginBottom: 5,
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