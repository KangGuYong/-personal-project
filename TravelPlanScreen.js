import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native'; // 추가
import { loadMarkers } from './loadMarkers'; // Firebase에서 마커 데이터를 불러오는 함수

const TravelPlanScreen = ({ route }) => {
  const [markersPositions, setMarkersPositions] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadMarkers(setMarkersPositions);
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
        renderItem={({ item }) => (
          <Card style={styles.cardContainer}>
            <Card.Content>
              <Text style={styles.title}>장소 : {item.placeName}</Text>
              <Text style={styles.title}>계획 : {item.travelPlan}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};





// 별도의 스타일 객체 정의
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
    backgroundColor: 'white', // 배경색을 흰색으로 설정
    borderColor: 'black', // 테두리 색을 검정색으로 설정
    borderWidth: 1,
  },
  paragraph: { //추가됨  
    fontSize: 16,// 추가됨 
    color: 'black',// 추가됨 
  }

});

export default TravelPlanScreen;
