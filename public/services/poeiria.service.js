const collectionName = "poeiria";
const hashUID = "XkqfSqDQado4b8XzAAT0";

firebase.auth().onAuthStateChanged(user =>
{
  const $isLoggedItems = document.querySelectorAll(".isLoggedItems");
  const $isNotLoggedItems = document.querySelectorAll(".isNotLoggedItems");
  const $isMyAccount = document.querySelectorAll(".isMyAccount");
  
  if(!user) {
    $isLoggedItems.forEach((item) => {
      item.classList.add("hidden");
    })
    $isMyAccount.forEach((item) => {
      item.classList.add("hidden");
    })
    $isNotLoggedItems.forEach((item) => {
      item.classList.remove("hidden");
    })
  }
  else {
    $isLoggedItems.forEach((item) => {
      item.classList.remove("hidden");
    })
    $isNotLoggedItems.forEach((item) => {
      item.classList.add("hidden");
    })
  }
})

async function hash() {
  const str = new Date().toISOString()
  const hash = [];
  for(let i = 0;i < str.length; i++) {
      hash.push(str.charCodeAt(i));
  }
  await firebase.firestore().collection(collectionName).doc(hashUID).update({
    hash: hash.join("")
  });
}

async function exe(query) {
  try {
    if(query) {
      const response = await query;
      await hash();
      return response;
    }
    throw error;
  }
  catch (error) {
    throw error;
  }
} 

function formatedError(error) {
  switch(error.code) {
    case 'auth/invalid-login-credentials':
      throw 'Credenciais inválidas';

    case 'auth/user-not-found':
      throw 'Usuário não encontrado';

    case 'auth/weak-password':
      throw 'Senha muito fraca';

    case 'auth/invalid-email':
      throw 'Email inválido';

    case 'permission-denied':
      throw 'Permissão negada';

    case 'not-found':
      throw 'Documento não encontrado';

    case 'invalid-argument':
      throw 'Argumento inválido';

    case 'function-not-found':
      throw 'Função não encontrada';

    case 'permission-denied':
      throw 'Permissão negada';

    case 'timeout':
      throw 'Tempo limite excedido';

    case 'auth/password-does-not-meet-requirements':
      throw 'Requerido 6 dígitos e no mínimo um caractere: maiúsculo, minúsculo, numérico e especial'

    default:
      throw error;
  }
}

const Poeiria = {
    getAll: async (published=true) => {
      try {        
        const snapshot = await firebase.firestore()
          .collection(collectionName)
          .where("published", "==", published)  
          .orderBy('title', 'asc')
          .get();
        return [...snapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id
        }))].filter(doc => !doc.deletedAt);
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    addDoc: async (data) => {
      try {
        const docRef = await exe(firebase.firestore().collection(collectionName).add(data));      
        return (await docRef.get()).id;
      } catch (error) {
        throw formatedError(error);
      }
    },
    getDoc: async () => {
      try {
        const docId = new URLSearchParams(location.search).get('doc');
        const snapshot = await firebase.firestore().collection(collectionName).doc(docId).get();
        return snapshot.data();
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    setDoc: async (newData, uid=false) => {
      try {
        const docId = uid ? uid : new URLSearchParams(location.search).get('doc');
        return await exe(firebase.firestore().collection(collectionName).doc(docId).update(newData));
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    noPublishedDoc: async () => {
      try {
        const docId = new URLSearchParams(location.search).get('doc');
        return await exe(firebase.firestore().collection(collectionName).doc(docId).update({
          published: false
        }));
      } catch (error) {
        throw formatedError(error);
      }
    },
    deleteDoc: async () => {
      try {
        const docId = new URLSearchParams(location.search).get('doc');
        return await exe(firebase.firestore().collection(collectionName).doc(docId).update({
          deletedAt: new Date().toDateString()
        }));      
      } catch (error) {
        throw formatedError(error);
      }
    },
    createUser: async (email, password) => {
      try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    recoverPassword: async (email) => {
      try {
        await firebase.auth().sendPasswordResetEmail(email);
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    login: async (email, password) => {
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);        
      } catch (error) {
        throw formatedError(error); 
      }
    },
    logout: async () => {
      try {
        await firebase.auth().signOut();        
      } catch (error) {
        throw formatedError(error); 
      }
    },
    getMyUID: () => {
      return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged(user => {
            resolve(user ? user.uid : '');
        })
      })
    },
    loginG: async () => {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await firebase.auth().signInWithPopup(provider);
        location = "../home/index.html";
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    toast: (title="Poeiria", message="", complement="") => {
      const toastContainer = document.getElementById('toastContainer');
      if(toastContainer) {
        toastContainer.remove();
      }

      const body = document.querySelector("body");
      body.innerHTML = `
      <div class="toast-container position-fixed bottom-0 end-0 p-3" id="toastContainer">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <!-- <img src="..." class="rounded me-2" alt="..."> -->
            <strong class="me-auto">${title}</strong>
            <small>${complement}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            ${message}
          </div>
        </div>
      </div>`;

      const toastLive = document.getElementById('liveToast');
      const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
      toastBootstrap.show();
    }
}