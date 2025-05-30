const collectionName = "poeiria";

auth.onAuthStateChanged(user =>
{
  const $isLoggedItems = document.querySelectorAll(".isLoggedItems");
  const $isNotLoggedItems = document.querySelectorAll(".isNotLoggedItems");
  const $isMyAccount = document.querySelectorAll(".isMyAccount");
  
  if(!user) {
    $isLoggedItems.forEach((item) => {
      item.classList.add("hidden");
    });
    $isMyAccount.forEach((item) => {
      item.classList.add("hidden");
    });
    $isNotLoggedItems.forEach((item) => {
      item.classList.remove("hidden");
    });

    setTimeout(() => {
      $isMyAccount.forEach((item) => {
        item.classList.add("hidden");
      });
    }, 100);
  }
  else {
    $isLoggedItems.forEach((item) => {
      item.classList.remove("hidden");
    });
    $isNotLoggedItems.forEach((item) => {
      item.classList.add("hidden");
    });
  }
})

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
    getAll: async (myPoeiria) => {
      try {  
        return new Promise((resolve) => {
          auth.onAuthStateChanged(async (user) => {
            const uid = user ? user.uid : '';

            let snapshot;
            if (myPoeiria) {
              snapshot = await firestore
                .collection(collectionName)
                .where("createdBy", "==", uid)  
                .where("deletedAt", "==", null)  
                .orderBy('title', 'asc')
                .get();
            } else {
              snapshot = await firestore
                .collection(collectionName)
                .where("published", "==", true) 
                .where("deletedAt", "==", null)  
                .orderBy('title', 'asc')
                .get();
            }

            const dadosFormatados = [...snapshot.docs.map(doc => ({
              ...doc.data(),
              uid: doc.id
            }))];
            
            return resolve(dadosFormatados); 
          });
        });
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    addDoc: async (data) => {
      try {
        const docRef = await firestore.collection(collectionName).add(data);      
        return (await docRef.get()).id;
      } catch (error) {
        throw formatedError(error);
      }
    },
    getDoc: async () => {
      try {
        const docId = new URLSearchParams(location.search).get('doc');
        const snapshot = await firestore.collection(collectionName).doc(docId).get();
        return snapshot.data();
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    setDoc: async (newData, uid=false) => {
      try {
        const docId = uid ? uid : new URLSearchParams(location.search).get('doc');
        return await firestore.collection(collectionName).doc(docId).update(newData);
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    noPublishedDoc: async () => {
      try {
        const docId = new URLSearchParams(location.search).get('doc');
        return await firestore.collection(collectionName).doc(docId).update({
          published: false
        });
      } catch (error) {
        throw formatedError(error);
      }
    },
    deleteDoc: async () => {
      try {
        const docId = new URLSearchParams(location.search).get('doc');
        return await firestore.collection(collectionName).doc(docId).update({
          deletedAt: new Date().toDateString()
        });      
      } catch (error) {
        throw formatedError(error);
      }
    },
    createUser: async (email, password) => {
      try {
        await auth.createUserWithEmailAndPassword(email, password);
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    recoverPassword: async (email) => {
      try {
        await auth.sendPasswordResetEmail(email);
      }
      catch (error) {
        throw formatedError(error);
      }
    },
    login: async (email, password) => {
      try {
        await auth.signInWithEmailAndPassword(email, password);        
      } catch (error) {
        throw formatedError(error); 
      }
    },
    logout: async () => {
      try {
        await auth.signOut();        
      } catch (error) {
        throw formatedError(error); 
      }
    },
    getMyUID: () => {
      return new Promise((resolve) => {
        auth.onAuthStateChanged(user => {
            resolve(user ? user.uid : '');
        })
      })
    },
    loginG: async () => {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);

        const url = "../home/index.html";
        const history = sessionStorage.getItem("history") ?? "[]";
        const historyList = JSON.parse(history);
        historyList.push({
            id: historyList.length,
            url,
            page: 'home',
        });
        sessionStorage.setItem("history", JSON.stringify(historyList));
        window.location = url;
      }
      catch (error) {
        throw formatedError(error);
      }
    },
}