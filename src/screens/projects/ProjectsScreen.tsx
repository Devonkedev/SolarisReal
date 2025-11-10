import { Alert, Image, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Avatar, FAB, List, Surface, Text, Portal, Modal } from 'react-native-paper'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { getProjects } from '../../config/firebase'
import LogoutButton from '../../components/LogoutButton'
import CustomJuniorHeader from '../../components/CustomJuniorHeader'
import CustomHeader from '../../components/CustomHeader'

const CustomListCard = ({ data, onPress }) => {
  return (
    <Surface style={{
      marginVertical: 8,
      marginHorizontal: 16,
      padding: 10,
      borderRadius: 12,
      elevation: 4,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    }} onTouchEnd={onPress}>
      {
        data.imageBase64 ? (
          <Avatar.Image size={60} source={{ uri: data.imageBase64 }} />
        ) : (
          <Avatar.Icon size={60} icon="file-document-outline" />
        )
      }
      <View style={{ flex: 1 }}>
        <Text variant="titleMedium">{data.name || 'Unnamed Project'}</Text>
        <Text variant="bodySmall">{data.detail || 'No description'}</Text>
      </View>
      <Text style={{ fontWeight: 'bold' }}>{data.systemType || data.type || 'System'}</Text>
    </Surface>
  );
};




const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([])
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data); // your state
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };


  const openModal = (item) => {
    setSelectedProject(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProject(null);
  };



  useEffect(() => {
    fetchProjects();
    return (
      setProjects([])
    )
  }, []);




  const handlePress = () => {
    navigation.navigate("AddProjectScreen")
  }

  return (
    <View style={{
      flex: 1,
    }}>

      <CustomHeader
        label="Solar Projects"
        subheading="Manage your rooftop solar installations"
        image_url="https://i.postimg.cc/CLkyNwZT/Screenshot-2025-11-10-at-5-03-23-PM.png"
      />

      <List.Section>
        <CustomJuniorHeader label={'Solar Projects'} action={() => { }} />
        {
          projects && projects.length > 0 ? (
            projects.map((item) => (
              <CustomListCard key={item.id} data={item} onPress={() => openModal(item)} />
            ))
          ) : (
            <ActivityIndicator />
          )
        }


        {/* <CustomListCard />
        <CustomListCard />
        <CustomListCard />
        <CustomListCard />
        <CustomListCard />
        <CustomListCard />
        <CustomListCard /> */}
      </List.Section>



      <LogoutButton />

      {/* ADD PROJECT */}
      <FAB
        icon="solar-power"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={handlePress}
      />


      {/* MODAL */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          margin: 20,
          borderRadius: 12,
        }}>
          {selectedProject && (
            <>
              {selectedProject.imageBase64 ? (
                <Image
                  style={{
                    width: wp(80),
                    height: hp(40),
                    alignSelf: 'center',
                    borderRadius: 12,
                    resizeMode: 'contain',
                  }}
                  source={{ uri: selectedProject.imageBase64 }}
                />
              ) : (
                <Avatar.Icon
                  size={100}
                  icon="image-off-outline"
                  style={{ alignSelf: 'center' }}
                />
              )}

              <Text variant="titleLarge" style={{ marginTop: 16 }}>
                {selectedProject.name}
              </Text>
              <Text variant="bodyMedium">
                {selectedProject.detail}
              </Text>
              <Text variant="bodySmall" style={{ marginTop: 8, color: 'gray' }}>
                {selectedProject.systemType || selectedProject.type}
              </Text>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  )
}

export default ProjectsScreen