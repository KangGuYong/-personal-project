import React, { useState, useEffect } from 'react';
import { View, Button, Modal, TextInput } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from './config';
import handlePlaceSelect from './handlePlaceSelect';

const HomeScreen = () => {
  const [markersPositions, setMarkersPositions] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [travelPlans, setTravelPlans] = useState({});
  const [currentMarkerId, setCurrentMarkerId] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);


  return (
    <View style={{ flex: 1 }}>
      <Button title="Search Place" onPress={() => setShowSearchBar(true)} />

      {showSearchBar && (
        <GooglePlacesAutocomplete
          placeholder="Search"
          onPress={(data) => handlePlaceSelect(data, setMarkersPositions, setShowSearchBar)}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'ko',
          }}
        />
      )}

      <MapView
        provider="google"
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.413,
          longitude: 127.269,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}
        showsMyLocationButton={true}
        showsUserLocation={true}
      >
        {markersPositions.map((markerPosition) => (
          <Marker
            key={markerPosition.id}
            coordinate={markerPosition}
            onPress={() => {
              setCurrentMarkerId(markerPosition.id);
              setPlanModalVisible(true);
            }}
          />
        ))}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeWidth={5} />
        )}
      </MapView>

      {/* 모달: 여행 계획 입력 */}
      <Modal animationType="slide" transparent={true} visible={planModalVisible}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <TextInput
              placeholder="Enter your travel plan here..."
              value={travelPlans[currentMarkerId] || ''}
              onChangeText={(text) =>
                setTravelPlans((prevState) => ({
                  ...prevState,
                  [currentMarkerId]: text,
                }))
              }
            />

            {/* 계획 저장 버튼 */}
            <Button title="Save Plan" onPress={() => setPlanModalVisible(false)} />

            {/* 마커 삭제 버튼 */}
            <Button
              title="Delete Marker"
              onPress={() => {
                const newMarkers = markersPositions.filter(
                  (marker) => marker.id !== currentMarkerId
                );

                setMarkersPositions(newMarkers);

                if (newMarkers.length < 2) {
                  setRouteCoordinates([]);
                }

                setPlanModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;
