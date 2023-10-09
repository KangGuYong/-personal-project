import React, { useState, useEffect } from 'react';
import { View, Button, Modal, TextInput } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from './config';
import handlePlaceSelect from './handlePlaceSelect';

const HomeScreen = () => {
  const [markersPositions, setMarkersPositions] = useState([]); // 마커의 위치를 저장하는 상태 변수
  const [showSearchBar, setShowSearchBar] = useState(false); // 검색 바 표시 여부를 저장하는 상태 변수
  const [planModalVisible, setPlanModalVisible] = useState(false); // 모달 창 표시 여부를 저장하는 상태 변수
  const [travelPlans, setTravelPlans] = useState({}); // 모임의 설명 저장하는 상태 변수
  const [currentMarkerId, setCurrentMarkerId] = useState(null); // 현재 선택된 마커의 ID를 저장하는 상태 변수

  return (
    <View style={{ flex: 1 }}>
      <Button title="장소 검색" onPress={() => setShowSearchBar(true)} />

      {/* 장소 검색 바 */}
      {showSearchBar && (
        <GooglePlacesAutocomplete
          placeholder="검색"
          onPress={(data) => handlePlaceSelect(data, setMarkersPositions,
            setShowSearchBar)}
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
          longitudeDelta: 0.04,
        }}
        showsMyLocationButton={true}
        showsUserLocation={true}
      >
        {/* 마커 표시 */}
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
       </MapView>

       {/* 모달 : 마커에 내용 입력 */}
       <Modal animationType="slide" transparent={true} visible={planModalVisible}>
         <View style={{ flex:1 , justifyContent:'center', alignItems:'center'}}>
           <View style={{ backgroundColor:'white', padding:20 , borderRadius :10}}>
             {/* 여행 계획 입력란 */}
             <TextInput 
               placeholder='여행 계획을 입력하세요...'
               value= {travelPlans[currentMarkerId] || ''}
               onChangeText={(text) =>
                 setTravelPlans((prevState) => ({
                   ...prevState,
                   [currentMarkerId]: text,
                 }))
               }
             />

             {/* 계획 저장 버튼 */}
             <Button title='계획 저장' onPress={() =>setPlanModalVisible(false)} />

             {/* 마커 삭제 버튼 */}
             <Button 
               title='마커 삭제'
               onPress={()=> {
                 const newMarkers= markersPositions.filter(
                   (marker)=> marker.id !== currentMarkerId);

                 setMarkersPositions(newMarkers);

                 if(newMarkers.length<2){
                   setRouteCoordinates([]);
                 }

                setPlanModalVisible(false);
              }}/>
           </View>
         </View>
       </Modal>
     </View>
   );
 };

 export default HomeScreen;