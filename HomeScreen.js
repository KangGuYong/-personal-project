// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import handlePlaceSelect from './handlePlaceSelect';
import { loadMarkers, saveTravelPlanToFirebaseDB, deleteMarkerFromFirebaseDB } from './loadMarkers';
const YOUR_GRAPHHOPPER_API_KEY = "ff60806d-9547-4493-8466-15d7a8063998";  // 여기에 GraphHopper API 키를 입력하세요
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from './config';

// Importing components and Provider
import {
  Dialog,
  Portal,
  Button as PaperButton,
  TextInput as PaperTextInput,
} from "react-native-paper";
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const HomeScreen = ({ navigation }) => {

  const [markersPositions, setMarkersPositions] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [routesCoordinates, setRoutesCoordinates] = useState([]);

  // Modal 관련 state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [travelPlanInputValue, setTravelPlanInputValue] = useState('');

  // 추가된 상태: 여행 계획 입력 필드가 읽기 전용인지 아닌지를 결정하는 상태
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    loadMarkers(setMarkersPositions);
  }, []);

  useEffect(() => {
    getAllRoutes();
  }, [markersPositions]);

  async function getRouteFromGraphHopper(startPoint, endPoint) {
    try {
      let response = await axios.get(`https://graphhopper.com/api/1/route?point=${startPoint.latitude},${startPoint.longitude}&point=${endPoint.latitude},${endPoint.longitude}&vehicle=car&locale=en-US&key=${YOUR_GRAPHHOPPER_API_KEY}`);
      console.log(response.data);

      if (response.data.paths) {
        return response.data.paths[0].points;
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  async function getAllRoutes() {
    let coordinates = [];

    for (let i = 0; i < markersPositions.length - 1; i++) {
      let pointsData = await getRouteFromGraphHopper(markersPositions[i], markersPositions[i + 1]);
      if (pointsData) {
        let pointsArray = decode(pointsData);
        coordinates.push(...pointsArray);
      }
    }

    setRoutesCoordinates(coordinates);
  }

  return (
    <View style={{ flex: 1, width: deviceWidth, height: deviceHeight }}>
      {/* 장소 검색 버튼 */}
      <PaperButton mode="contained" icon="magnify" onPress={() => setShowSearchBar(true)} style={{ margin: 10 }}>장소 검색</PaperButton>
      {/* 장소 검색 바 */}
      {showSearchBar && (
        <GooglePlacesAutocomplete
          placeholder="검색"
          onPress={(data) => {
            handlePlaceSelect(data, setMarkersPositions, setShowSearchBar, markersPositions.length); // 현재 마커 위치 배열의 길이 추가

          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'ko',
          }}
        />
      )}


      {/* 지도 */}
      <MapView
        provider="google"
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.413,
          longitude: 127.269,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04
        }}
        showsMyLocationButton={true}
        showsUserLocation={true}
      >
        {/* 마커 표시 */}
        {markersPositions.map((markerPosition, index) => (
          <Marker
            key={markerPosition.id}
            coordinate={markerPosition}
            onPress={() => {
              setSelectedMarkerId(markerPosition.id);
              setTravelPlanInputValue(markerPosition.travelPlan); // 마커 클릭 시 해당 마커의 여행 계획을 가져옵니다.
              setIsModalVisible(true);
              setIsEditable(markerPosition.travelPlan === ""); // '수정' 모드를 travelPlan이 비어있을 때만 켜도록 설정
            }}
          >
            <View style={{ backgroundColor: "red", padding: 10, borderRadius: 20 }}>
              <Text style={{ color: "white" }}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {/* 경로 표시 */}
        {routesCoordinates.length > 0 && (
          <Polyline coordinates={routesCoordinates} strokeColor="#000" strokeWidth={3} />
        )}

      </MapView>

      {/* 모달 창 - 마커 클릭 시 여행 계획 작성 및 삭제 가능*/}
      <Portal>
        <Dialog visible={isModalVisible} onDismiss={() => setIsModalVisible(false)}>
          <Dialog.Title>여행 계획</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label="여행 계획"
              value={travelPlanInputValue}
              onChangeText={(text) => setTravelPlanInputValue(text)}
              editable={isEditable}
              keyboardType="email-address" // 이 부분을 추가
            />
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setIsEditable(!isEditable)}>수정</PaperButton>
            <PaperButton onPress={() => {
              saveTravelPlanToFirebaseDB(selectedMarkerId, travelPlanInputValue, setMarkersPositions, markersPositions);
              setIsModalVisible(false);
              setIsEditable(false);
            }}>저장</PaperButton>
            <PaperButton onPress={async () => {
              const deletedMarkerId = await deleteMarkerFromFirebaseDB(selectedMarkerId);
              setMarkersPositions(prevState => prevState.filter(marker => marker.id !== deletedMarkerId));
              setIsModalVisible(false);
              setIsEditable(false);
            }}>마커 삭제</PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>);
};

export default HomeScreen;

function decode(encoded) {
  var points = []
  var index = 0;
  var lat = 0;
  var lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 31) << shift;
      shift += 5;
    } while (b >= 32);

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 31) << shift;
      shift += 5;
    } while (b >= 32);


    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ latitude: lat / 100000.0, longitude: lng / 100000.0 });
  }

  return points
}
