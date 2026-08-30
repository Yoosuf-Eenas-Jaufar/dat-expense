import { Link, Stack } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Not Found',
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>
          This screen doesn't exist.
        </Text>

        <Link href="/" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>
              Go to Home
            </Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    padding: 24,
  },

  title: {
    marginBottom: 18,
    color: '#222222',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  button: {
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});