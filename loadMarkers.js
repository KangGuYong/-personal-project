import { getFirestore, collection, query, getDocs, deleteDoc, orderBy , where } from 'firebase/firestore'; // 'where' 추가
import { app } from './firebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';

const db = getFirestore(app);

export const loadMarkers = async (setMarkersPositions) => {
  try {
    // Firestore에서 markers 컬렉션의 모든 문서 가져오기 ('order' 필드로 정렬)
    const q = query(collection(db, "markers"), orderBy("order"));
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

// 맞게 삭제 함수 
export const deleteMarkerFromFirebaseDB = async (markerId) => {
  try {
    // markerId에 해당하는 문서 가져오기
    const markerDocRef = doc(db, "markers", markerId);
    let markerSnap = await getDoc(markerDocRef);

    if (!markerSnap.exists()) {
      console.error("No such document!");
      return;
    }

    // 삭제할 문서의 order 값 가져오기 
    let deletedOrderValue = markerSnap.data().order;

     // 삭제할 문서 이후의 모든 문서 조회하기 
     let subsequentQuerySnapshot=await getDocs(query(collection(db,"markers"),where("order",">",deletedOrderValue)));

     
     subsequentQuerySnapshot.forEach(async(doc)=>{
         let updatedOrderValue=doc.data().order -1;
         updateDoc(doc.ref,{ order : updatedOrderValue});
        });

   
        //문서 삭제
        await deleteDoc(markerDocRef);

        console.log("마커가 삭제되었습니다.");
        return markerId;

      
    
   } catch(error){
      console.error("Error removing document: ", error);
   }
}


export default loadMarkers;
