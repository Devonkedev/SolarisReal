import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../hooks/useTranslation';

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
        colors={['#0F172A', '#1E3A8A']}
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
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
    gap: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 24,
  },
  subtitle: {
    color: 'rgba(241, 245, 249, 0.8)',
    fontSize: 16,
    lineHeight: 22,
  },
  imageWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default CustomHeader;
