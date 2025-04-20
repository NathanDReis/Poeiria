const $box = document.querySelector("main .box");
const $isMyAccount = document.querySelectorAll(".isMyAccount");
let poeiria;

(async () => {
    try {
        isLoading.true();
        poeiria = await Poeiria.getDoc();
        
        $box.querySelector("h1").innerHTML = poeiria.title;
        $box.querySelector("p").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-quote" viewBox="0 0 16 16"><path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388q0-.527.062-1.054.093-.558.31-.992t.559-.683q.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 9 7.558V11a1 1 0 0 0 1 1zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612q0-.527.062-1.054.094-.558.31-.992.217-.434.559-.683.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 3 7.558V11a1 1 0 0 0 1 1z"/></svg>` 
            + poeiria.lines.join("<br><br>") + ' "<br>' + `<span>${poeiria.author}<span>`;
        $box.style = poeiria.url ? `--url: url(${poeiria.url})` : `--url: url(../../assets/book.webp)`;
        
        $isMyAccount.forEach(async (item) => {
            const uid = await Poeiria.getMyUID();
            if(uid === poeiria.createdBy) {
                if(item.id !== "restore") {
                    item.classList.remove("hidden");
                }
            }
        })

        if(!poeiria.published) {
            const notRestore = document.querySelectorAll(".notRestore");
            notRestore.forEach(n => n.remove());
            document.querySelector("#restore").classList.remove("hidden");
        }
    }
    catch (error) {
        openDialog.alert("Arquivo não encontrado!");
    }
    finally{isLoading.false()}
})()

async function deleteData() {
    try {
        isLoading.true();
        if(poeiria.published) {
            const response = await openDialog.confirm("Deseja retirar a publicação?");
            if(response) {
                await Poeiria.noPublishedDoc();
                location = "../home/index.html";
            }
        }
        else {
            const response = await openDialog.confirm("Excluir PERMANENTEMENTE?");
            if(response) {
                await Poeiria.deleteDoc();
                location = "../write/index.html";
            }
        }
    }
    catch (error) {
        openDialog.alert("Delete", error);
    }
    finally{isLoading.false()}
}

function clipboard() {
    if(navigator.clipboard) {    
        const $clipboards = document.querySelectorAll("#clipboard svg");
        
        navigator.clipboard.writeText(`${poeiria.title}\n\n"${poeiria.lines.join("\n")}"\n\n${poeiria.author} | (https://poeiria.web.app/pages/read/index.html?doc=${poeiria.uid})`)
        .then(() => {
            $clipboards[0].classList.add("hidden");
            $clipboards[1].classList.remove("hidden");
        })
        .catch(() => {
            $clipboards[0].classList.add("hidden");
            $clipboards[2].classList.remove("hidden");
        })
        .finally(() => {
            setTimeout(() => {
                $clipboards[0].classList.remove("hidden");
                $clipboards[1].classList.add("hidden");
                $clipboards[2].classList.add("hidden");
            },1000);
        })
    }
    else {
        openDialog.alert("Cópia", "Seu navegador não suporta a API Clipboard.");
    }
}

function locationDoc() {
    const docId = new URLSearchParams(location.search).get('doc');
    location = docId ? `../add/index.html?doc=${docId}` : "../add/index.html";
}

async function published() {
    try {
        isLoading.true();
        const response = await openDialog.confirm(`Deseja publicar ${poeiria.title}?`);
        if(response) {
           poeiria['published'] = true;
           await Poeiria.setDoc(poeiria, poeiria.uid);
           history.back();
        }
    }
    catch (error) {
        openDialog.alert("Restaurar", error);
    }
    finally{isLoading.false()}
}