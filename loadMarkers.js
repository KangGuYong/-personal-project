import { getFirestore, collection, query, getDocs, deleteDoc, orderBy, where } from 'firebase/firestore';
import { app } from './firebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';

const db = getFirestore(app);

// Firestore에서 마커 데이터를 로드하는 함수
export const loadMarkers = async (setMarkersPositions) => {
  try {
    // Firestore에서 markers 컬렉션의 모든 문서 가져오기 ('order' 필드로 정렬)
    const q = query(collection(db, "markers"), orderBy("order"));
    const querySnapshot = await getDocs(q);

    // 각 문서의 데이터를 추출하여 마커 배열 생성
    const markers = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      travelPlan: doc.data().travelPlan || '',
    }));

    // 상태 설정 함수로 마커 위치 업데이트
    setMarkersPositions(markers);
  } catch (error) {
    console.error('오류 발생:', error);
  }
};

// 마커의 여행 계획을 Firestore에 저장하는 함수
export const saveTravelPlanToFirebaseDB = async (
  markerId,
  travelPlan,
  setMarkersPositions,
  markersPositions
) => {
  try {
    await updateDoc(doc(db, "markers", markerId), {
      travelPlan: travelPlan,
    });

    // 마커 위치 배열 업데이트
    const updatedMarkersPositions = markersPositions.map((marker) =>
      marker.id === markerId ? { ...marker, travelPlan: travelPlan } : marker
    );
    setMarkersPositions(updatedMarkersPositions);

    console.log("여행 계획이 저장되었습니다.");
  } catch (error) {
    console.error("문서 업데이트 오류: ", error);
  }
};

// Firestore에서 마커를 삭제하는 함수
export const deleteMarkerFromFirebaseDB = async (markerId) => {
  try {
    // markerId에 해당하는 문서 가져오기
    const markerDocRef = doc(db, "markers", markerId);
    let markerSnap = await getDoc(markerDocRef);

    if (!markerSnap.exists()) {
      console.error("해당 문서가 없습니다!");
      return;
    }

    // 삭제할 문서의 order 값 가져오기
    let deletedOrderValue = markerSnap.data().order;

    // 삭제할 문서 이후의 모든 문서 조회하기
    let subsequentQuerySnapshot = await getDocs(
      query(collection(db, "markers"), where("order", ">", deletedOrderValue))
    );

    subsequentQuerySnapshot.forEach(async (doc) => {
      let updatedOrderValue = doc.data().order - 1;
      await updateDoc(doc.ref, { order: updatedOrderValue });
    });

    // 문서 삭제
    await deleteDoc(markerDocRef);

    console.log("마커가 삭제되었습니다.");
    return markerId;
  } catch (error) {
    console.error("문서 삭제 오류: ", error);
  }
};

export default loadMarkers;
