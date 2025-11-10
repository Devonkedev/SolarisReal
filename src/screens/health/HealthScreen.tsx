import { View, ScrollView } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import CustomHeader from '../../components/CustomHeader';
import { ActivityIndicator, FAB, Surface, Text } from 'react-native-paper';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import CustomJuniorHeader from '../../components/CustomJuniorHeader';
import MapView, { UrlTile, Marker, Polygon } from 'react-native-maps';

const SHADOWMAP_TILE_URL =
  'https://api.shadowmap.example/tiles/{z}/{x}/{y}.png?key={API_KEY}';
const SHADOWMAP_GEOJSON_URL =
  'https://api.shadowmap.example/v1/shadow-geojson?lat={lat}&lon={lon}&date={date}&key={API_KEY}';

const ShadowMapSection = ({ apiKey, date }) => {
  const [region, setRegion] = useState({
    latitude: 28.6139, 
    longitude: 77.209,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geoPolygons, setGeoPolygons] = useState([]);
  const [error, setError] = useState(null);

  const tileUrlTemplate = useMemo(() => {
    if (!apiKey) return null;
    return SHADOWMAP_TILE_URL.replace('{API_KEY}', encodeURIComponent(apiKey));
  }, [apiKey]);

  useEffect(() => {
    const fetchGeo = async () => {
      if (!apiKey) return;
      setLoadingGeo(true);
      setError(null);
      try {
        const lat = region.latitude;
        const lon = region.longitude;
        const isoDate = (date || new Date()).toISOString();
        const url = SHADOWMAP_GEOJSON_URL
          .replace('{lat}', encodeURIComponent(lat))
          .replace('{lon}', encodeURIComponent(lon))
          .replace('{date}', encodeURIComponent(isoDate))
          .replace('{API_KEY}', encodeURIComponent(apiKey));

        const res = await fetch(url);
        if (!res.ok) throw new Error(`ShadowMap API error ${res.status}`);
        const geojson = await res.json();

        const polygons = [];
        if (geojson.type === 'FeatureCollection') {
          for (const feat of geojson.features) {
            const g = feat.geometry;
            if (!g) continue;
            if (g.type === 'Polygon') {
              polygons.push(
                g.coordinates[0].map(([lng, lat]) => ({
                  latitude: lat,
                  longitude: lng,
                }))
              );
            } else if (g.type === 'MultiPolygon') {
              for (const poly of g.coordinates) {
                polygons.push(
                  poly[0].map(([lng, lat]) => ({
                    latitude: lat,
                    longitude: lng,
                  }))
                );
              }
            }
          }
        }
        setGeoPolygons(polygons);
      } catch (e) {
        console.warn(e);
        setError(e.message);
      } finally {
        setLoadingGeo(false);
      }
    };
    fetchGeo();
  }, [region, apiKey, date]);

  return (
    <View style={{ height: hp(50), borderRadius: 16, overflow: 'hidden' }}>
      <MapView
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
      >
        {tileUrlTemplate && (
          <UrlTile urlTemplate={tileUrlTemplate} maximumZ={19} flipY={false} />
        )}
        {geoPolygons.map((coords, i) => (
          <Polygon
            key={`shadow-${i}`}
            coordinates={coords}
            strokeWidth={0}
            fillColor="rgba(0,0,0,0.4)"
          />
        ))}
        <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapView>

      {loadingGeo && (
        <ActivityIndicator style={{ position: 'absolute', top: '50%', alignSelf: 'center' }} />
      )}
      {error && (
        <Surface style={{ padding: 8, backgroundColor: 'rgba(255,200,200,0.9)' }}>
          <Text variant="bodyMedium" style={{ color: '#700' }}>
            {error}
          </Text>
        </Surface>
      )}
    </View>
  );
};

const HealthScreen = ({ navigation }) => {
  const [apiKey] = useState('YOUR_SHADOWMAP_API_KEY'); // Replace with your actual key

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
        <ShadowMapSection apiKey={apiKey} />

        <View style={{ marginVertical: hp(2), paddingHorizontal: wp(3) }}>
          <Text variant="bodyMedium">
            Use the map above to visualize how sunlight and shadows shift through
            the day for a given region. Useful for rooftop solar estimation.
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
