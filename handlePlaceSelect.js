import { GOOGLE_MAPS_API_KEY } from "./config";
import axios from 'axios';
import { app } from './firebaseConfig';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const db = getFirestore(app);

// 장소 선택 핸들러 함수
const handlePlaceSelect = async (data, setMarkersPositions, setShowSearchBar) => {
  try {
    console.log("선택된 장소 이름: ", data.description);

    // 선택된 장소의 지오코딩 정보를 가져옴
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(data.description)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    console.log('지오코딩 응답:', response.data); // 이 줄 추가

    if (response.data.status === 'OK') {
      const position = response.data.results[0].geometry.location;
      console.log("선택된 장소의 위도: ", position.lat);
      console.log("선택된 장소의 경도: ", position.lng);

      // 새로운 마커 객체 생성
      const newMarker = {
        id: Math.random().toString(),
        latitude: position.lat,
        longitude: position.lng,
      };

      // 마커 위치 배열에 새로운 마커 추가
      setMarkersPositions((prevState) => [
        ...prevState,
        newMarker,
      ]);

      // Firestore에 새로운 마커 추가
      await addDoc(collection(db, 'markers'), newMarker);

      
       setShowSearchBar(false);
      
    } else {
       console.error('지오코딩 API가 반환한 상태:', response.data.status);
    }
    
  } catch (error) {
     console.error('오류 발생:', error);
  }
};

export default handlePlaceSelect;
