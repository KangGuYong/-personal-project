// loadMarkers.js
import { getFirestore, collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
const db = getFirestore(app);

export const loadMarkers = async (setMarkersPositions) => {
  try {
    // Firestore에서 markers 컬렉션의 모든 문서 가져오기
    const q = query(collection(db, "markers"));
    const querySnapshot = await getDocs(q);

    // 각 문서의 데이터를 추출하여 마커 배열 생성
    const markers = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      travelPlan: doc.data().travelPlan || ''
    }));

    // 상태 설정 함수로 마커 위치 업데이트
    setMarkersPositions(markers);
  } catch (error) {
    console.error('오류 발생:', error);
  }
};
export const saveTravelPlanToFirebaseDB = async (markerId, travelPlan) => {
  try {
    await updateDoc(doc(db, "markers", markerId), {
      travelPlan: travelPlan
    });
    console.log("여행 계획이 저장되었습니다.");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
}

// 마커 삭제 함수
export const deleteMarkerFromFirebaseDB = async (markerId) => {
  try {
    await deleteDoc(doc(db, "markers", markerId));
    console.log("마커가 삭제되었습니다.");
    return markerId;
  } catch (error) {
    console.error("Error removing document: ", error);
  }
}

export default loadMarkers;
