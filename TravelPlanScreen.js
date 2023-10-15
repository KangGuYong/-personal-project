import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Card } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps'; // Polyline 추가

const TravelPlanScreen = ({ route }) => {
  const { markersPositions } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider="google"
        style={{ flex: 1 }}
        initialRegion={{
          latitude: markersPositions[0].latitude,
          longitude: markersPositions[0].longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04
        }}
      >
        {/* 마커 표시 */}
        {markersPositions.map((markerPosition) => (
          <Marker key={markerPosition.id} coordinate={markerPosition} />
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
        renderItem={({ item }) => (
          <Card style={{ margin: 10 }}>
            <Card.Content>
              <Text>장소: ({item.latitude}, {item.longitude})</Text>
              <Text>계획: {item.travelPlan}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

export default TravelPlanScreen;
