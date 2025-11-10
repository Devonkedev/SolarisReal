import { View, ScrollView } from 'react-native';
import React, { useMemo, useState } from 'react';
import CustomHeader from '../../components/CustomHeader';
import { FAB, Surface, Text } from 'react-native-paper';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import MapView, { Marker, Polygon, Region } from 'react-native-maps';

type SolarHeatTile = {
  coordinates: Array<{ latitude: number; longitude: number }>;
  fillColor: string;
  value: number;
};

const SOLAR_COLOR_STOPS = [
  { value: 0, color: [37, 52, 148] },
  { value: 0.35, color: [68, 130, 195] },
  { value: 0.55, color: [123, 204, 196] },
  { value: 0.75, color: [254, 224, 139] },
  { value: 1, color: [215, 48, 39] },
];

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const clamp = (val: number, min: number, max: number) => {
  if (val < min) return min;
  if (val > max) return max;
  return val;
};

const pseudoRandom = (lat: number, lon: number) => {
  const x = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const interpolateColor = (value: number) => {
  const v = clamp(value, 0, 1);
  let lower = SOLAR_COLOR_STOPS[0];
  let upper = SOLAR_COLOR_STOPS[SOLAR_COLOR_STOPS.length - 1];

  for (let i = 0; i < SOLAR_COLOR_STOPS.length - 1; i++) {
    const current = SOLAR_COLOR_STOPS[i];
    const next = SOLAR_COLOR_STOPS[i + 1];
    if (v >= current.value && v <= next.value) {
      lower = current;
      upper = next;
      break;
    }
  }

  const range = upper.value - lower.value || 1;
  const t = clamp((v - lower.value) / range, 0, 1);

  const r = Math.round(lower.color[0] + (upper.color[0] - lower.color[0]) * t);
  const g = Math.round(lower.color[1] + (upper.color[1] - lower.color[1]) * t);
  const b = Math.round(lower.color[2] + (upper.color[2] - lower.color[2]) * t);

  const alpha = 0.18 + v * 0.55;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
};

const getDayOfYear = (date: Date) => {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((utc - start) / (24 * 60 * 60 * 1000));
};

const computeSolarPotential = (lat: number, lon: number, date: Date, region: Region) => {
  const day = getDayOfYear(date);
  const declination = 23.44 * Math.sin(toRadians(((360 / 365) * (284 + day)) % 360));

  const latRad = toRadians(lat);
  const decRad = toRadians(declination);
  const solarAltitude = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad)
  );
  const altitudeFactor = clamp(Math.sin(solarAltitude), 0, 1);

  const noise = pseudoRandom(lat, lon);
  const hazeFactor = 0.75 + noise * 0.25;

  const reliefNoise = pseudoRandom(lat * 0.7, lon * 0.7) - 0.5;
  const reliefFactor = clamp(0.85 + reliefNoise * 0.25, 0, 1.1);

  const latOffset = Math.abs(lat - region.latitude) / Math.max(region.latitudeDelta, 0.0001);
  const lonOffset = Math.abs(lon - region.longitude) / Math.max(region.longitudeDelta, 0.0001);
  const distanceFactor = clamp(1 - Math.sqrt(latOffset * latOffset + lonOffset * lonOffset) * 0.45, 0.55, 1);

  return clamp(altitudeFactor * hazeFactor * reliefFactor * distanceFactor, 0, 1);
};

const generateSolarHeatTiles = (region: Region, date: Date, gridSize = 12): SolarHeatTile[] => {
  const tiles: SolarHeatTile[] = [];
  const effectiveDate = date ?? new Date();

  const latStart = region.latitude - region.latitudeDelta / 2;
  const lonStart = region.longitude - region.longitudeDelta / 2;
  const latStep = region.latitudeDelta / gridSize;
  const lonStep = region.longitudeDelta / gridSize;

  for (let row = 0; row < gridSize; row++) {
    const latBottom = latStart + row * latStep;
    const latTop = latBottom + latStep;
    for (let col = 0; col < gridSize; col++) {
      const lonLeft = lonStart + col * lonStep;
      const lonRight = lonLeft + lonStep;

      const centerLat = latBottom + latStep / 2;
      const centerLon = lonLeft + lonStep / 2;
      const value = computeSolarPotential(centerLat, centerLon, effectiveDate, region);
      if (value <= 0.02) continue;

      tiles.push({
        coordinates: [
          { latitude: latBottom, longitude: lonLeft },
          { latitude: latBottom, longitude: lonRight },
          { latitude: latTop, longitude: lonRight },
          { latitude: latTop, longitude: lonLeft },
        ],
        fillColor: interpolateColor(value),
        value,
      });
    }
  }

  return tiles;
};

const ShadowMapSection = ({ date }: { date?: Date }) => {
  const [region, setRegion] = useState<Region>({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });

  const effectiveDate = useMemo(() => {
    if (!date) return new Date();
    if (date instanceof Date) return date;
    return new Date(date);
  }, [date]);

  const tiles = useMemo(() => generateSolarHeatTiles(region, effectiveDate), [region, effectiveDate]);

  const legendStops = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, idx) => {
        const value = idx / 9;
        return interpolateColor(value);
      }),
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={region} onRegionChangeComplete={(r) => setRegion(r)}>
        {tiles.map((tile, i) => (
          <Polygon
            key={`shadow-${i}`}
            coordinates={tile.coordinates}
            strokeWidth={0}
            fillColor={tile.fillColor}
            zIndex={10}
          />
        ))}
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>

      <Surface
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: 'rgba(18, 18, 18, 0.7)',
        }}
        elevation={2}
      >
        <Text variant="labelSmall" style={{ color: '#ffffff', fontWeight: '600', letterSpacing: 0.5 }}>
          Solar Potential
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text variant="labelSmall" style={{ color: '#f5f5f5', marginRight: 8 }}>
            Low
          </Text>
          <View style={{ flexDirection: 'row', height: 8, width: 112, borderRadius: 4, overflow: 'hidden' }}>
            {legendStops.map((color, idx) => (
              <View key={`legend-${idx}`} style={{ flex: 1, backgroundColor: color }} />
            ))}
          </View>
          <Text variant="labelSmall" style={{ color: '#f5f5f5', marginLeft: 8 }}>
            High
          </Text>
        </View>
        <Text variant="labelSmall" style={{ color: '#d7d7d7', marginTop: 6 }}>
          {effectiveDate.toDateString()}
        </Text>
      </Surface>
    </View>
  );
};

const HealthScreen = ({ navigation }) => {
  const [selectedDate] = useState<Date>(() => new Date());

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <CustomHeader
          label={'Solar Shadow Map'}
          subheading={'Visualize sunlight & shadows based on your location'}
          image_url={
            'https://cdn-icons-png.flaticon.com/512/869/869869.png'
          }
        />

        <CustomJuniorHeader label={'Shadow Visualization'} action={() => {}} />
        <View style={{ height: hp(50), borderRadius: 16, overflow: 'hidden', marginHorizontal: wp(3) }}>
          <ShadowMapSection date={selectedDate} />
        </View>

        <View style={{ marginVertical: hp(2), paddingHorizontal: wp(3) }}>
          <Text variant="bodyMedium">
            Use the map above to visualize how solar potential varies across the selected area. The heat map
            combines sun angle, haze, and terrain roughness factors to highlight where rooftop solar can yield
            stronger production throughout the day.
          </Text>
        </View>
      </ScrollView>

      <FAB
        icon="refresh"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => navigation.goBack()}
      />
    </View>
  );
};

export default HealthScreen;
