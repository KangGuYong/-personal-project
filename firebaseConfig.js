import {initializeApp} from 'firebase/app';


const firebaseConfig = {
  apiKey: "AIzaSyDTXverFiIKOqR4y-c4IDM7HfSpSHjzxj4",
  authDomain: "solp-c191f.firebaseapp.com",
  projectId: "solp-c191f",
  storageBucket: "solp-c191f.appspot.com",
  messagingSenderId: "577294579637",
  appId: "1:577294579637:web:028cbd9b9342583cdc4bfc",
  measurementId: "G-QW824N4RFQ"
};

const app = initializeApp(firebaseConfig)

export {app};
