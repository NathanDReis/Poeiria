const firebaseConfig = {
    apiKey: "AIzaSyBhU1hvr1YWoOm6SJre_I4AbvfmpZxW92M",
    authDomain: "poeiria.firebaseapp.com",
    projectId: "poeiria",
    storageBucket: "poeiria.appspot.com",
    messagingSenderId: "525160371949",
    appId: "1:525160371949:web:e07339ab7713ef76f21ee4"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();