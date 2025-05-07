const $box = document.querySelector("#cards");
const $author = document.querySelector("#author");
const vazio = /^\s*$/; 
let registers = [];
let registersCache = [];
let published = true;

async function getAll() {
    try {
        isLoading.true();
        registersCache = await Poeiria.getAll(true);
        
        filterPublished();
        exe();
        filterSaved();
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", "Não foi possível encontrar textos no momento.");
    }
    finally { isLoading.false() }
}

function filterSaved() {
    // Filter
    const filterSaved = JSON.parse(localStorage.getItem(published ? "filter-write-p" : "filter-write"));

    if(filterSaved && (!vazio.test(filterSaved.search) || !vazio.test(filterSaved.author))) {
        document.querySelector("#search").value = filterSaved.search;
        document.querySelector("#author").value = filterSaved.author;
        return search(document.querySelector("#search"));
    } 

    document.querySelector("#search").value = "";
    document.querySelector("#author").value = "";
}

function exe() {
    poeiria(registers);
    author(registers);
}

function poeiria(data) {
    if(!data) return;

    $box.innerHTML = '';

    data.map((poeiria) => {
        $box.innerHTML += `
        <div class="card" style="width: 18rem;">
            <img src="${poeiria.url ?? '../../assets/book.webp'}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${poeiria.title}</h5>
                <p class="card-text">${poeiria.author}</p>
                <a href="../read/index.html?doc=${poeiria.uid}" class="btn btn-primary">Ler</a>
            </div>
        </div>
        `;
    });
}

function author(data) {
    const authors = new Set([...data.map((d) => d.author)]);
    const authorsOrder = [...authors].sort((a,b) => a > b ? 1 : -1 );
    const $select = document.querySelector("#author");
    $select.innerHTML = "";
   
    const option = document.createElement("option");
    option.value = "";
    option.innerHTML = "Todos";
    $select.appendChild(option);

    authorsOrder.forEach((author) => {
        const option = document.createElement("option");
        option.value = author;
        option.innerHTML = author;
        $select.appendChild(option);
    })
}

const search = (element) => {
    const value = element.value;
    const regex = new RegExp(value, 'i');

    const $author = document.querySelector("#author");
    
    localStorage.setItem(published ? "filter-write-p" : "filter-write", JSON.stringify({search: value, author: $author.value}));
    
    if (vazio.test($author.value))
        return poeiria(vazio.test(value) ? registers : registers.filter((register) => (regex.test(register.title) || regex.test(register.lines.join(" ")))));
    
    const regexA = new RegExp($author.value, 'i');
    poeiria(vazio.test(value) ? searchAuthor($author) : registers.filter((register) => 
            (regex.test(register.title) || regex.test(register.lines.join(" "))) && regexA.test(register.author)));
}

const searchAuthor = (element) => {
    const value = element.value;
    const regex = new RegExp(value, 'i');    
    
    const $search = document.querySelector("#search");
    
    localStorage.setItem(published ? "filter-write-p" : "filter-write", JSON.stringify({search: $search.value, author: value}));
    
    if (vazio.test($search.value))
        return poeiria(vazio.test(value) ? registers : registers.filter((register) => regex.test(register.author)));
    
    const regexS = new RegExp($search.value, 'i');
    poeiria(vazio.test(value) ? search($search) : registers.filter((register) => 
        (regexS.test(register.title) || regexS.test(register.lines.join(" "))) && regex.test(register.author)));
}

let isOrderByTitle = true;
function orderByTitle() {
    const filters = document.querySelectorAll(".orderByTitle i");

    
    isOrderByTitle = !isOrderByTitle;

    if (isOrderByTitle) {
        filters[0].classList.remove("hidden");
        filters[1].classList.add("hidden");
        return poeiria(registers.sort((a, b) => a.title.localeCompare(b.title)));
    }

    filters[0].classList.add("hidden");
    filters[1].classList.remove("hidden");
    return poeiria(registers.sort((a, b) => b.title.localeCompare(a.title)));
}

function filterPublished(event = { checked: true }) {
    published = event.checked;
    
    registers = registersCache.filter(i => i.published === published);
    exe();
    isOrderByTitle = false;
    orderByTitle();
    filterSaved();
}