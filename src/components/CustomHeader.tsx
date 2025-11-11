import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../hooks/useTranslation';
import { colors, radii, shadows, spacing } from '../styles/tokens';

type Props = {
  label?: string;
  subheading?: string;
  image_url?: string;
};

const fallbackImage =
  'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=320&q=80';

const CustomHeader: React.FC<Props> = ({ label, subheading, image_url }) => {
  const { translate } = useTranslation();
  return (
    <Surface style={styles.container} elevation={3}>
      <LinearGradient
        colors={[colors.palette.indigo900, colors.palette.indigo600]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.textContainer}>
          <Text variant="titleLarge" style={styles.title}>
            {label || translate('Solaris')}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subheading || translate('Smarter solar journeys start here')}
          </Text>
        </View>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image_url || fallbackImage }} style={styles.image} />
        </View>
      </LinearGradient>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    backgroundColor: 'transparent',
    ...shadows.soft,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.card,
    fontSize: 26,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: 'rgba(248, 250, 252, 0.85)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: '100%',
    flexShrink: 1,
  },
  imageWrapper: {
    width: 88,
    height: 88,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: colors.palette.indigo700,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CustomHeader;
