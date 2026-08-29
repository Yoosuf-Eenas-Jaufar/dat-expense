import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MONEY_PATHS = [
  -100,
  -65,
  -32,
  0,
  32,
  65,
  100,
];

export function AppLoadingScreen() {
  const animations = useRef(
    MONEY_PATHS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    let isRunning = true;
    let currentAnimation: Animated.CompositeAnimation | null = null;

    const runCycle = () => {
      if (!isRunning) {
        return;
      }

      animations.forEach(animation => {
        animation.setValue(0);
      });

      const moneyAnimations = animations.map(animation =>
        Animated.timing(animation, {
          toValue: 1,
          duration: 950,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      );

      currentAnimation = Animated.sequence([
        Animated.stagger(130, moneyAnimations),
        Animated.delay(350),
      ]);

      currentAnimation.start(({ finished }) => {
        if (finished && isRunning) {
          runCycle();
        }
      });
    };

    runCycle();

    return () => {
      isRunning = false;
      currentAnimation?.stop();

      animations.forEach(animation => {
        animation.stopAnimation();
      });
    };
  }, [animations]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandContainer}>
          <Text style={styles.appName}>Dat Expense</Text>

          <Text style={styles.tagline}>
            Track your spending automatically
          </Text>
        </View>

        <View style={styles.animationArea}>
          {animations.map((animation, index) => {
            const horizontalTarget = MONEY_PATHS[index];

            const translateX = animation.interpolate({
              inputRange: [0, 0.25, 1],
              outputRange: [
                0,
                horizontalTarget * 0.15,
                horizontalTarget,
              ],
            });

            const translateY = animation.interpolate({
              inputRange: [0, 0.15, 1],
              outputRange: [0, -25, -160],
            });

            const opacity = animation.interpolate({
              inputRange: [0, 0.1, 0.65, 1],
              outputRange: [0, 1, 0.8, 0],
            });

            const scale = animation.interpolate({
              inputRange: [0, 0.2, 1],
              outputRange: [0.6, 1, 0.85],
            });

            const rotate = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [
                index % 2 === 0 ? '-8deg' : '8deg',
                index % 2 === 0 ? '10deg' : '-10deg',
              ],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.money,
                  {
                    opacity,
                    transform: [
                      { translateX },
                      { translateY },
                      { scale },
                      { rotate },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="cash"
                  size={27}
                  color="#2E7D32"
                />
              </Animated.View>
            );
          })}

          <View style={styles.wallet}>
            <Ionicons
              name="wallet"
              size={52}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.footer}>
          Your expense data stays on this device
        </Text>
      </View>
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
    alignItems: 'center',
  },

  brandContainer: {
    alignItems: 'center',
    marginTop: 90,
  },

  appName: {
    color: '#111111',
    fontSize: 30,
    fontWeight: '800',
  },

  tagline: {
    marginTop: 7,
    color: '#777777',
    fontSize: 14,
  },

  animationArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 95,
  },

  wallet: {
    width: 92,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#111111',
    zIndex: 10,
  },

  money: {
    position: 'absolute',
    bottom: 155,
    left: '50%',
    marginLeft: -14,
    zIndex: 5,
  },

  footer: {
    marginBottom: 24,
    color: '#999999',
    fontSize: 11,
    textAlign: 'center',
  },
});