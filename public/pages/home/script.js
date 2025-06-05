const $box = document.querySelector("#cards");
const $author = document.querySelector("#author");
const $search = document.querySelector("#search");
const vazio = /^\s*$/; 
let registers = [];
let filterSaved;

async function getAll() {
    try {
        isLoading.true();

        registers = await Poeiria.getAll();
        
        poeiria(registers);
        author(registers);
        
        // Filter
        filterSaved = JSON.parse(localStorage.getItem("filter"));
        if(filterSaved && (!vazio.test(filterSaved.search) || !vazio.test(filterSaved.author))) {
            $search.value = filterSaved.search;
            $author.value = filterSaved.author;
            search($search);
        } 
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", error);
    }
    finally { isLoading.false() }
}

function poeiria(data) {
    if(!data) return;

    $box.innerHTML = '';

    data.map((poeiria) => {
        $box.innerHTML += `
        <div class="card" style="width: 18rem;" id="${poeiria.uid}">
            <div style="--background: url('${poeiria.url ?? '../../assets/book.webp'}')" class="card-img-top" alt="..."></div>
            <div class="card-body">
                <h5 class="card-title">${poeiria.title}</h5>
                <p class="card-text">${poeiria.author}</p>
                <a id="${poeiria.uid}" onclick="ler(this)" class="btn btn-primary">Ler</a>
            </div>
        </div>
        `;
    });

    scroll()
}

function ler(event) {
    const url = new URL(window.location);
    url.searchParams.set('view', event.id);
    window.history.pushState({}, '', url);
    locationApp(`../read/index.html?doc=${event.id}`, 'read')
}

function author(data) {
    const authors = new Set([...data.map((d) => d.author)]);
    const authorsOrder = [...authors].sort((a,b) => a > b ? 1 : -1 );
    const $select = document.querySelector("#author");
    
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
    
    localStorage.setItem("filter", JSON.stringify({search: value, author: $author.value}));
    
    if (vazio.test($author.value))
        return poeiria(vazio.test(value) ? registers : registers.filter((register) => (regex.test(register.title) || regex.test(register.lines.join(" ")))));
    
    const regexA = new RegExp($author.value, 'i');
    poeiria(vazio.test(value) ? searchAuthor($author) : registers.filter((register) => 
            (regex.test(register.title) || regex.test(register.lines.join(" "))) && regexA.test(register.author)));
}

const searchAuthor = (element) => {
    const value = element.value;
    const regex = {
        test: (valueTest) => {
            return value === valueTest;
        }
    };    
    
    localStorage.setItem("filter", JSON.stringify({search: $search.value, author: value}));
    
    if (vazio.test($search.value)) 
        return poeiria(vazio.test(value) ? registers : registers.filter((register) => regex.test(register.author)))
    
    const regexS = new RegExp($search.value, 'i');
    poeiria(vazio.test(value) ? search($search) : registers.filter((register) => 
        (regexS.test(register.title) || regexS.test(register.lines.join(" "))) && regex.test(register.author)));
}

let isOrderByTitle = true;
function orderByTitle() {
    const filters = document.querySelectorAll(".orderByTitle i");

    filters.forEach(element => element.classList.toggle("hidden"));
    isOrderByTitle = !isOrderByTitle;

    if (isOrderByTitle)
        return poeiria(registers.sort((a, b) => a.title.localeCompare(b.title)));
    
    return poeiria(registers.sort((a, b) => b.title.localeCompare(a.title)));
}