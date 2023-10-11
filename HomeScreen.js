// HomeScreen.js

import React, { useState, useEffect } from 'react';
import { View, Button, Modal, TextInput } from 'react-native';
import MapView, { Marker} from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from './config';
import handlePlaceSelect from './handlePlaceSelect';
import { loadMarkers } from './loadMarkers'; 
// Firebase import statements for deleting a marker.
import { app as firebaseApp}  from './firebaseConfig'
import{ getFirestore ,doc ,deleteDoc}from "firebase/firestore"

const db=getFirestore(firebaseApp);

const HomeScreen = () => {
  const [markersPositions, setMarkersPositions] = useState([]); 
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [travelPlans, setTravelPlans] = useState({});
  const [currentMarkerId, setCurrentMarkerId] = useState(null);

 useEffect(() => {
    loadMarkers(setMarkersPositions);
 }, []);

 return (
    <View style={{ flex: 1 }}>
      <Button title="장소 검색" onPress={() => setShowSearchBar(true)} />

      {/* 장소 검색 바 */}
      {showSearchBar && (
        <GooglePlacesAutocomplete
          placeholder="검색"
          onPress={(data) => handlePlaceSelect(data,
            setMarkersPositions,
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
               onPress={async ()=> {
                 // 마커를 상태에서 삭제합니다.
                 const newMarkers= markersPositions.filter(
                   (marker)=> marker.id !== currentMarkerId);

                 setMarkersPositions(newMarkers);

                // Firebase에서 해당 문서를 삭제합니다.
                await deleteDoc(doc(db,'markers',currentMarkerId));

                setPlanModalVisible(false);
              }}/>
         </View>
       </View>
     </Modal>
   </View>
 );
};

export default HomeScreen;
