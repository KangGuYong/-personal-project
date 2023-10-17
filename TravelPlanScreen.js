import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper'; // Title, Paragraph 추가
import MapView, { Marker, Polyline } from 'react-native-maps';

const TravelPlanScreen = ({ route }) => {
  const { markersPositions } = route.params;

  return (
    <View style={{ flex: 3 }}>
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
        {markersPositions.map((markerPosition,index) => (
           <Marker 
             key={markerPosition.id} 
             coordinate={markerPosition}
           >
             <View style={{ backgroundColor: "red", padding: 10, borderRadius: 20 }}>
               <Text style={{ color: "white" }}>{index + 1}</Text>
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
        renderItem={({ item }) => (
          <Card style={{ marginVertical :1 , marginHorizontal :1}}>
            <Card.Content>
              {/* Title과 Paragraph 컴포넌트 사용 */}
              <Title>장소</Title>  
              <Paragraph>({item.latitude}, {item.longitude})</Paragraph> 
              {/* 계획에 대한 제목 추가 */}
              <Title>계획</Title>  
              {/* 계획에 대한 내용 추가 */}
              <Paragraph>{item.travelPlan}</Paragraph>
            </Card.Content>
            
            {/* Card.Actions 추가 - 필요에 따라 버튼 등 다른 요소를 넣을 수 있습니다.*/}
            {/*<Card.Actions>
               ... 여기에 액션 아이템들(예 : 버튼)을 넣으세요.
            </Card.Actions>*/}
            
          </Card>

          
          
          
          
         
         
         
         
         
           
       )}
     />
   </View>);
};

export default TravelPlanScreen;
