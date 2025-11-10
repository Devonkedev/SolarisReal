import { ScrollView, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Badge, FAB, Text, Surface } from 'react-native-paper'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { colorPalette } from '../../utils/colors'
import CustomHeader from '../../components/CustomHeader'
import LogoutButton from '../../components/LogoutButton'
import { fetchTrackers, getTrackerSummary } from '../../config/firebase'
import { format } from 'date-fns'
import CustomJuniorHeader from '../../components/CustomJuniorHeader'

const CustomCardSection = ({ kwh, revenue, panelId, type, note }) => {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      {/* LEFT */}
      <View>
        <Text variant="titleMedium">{panelId ? `${panelId} • ${type}` : type || 'NA'}</Text>
        <Text variant="bodySmall">{note || ''}</Text>
      </View>
      {/* RIGHT: kWh and revenue */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text variant="titleMedium">{typeof kwh === 'number' ? `${kwh.toFixed(2)} kWh` : (kwh || 'NA')}</Text>
        <Badge style={{
          alignSelf: 'flex-start',
          paddingHorizontal: wp(2),
          marginTop: wp(1),
        }}>{typeof revenue === 'number' ? `$${revenue.toFixed(2)}` : (revenue || 'NA')}</Badge>
      </View>
    </View>
  )
}


const CustomListCard = ({ data }) => {

  const formatTrackerDate = (dateString: string) => {
    if (!dateString) return 'No date';
    const dateObj = new Date(dateString);
    return format(dateObj, 'EEEE, MMMM dd, yyyy');
  };

  return (
    <>
      <View style={{
        marginHorizontal: wp(5),
        borderWidth: 1,
        borderRadius: wp(2),
        borderColor: colorPalette.light.colors.outlineVariant,
        flexDirection: 'column',
        padding: wp(3),
      }}>
        <Badge
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: wp(2),
            marginBottom: wp(1),
          }}
        >
          {data.date ? formatTrackerDate(data.date) : 'No date set'}
        </Badge>

        <View style={{
          gap: wp(2),
        }}>
          <CustomCardSection
            kwh={Number(data.kwh)}
            revenue={Number(data.revenue)}
            panelId={data.panelId}
            type={data.type}
            note={data.note}
          />
        </View>
      </View>
    </>
  )
}


const TrackerScreen = ({ navigation }) => {
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalKwh: 0, totalRevenue: 0, count: 0 });


  const handlePress = () => {
    navigation.navigate("AddTrackerScreen")
  }

  const loadTrackers = async () => {
    try {
      const data = await fetchTrackers();
      setTrackers(data);
      try {
        const s = await getTrackerSummary();
        setSummary(s as any);
      } catch (e) {
        // ignore
      }
    } catch (error) {
      alert('Failed to load trackers');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadTrackers();
  }, []);

  return (
    <View style={{
      flex: 1,
    }}>
      <ScrollView contentContainerStyle={{}}>
        <CustomHeader label={'Trackers'} subheading={'Here you can add your trackers'} image_url={'https://static.vecteezy.com/system/resources/previews/033/870/873/non_2x/location-pin-target-icon-on-white-background-tracking-location-navigation-gps-symbol-vector.jpg'} />
        
        <CustomJuniorHeader label={'Trackers'} action={() => {}} />

        <Surface style={{ padding: wp(4), margin: wp(3), borderRadius: wp(2) }}>
          <Text variant="titleMedium">Total: {summary.count} entries</Text>
          <Text variant="bodyLarge">Total energy: {summary.totalKwh?.toFixed?.(2) || 0} kWh</Text>
          <Text variant="bodyLarge">Estimated value: ${summary.totalRevenue?.toFixed?.(2) || 0}</Text>
        </Surface>

        <View style={{
          gap: wp(5),
        }}>
          {
            trackers && trackers.length > 0 ? (
              trackers.map((item) => (
                <CustomListCard key={item.id} data={item} />
              ))
            ) : (
              <ActivityIndicator />
            )
          }
        </View>
      </ScrollView>
      <LogoutButton />

      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={handlePress}
      />
    </View>
  )
}

export default TrackerScreen
