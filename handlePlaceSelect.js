import { GOOGLE_MAPS_API_KEY } from "./config";
import axios from 'axios';
import {app} from './firebaseConfig';
import {getFirestore,collection,addDoc } from 'firebase/firestore';


const db= getFirestore(app);

const handlePlaceSelect = async (data, setMarkersPositions, setShowSearchBar) => {
    try {
      console.log("Selected place's name: ", data.description);
      
      


      
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(data.description)}&key=${GOOGLE_MAPS_API_KEY}`
      );
  
      console.log('Geocoding response:', response.data); // Add this line
  
      if (response.data.status === 'OK') {
        const position = response.data.results[0].geometry.location;
        console.log("Selected place's latitude: ", position.lat);
        console.log("Selected place's longitude: ", position.lng);

        const newMarker = {
            id: Math.random().toString(),
            latitude: position.lat,
            longitude: position.lng,
        };
  
        setMarkersPositions((prevState) => [
          ...prevState,
          newMarker,
        ]);

        // Save the marker to Firestore
        await addDoc(collection(db, 'markers'), newMarker);
        
        setShowSearchBar(false);
        
      } else {
         console.error('Geocoding API returned status:', response.data.status);
      }
      
    } catch (error) {
       console.error('An error occurred:', error);
    }
};

export default handlePlaceSelect;
