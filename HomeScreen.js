import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import handlePlaceSelect from './handlePlaceSelect'; // 장소 선택 핸들러
import { loadMarkers, saveTravelPlanToFirebaseDB, deleteMarkerFromFirebaseDB } from './loadMarkers'; // Firestore 데이터 로드 및 관리 함수
const YOUR_GRAPHHOPPER_API_KEY = "ff60806d-9547-4493-8466-15d7a8063998";  // GraphHopper API 키 입력
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

import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const [markersPositions, setMarkersPositions] = useState([]); // 마커 위치 배열 상태
  const [showSearchBar, setShowSearchBar] = useState(false); // 장소 검색 바 표시 여부 상태
  const [routesCoordinates, setRoutesCoordinates] = useState([]); // 경로 좌표 배열 상태
  const [isModalVisible, setIsModalVisible] = useState(false); // 여행 계획 모달 표시 여부 상태
  const [selectedMarkerId, setSelectedMarkerId] = useState(null); // 선택된 마커 ID 상태
  const [travelPlanInputValue, setTravelPlanInputValue] = useState(''); // 여행 계획 입력 값 상태
  const [isEditable, setIsEditable] = useState(false); // 여행 계획 편집 가능 여부 상태
  const [prevMarkersPositions, setPrevMarkersPositions] = useState([]); // 이전 마커 위치 배열 상태

  useEffect(() => {
    loadMarkers(setMarkersPositions); // Firestore에서 마커 데이터 로드
  }, []);

  useEffect(() => {
    if (markersPositions !== prevMarkersPositions) {
      getAllRoutes(); // 마커 간 경로 계산 및 업데이트
      setPrevMarkersPositions(markersPositions);
    }
  }, [markersPositions, prevMarkersPositions]);

  useFocusEffect(
    React.useCallback(() => {
      loadMarkers(setMarkersPositions); // 화면 포커스 시 마커 데이터 다시 로드
      setPrevMarkersPositions([]);
    }, [])
  );

  async function getRouteFromGraphHopper(startPoint, endPoint) {
    try {
      let response = await axios.get(`https://graphhopper.com/api/1/route?point=${startPoint.latitude},${startPoint.longitude}&point=${endPoint.latitude},${endPoint.longitude}&vehicle=car&locale=en-US&key=${YOUR_GRAPHHOPPER_API_KEY}`);
      // console.log(response.data);

      if (response.data.paths) {
        return response.data.paths[0].points; // 경로 좌표 데이터 반환
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
        let pointsArray = decode(pointsData); // 인코딩된 좌표 데이터 디코딩
        coordinates.push(...pointsArray);
      }
    }

    setRoutesCoordinates(coordinates); // 경로 좌표 배열 업데이트
  }

  return (
    <TouchableWithoutFeedback onPress={() => setShowSearchBar(false)}>
      <View style={{ flex: 1, width: deviceWidth, height: deviceHeight }}>
        <PaperButton mode="contained" icon="magnify" onPress={() => 
          setShowSearchBar(true)} style={{ margin: 10 }}>장소 검색</PaperButton>
        {showSearchBar && (
          <GooglePlacesAutocomplete
            placeholder="검색"
            onPress={(data) => {
              handlePlaceSelect(data, setMarkersPositions, setShowSearchBar, markersPositions.length); // 장소 선택 핸들러 호출
            }}
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
            longitudeDelta: 0.04
          }}
          showsMyLocationButton={true}
          showsUserLocation={true}
        >
          {markersPositions.map((markerPosition, index) => (
            <Marker
              key={markerPosition.id}
              coordinate={markerPosition}
              onPress={() => {
                setSelectedMarkerId(markerPosition.id);
                setTravelPlanInputValue(markerPosition.travelPlan);
                setIsModalVisible(true);
                setIsEditable(markerPosition.travelPlan === ""); // 여행 계획 수정 가능 여부 설정
              }}
            >
              <View style={{ backgroundColor: "red", padding: 10, borderRadius: 20 }}>
                <Text style={{ color: "white" }}>{index + 1}</Text>
              </View>
            </Marker>
          ))}

          {routesCoordinates.length > 0 && (
            <Polyline coordinates={routesCoordinates} strokeColor="#000" strokeWidth={3} /> // 경로 표시
          )}
        </MapView>

        <Portal>
          <Dialog visible={isModalVisible} onDismiss={() => setIsModalVisible(false)}>
            <Dialog.Title>여행 계획</Dialog.Title>
            <Dialog.Content>
              <PaperTextInput
                label="여행 계획"
                value={travelPlanInputValue}
                onChangeText={(text) => setTravelPlanInputValue(text)}
                editable={isEditable}
                keyboardType="email-address"
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;

function decode(encoded) {
  var points = [];
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

    let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 31) << shift;
      shift += 5;
    } while (b >= 32);

    let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    points.push({ latitude: lat / 100000.0, longitude: lng / 100000.0 });
  }

  return points;
}
