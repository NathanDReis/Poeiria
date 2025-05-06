const $main = document.querySelector("main");
const $box = document.querySelector("main .box");
const $isMyAccount = document.querySelectorAll(".isMyAccount");
let poeiria;

(async () => {
    try {
        isLoading.true();
        poeiria = await Poeiria.getDoc();
        const date = formatDate(poeiria.createdAt);

        $main.style = `--url: url(${poeiria.url})`;
        
        $box.querySelector(".card-title").innerHTML = poeiria.title;
        $box.querySelector(".card-text").innerHTML = `<i class="bi bi-quote"></i>`;
        $box.querySelector(".card-text").innerHTML += poeiria.lines.join("<br><br>");
        $box.querySelector(".card-footer").innerHTML = `<span>${poeiria.author}</span><span>${date}</span>`;
        
        $isMyAccount.forEach(async (item) => {
            const uid = await Poeiria.getMyUID();
            if(uid === poeiria.createdBy) {
                if(item.id !== "restore") {
                    item.classList.remove("hidden");
                }
            }
        })

        const $modalDelete = document.querySelector(".modal-delete");
        if(poeiria.published)
            return $modalDelete.innerHTML = "Deseja realmente retirar a publicação?";

        document.querySelector("#restore").classList.remove("hidden");
        $modalDelete.innerHTML = "Deseja realmente excluir este texto?";
    }
    catch (error) {
        isAlert.toast.danger("Erro", "Arquivo não encontrado.");
    }
    finally { isLoading.false() }
})()

async function deleteData() {
    try {
        isLoading.true();

        if(poeiria.published) {
            await Poeiria.noPublishedDoc();
            return location.reload();
        }
        
        await Poeiria.deleteDoc();
        location = "../write/index.html";
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", "Não possível concluir a exclusão.");
    }
    finally { isLoading.false() }
}

function clipboard() {
    if (!navigator.clipboard)   
        return isAlert.toast.danger("Erro Cópia", "Seu navegador não suporta a API Clipboard.");
    
    const $clipboards = document.querySelectorAll("#clipboard i");
    
    navigator.clipboard.writeText(`${poeiria.title}\n\n"${poeiria.lines.join("\n")}"\n\n${poeiria.author} | (https://poeiria.web.app/pages/read/index.html?doc=${poeiria.uid})`)
    .then(() => {
        $clipboards[0].classList.add("hidden");
        $clipboards[1].classList.remove("hidden");
        $clipboards[2].classList.add("hidden");
        isAlert.toast.success("Sucesso", "Texto copiado com sucesso!")
    })
    .catch(() => {
        $clipboards[0].classList.add("hidden");
        $clipboards[1].classList.add("hidden");
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

function locationDoc() {
    const docId = new URLSearchParams(location.search).get('doc');
    location = docId ? `../add/index.html?doc=${docId}` : "../add/index.html";
}

async function published() {
    try {
        isLoading.true();
        poeiria['published'] = true;
        await Poeiria.setDoc(poeiria, poeiria.uid);
        location.reload();
    }
    catch (error) {
        isAlert.toast.danger("Erro", "Não foi possível publicar este texto.");
    }
    finally { isLoading.false() }
}