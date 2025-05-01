const $form = document.querySelector("form");
const $search = document.querySelector("#search");
const $images = document.querySelector("main #images");
const vazio = /^\s*$/; 
let poeiria;
let urlImage = "";
let currentMedia = {};

(async () => {
    try {
        isLoading.true();
        poeiria = await Poeiria.getDoc();
        if(!poeiria) return;

        $form.author.value = poeiria.author;
        $form.title.value = poeiria.title;
        $form.text.value = poeiria.lines.join("\n");
        poeiria.search ? $search.value = poeiria.search : null;
        poeiria.url ? urlImage = poeiria.url : null;
        $form.submit.disabled = false;
        $images.querySelector("img").src = urlImage;
    }
    catch (error) {
        console.error(error);
    }
    finally { isLoading.false() }
})()

const reset = () => {
    $search.value = "";
    urlImage = "";
    $images.innerHTML = "";
    document.querySelector(".current h6").innerHTML = "";
    document.querySelector(".max h6").innerHTML = "";
    $form.reset();
}

$form.addEventListener("input", () => {
    $form.submit.disabled = $form.checkValidity() ? false : true;
})

$form.addEventListener("submit", async (e) => {
    try {
        e.preventDefault();
        isLoading.true();
        const uid = await Poeiria.getMyUID();
    
        if(uid) {
            if((vazio.test(urlImage) && vazio.test($search.value)) || (!vazio.test(urlImage) && !vazio.test($search.value))) {
            
                const data = {
                    updatedAt: (new Date()).toDateString(),
                    author: $form.author.value,
                    title: $form.title.value,
                    lines: $form.text.value.split("\n")
                }
                const regexUrl = /^\s*$/;
                !regexUrl.test(urlImage) ? data['url'] = urlImage : null;
                !regexUrl.test($search.value) ? data['search'] = $search.value : !regexUrl.test(urlImage) ? urlImage : null;
            
                
                if(!poeiria) {
                    data['createdBy'] = uid;
                    data['createdAt'] = new Date().toDateString();
                    data['published'] = false;
                    const docId = await Poeiria.addDoc(data);
                    reset();
                    location = `../read/index.html?doc=${docId}`;
                }
                else {
                    await Poeiria.setDoc(data);
                    const docId = new URLSearchParams(location.search).get('doc');
                    reset();
                    location = `../read/index.html?doc=${docId}`;
                }
            }
            else {
                isAlert.toast.danger("Erro", "Imagem não reconhecida.");
            }
        }
        else {
            isAlert.toast.danger("Erro", "Usuário não possui as permissões.");
        }
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", "Erro ao registrar o arquivo.");
    }
    finally{isLoading.false()}
})

async function getImage(page=1) {
    try {
        isLoading.true();
        
        if(!vazio.test($search.value)) {
            const result = await fetch(`https://api.pexels.com/v1/search/?locale=pt-BR&page=${page}&per_page=16&query=${$search.value}`, {
                headers: {
                    Authorization: "Tjv2x3OIQnFfuvJtPWnXMmlZbfHKBPfoSvOwboq7Hckk5VwIptQY22gs"
                }
            })
            const media = await result.json();

            const numPages = Math.ceil(media.total_results / media.per_page);
            const prevPage = page === 1 ? numPages : page - 1;
            const nextPage = page === numPages ? 1 : page + 1;

            currentMedia['media'] = media;
            currentMedia['prevMedia'] = prevPage;
            currentMedia['nextMedia'] = nextPage;
            currentMedia['numPages'] = numPages;
            document.querySelector(".max h6").innerHTML = currentMedia['numPages'];
            
            return renderImage();
        }
        reset();
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", error);
    }
    finally { isLoading.false() }
}
$search.onkeydown = (event) => {
    if(event.key === 'Enter') {
        getImage();
    }
}

async function renderImage(page='media') {
    $images.innerHTML = "";

    if(page !== 'media') {
        getImage(currentMedia[page]);
    }
    else {
        document.querySelector(".current h6").innerHTML = currentMedia['media'].page;
        
        currentMedia['media'].photos.forEach((photo) => {
            const img = document.createElement("img");
            img.src = photo.src.large;
            img.onclick = () => {
                const $imgs = $images.querySelectorAll("img");
                $imgs.forEach((i) => i.classList.remove("focus"));
                
                if(urlImage === img.src) {
                    urlImage = "";
                }
                else {
                    urlImage = img.src;
                    img.classList.add("focus");
                }
            }
            $images.appendChild(img);
        })
    }
}

function page(next) {
    next && currentMedia
        ? renderImage('nextMedia')
        : renderImage('prevMedia');
}

function locationDoc() {
    const docId = new URLSearchParams(location.search).get('doc');
    location = docId ? `../read/index.html?doc=${docId}` : "../home/index.html";
}