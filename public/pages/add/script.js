const $form = document.querySelector("form");
const $search = document.querySelector("#search");
const $images = document.querySelector("#images");
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
    document.querySelector(".current").innerHTML = "";
    document.querySelector(".max").innerHTML = "";
    $form.reset();
}

$form.addEventListener("input", () => {
    $form.submit.disabled = $form.checkValidity() ? false : true;
})

$form.addEventListener("submit", async (e) => {
    let data = {};

    try {
        e.preventDefault();
        isLoading.true();
        const uid = await Poeiria.getMyUID();
    
        if(!uid)
            return isAlert.toast.danger("Erro", "Usuário não possui as permissões.");

        const completedImage = (vazio.test(urlImage) && vazio.test($search.value));
        const emptyImage = (!vazio.test(urlImage) && !vazio.test($search.value));
        if(!(completedImage || emptyImage))
            return isAlert.toast.danger("Erro", "Imagem não reconhecida.");

        data = {
            updatedAt: (new Date()).toDateString(),
            deletedAt: null,
            author: $form.author.value,
            title: $form.title.value,
            lines: $form.text.value.split("\n")
        }
        const regexUrl = /^\s*$/;
        !regexUrl.test(urlImage) ? data['url'] = urlImage : null;
        !regexUrl.test($search.value) ? data['search'] = $search.value : !regexUrl.test(urlImage) ? urlImage : null;
    
        if(poeiria) 
            return await Poeiria.setDoc(data);
        
        data['createdBy'] = uid;
        data['createdAt'] = new Date().toDateString();
        data['updatedAt'] = null;
        data['published'] = false;
        return await Poeiria.addDoc(data);
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", "Erro ao registrar o arquivo.");
    }
    finally {
        reset();
        isLoading.false();
        localStorage.setItem("filter-write", JSON.stringify({search: data.title, author: data.author}));
        location = `../write/index.html`;
    }
})

async function getImage(page=1) {
    try {
        isLoading.true();
        
        if(!vazio.test($search.value)) {
            let size = document.querySelector("#size");
            let orientation = document.querySelector("#orientation");
            let color = document.querySelector("#color");
            let isColor = document.querySelector("#check-color");
            
            size = size.value != 'all' ? `&size=${size.value}` : '';
            orientation = orientation.value != 'all' ? `&orientation=${orientation.value}` : '';
            color = isColor.checked ? `&color=${color.value.toString().replace("#","")}` : '';

            const url = `https://api.pexels.com/v1/search/?locale=pt-BR&page=${page}&per_page=16&query=${$search.value}${size}${orientation}${color}`;
            console.log(url);
            const result = await fetch(url, {
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
            document.querySelector(".max").innerHTML = currentMedia['numPages'];
            
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

    if(page !== 'media') 
        return getImage(currentMedia[page]);

    document.querySelector(".current").innerHTML = currentMedia['media'].page;
    
    currentMedia['media'].photos.forEach((photo) => {
        const img = document.createElement("img");
        img.src = photo.src.large;
        img.onclick = () => {
            const $imgs = $images.querySelectorAll("img");
            $imgs.forEach((i) => i.classList.remove("focus"));
            
            if(urlImage === img.src)
               return urlImage = "";
            
            urlImage = img.src;
            img.classList.add("focus");
        }
        $images.appendChild(img);
    })
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