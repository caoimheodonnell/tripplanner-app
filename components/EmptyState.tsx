import { useTheme } from '@/context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated, Easing,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  iconName?: string;
  iconLib?: 'Ionicons' | 'MaterialCommunityIcons';
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
};

export default function EmptyState({ title, subtitle, actionLabel, onAction }: Props) {
  const planeX    = useRef(new Animated.Value(-60)).current;
  const planeY    = useRef(new Animated.Value(0)).current;
  const cloudX1   = useRef(new Animated.Value(300)).current;
  const cloudX2   = useRef(new Animated.Value(200)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  const { colours } = useTheme();

  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      gap: 10,
    },
    stage: {
      width: 280,
      height: 90,
      marginBottom: 8,
      overflow: 'hidden',
      position: 'relative',
      justifyContent: 'center',
    },
    plane: {
      position: 'absolute',
      top: 24,
    },
    cloud: {
      position: 'absolute',
    },
    trailRow: {
      position: 'absolute',
      flexDirection: 'row',
      gap: 12,
      top: 46,
      left: 20,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: colours.primary,
      opacity: 0.4,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colours.textPrimary,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colours.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    button: {
      marginTop: 12,
      backgroundColor: colours.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(planeX, {
          toValue: 320,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(planeX, {
          toValue: -60,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(planeY, {
          toValue: -10,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(planeY, {
          toValue: 10,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(cloudX1, {
        toValue: -100,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(cloudX2, {
          toValue: -100,
          duration: 7000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(cloudX2, { toValue: 320, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        <Animated.View style={[styles.trailRow, { opacity: dotOpacity }]}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={styles.dot} />
          ))}
        </Animated.View>

        <Animated.View style={[styles.cloud, { transform: [{ translateX: cloudX1 }], top: 10 }]}>
          <MaterialCommunityIcons name="cloud-outline" size={26} color={colours.textSecondary} />
        </Animated.View>

        <Animated.View style={[styles.cloud, { transform: [{ translateX: cloudX2 }], top: 45 }]}>
          <MaterialCommunityIcons name="cloud-outline" size={22} color={colours.textSecondary} />
        </Animated.View>

        <Animated.View
          style={[
            styles.plane,
            { transform: [{ translateX: planeX }, { translateY: planeY }] },
          ]}
        >
          <Ionicons name="airplane" size={28} color={colours.primary} />
        </Animated.View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <TouchableOpacity style={styles.button} onPress={onAction}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}