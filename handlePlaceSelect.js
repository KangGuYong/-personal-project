import { GOOGLE_MAPS_API_KEY } from "./config";
import axios from 'axios';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';
// Firebase 앱 초기화
const db = getFirestore(app);

/**
 * 장소 선택 핸들러 함수
 *
 * @param {Object} data - 선택된 장소 데이터
 * @param {function} setMarkersPositions - 마커 위치를 업데이트하는 함수
 * @param {function} setShowSearchBar - 검색 바를 숨기는 함수
 * @param {number} currentLength - 현재 마커 배열의 길이
 */
const handlePlaceSelect = async (data, setMarkersPositions, setShowSearchBar, currentLength) => {
  try {
    console.log("선택된 장소 이름: ", data.description);

    // 선택된 장소의 지오코딩 정보를 가져옴
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(data.description)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    console.log('지오코딩 응답:', response.data); 

    if (response.data.status === 'OK') {
      const { lat, lng } = response.data.results[0].geometry.location;
      console.log("선택된 장소의 위도: ", lat);
      console.log("선택된 장소의 경도: ", lng);

      // 새로운 마커 객체 생성
      const newMarker = {
        latitude: lat,
        longitude: lng,
        placeName: data.description,
        travelPlan: ''
      };

      // Firestore에 새로운 마커 추가하고 id 받아오기
      const docRef = await addDoc(collection(db, "markers"), {
        ...newMarker,
        order: currentLength
      });
      
      // Firestore에서 받아온 id를 마커 객체에 추가 
      newMarker.id = docRef.id;

      // 마커 위치 배열에 새로운 마커 추가
      setMarkersPositions(prevState => [
        ...prevState,
        { ...newMarker, order: prevState.length },
      ]);

      setShowSearchBar(false);
    } else {
      console.error('지오코딩 API가 반환한 상태:', response.data.status);
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

export default handlePlaceSelect;
