import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';

const TravelPlanScreen = ({ route }) => {
  const { markersPositions = [] } = route.params;

  return (
    <View style={styles.container}>
      <MapView
        provider="google"
        style={styles.map}
        initialRegion={{
          latitude: markersPositions[0].latitude,
          longitude: markersPositions[0].longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04
        }}
      >
        {/* 마커 표시 */}
        {markersPositions.map((markerPosition, index) => (
          <Marker
            key={markerPosition.id}
            coordinate={markerPosition}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {/* 경로 표시 */}
        <Polyline
          coordinates={markersPositions.map((markerPosition) => ({
            latitude: markerPosition.latitude,
            longitude: markerPosition.longitude
          }))}
          strokeColor="#000"
          strokeWidth={3}
        />
      </MapView>

      <FlatList
        data={markersPositions}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.cardContainer}>
            <Card.Content>
              {/* Title과 Paragraph 대신 Text 컴포넌트 사용 */}
              <Text style={styles.title}>장소 : {item.placeName} </Text>
              {/* 계획에 대한 제목 추가 */}
              <Text style={styles.title}>계획 : {item.travelPlan}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>);
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
