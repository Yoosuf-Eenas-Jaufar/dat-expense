import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Payment Detection</Text>
          <Text style={styles.itemDescription}>
            Android payment detection will be added later.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>Base Currency</Text>
          <Text style={styles.itemDescription}>MVR</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.itemTitle}>About</Text>
          <Text style={styles.itemDescription}>
            Dat Expense version 1.0.0
          </Text>
        </View>
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
    marginBottom: 24,
    color: '#111111',
    fontSize: 26,
    fontWeight: '700',
  },

  card: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },

  itemTitle: {
    marginBottom: 6,
    color: '#222222',
    fontSize: 16,
    fontWeight: '600',
  },

  itemDescription: {
    color: '#777777',
    fontSize: 14,
    lineHeight: 20,
  },
});