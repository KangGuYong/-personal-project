// loadMarkers.js
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import { app } from './firebaseConfig';

const db = getFirestore(app);

export const loadMarkers = async (setMarkersPositions) => {
  try {
    // Firestore에서 markers 컬렉션의 모든 문서 가져오기
    const q = query(collection(db, "markers"));
    const querySnapshot = await getDocs(q);

    // 각 문서의 데이터를 추출하여 마커 배열 생성
    const markers = querySnapshot.docs.map(doc => doc.data());

    // 상태 설정 함수로 마커 위치 업데이트
    setMarkersPositions(markers);
  } catch (error) {
     console.error('오류 발생:', error);
  }
};
