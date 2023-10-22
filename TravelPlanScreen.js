import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { loadMarkers } from './loadMarkers'; // Firestore에서 마커 데이터 로드
import {
  updateDoc,
  doc,
  getFirestore,
  collection,
} from 'firebase/firestore';

const TravelPlanScreen = ({ route }) => {
  const [markersPositions, setMarkersPositions] = useState([]); // 마커 위치 배열 상태
  const db = getFirestore(); // Firestore 인스턴스 생성

  useFocusEffect(
    React.useCallback(() => {
      loadMarkers(setMarkersPositions); // 화면 포커스 시 마커 데이터 로드
    }, [])
  );

  const mapRegion = markersPositions[0]
    ? {
        latitude: markersPositions[0].latitude,
        longitude: markersPositions[0].longitude,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
      }
    : null;

  // 마커를 위로 이동시키는 함수
  const moveMarkerUp = (index) => {
    if (index > 0) {
      const updatedMarkers = [...markersPositions];
      const temp = updatedMarkers[index];
      updatedMarkers[index] = updatedMarkers[index - 1];
      updatedMarkers[index - 1] = temp;
      setMarkersPositions(updatedMarkers);

      // Firebase에서 마커 순서 업데이트
      updateMarkerOrder(updatedMarkers);
    }
  };

  // 마커를 아래로 이동시키는 함수
  const moveMarkerDown = (index) => {
    if (index < markersPositions.length - 1) {
      const updatedMarkers = [...markersPositions];
      const temp = updatedMarkers[index];
      updatedMarkers[index] = updatedMarkers[index + 1];
      updatedMarkers[index + 1] = temp;
      setMarkersPositions(updatedMarkers);

      // Firebase에서 마커 순서 업데이트
      updateMarkerOrder(updatedMarkers);
    }
  };

  // Firebase에서 마커 순서 업데이트하는 함수
  const updateMarkerOrder = async (updatedMarkers) => {
    try {
      // 각 마커의 순서를 Firebase에서 업데이트
      for (let i = 0; i < updatedMarkers.length; i++) {
        const marker = updatedMarkers[i];
        const markerRef = doc(db, 'markers', marker.id);
        await updateDoc(markerRef, { order: i });
      }
    } catch (error) {
      console.error('Error updating marker order:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView provider="google" style={styles.map} region={mapRegion}>
        {/* 마커 및 경로를 표시합니다. */}
        {markersPositions.map((markerPosition, index) => (
          <Marker key={markerPosition.id} coordinate={markerPosition}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        <Polyline coordinates={markersPositions} strokeColor="#000" strokeWidth={3} />
      </MapView>

      <FlatList
        data={markersPositions}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item, index }) => (
          <Card style={styles.cardContainer}>
            <Card.Content>
              <Text style={styles.title}>장소 : {item.placeName}</Text>
              <Text style={styles.title}>계획 : {item.travelPlan}</Text>
              <TouchableOpacity onPress={() => moveMarkerUp(index)}>
                <Text style={styles.button}>Move Up</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => moveMarkerDown(index)}>
                <Text style={styles.button}>Move Down</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 0.5,
  },
  list: {
    flex: 0.5,
  },
  button: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginTop: 5,
  },
  markerText: {
    color: "white",
  },
  markerContainer: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 20,
  },
  cardContainer: {
    marginVertical: 10,
    marginHorizontal: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    color: 'black',
  },
});

export default TravelPlanScreen;
