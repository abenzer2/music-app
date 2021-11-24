import firebase from 'firebase/app';
import "firebase/auth";
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCQSpaAGMjrnJ0TT_DSFliqoCYOjaTpbgY",
  authDomain: "mui-course.firebaseapp.com",
  projectId: "mui-course",
  storageBucket: "mui-course.appspot.com",
  messagingSenderId: "866227362786",
  appId: "1:866227362786:web:8e0a2630b0087ca64037bb",
  measurementId: "G-M1N1K5F8WP"
};

  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db= firebase.firestore();
  const storage = firebase.storage();

  const usersCollection = db.collection('users');
  const songsCollection = db.collection('songs');
  const commentsCollection = db.collection('comments');

  export { 
    auth,
    db,
    usersCollection,
    songsCollection,
    commentsCollection,
    storage
  }