const $box = document.querySelector("#cards");
const $author = document.querySelector("#author");
const vazio = /^\s*$/; 
let registers = [];
let filterSaved;

async function getAll() {
    try {
        isLoading.true();
        registers = await Poeiria.getAll(false);
        poeiria(registers);
        author(registers);
        
        // Filter
        filterSaved = JSON.parse(localStorage.getItem("filter-write"));
        if(filterSaved && (!vazio.test(filterSaved.search) || !vazio.test(filterSaved.author))) {
            document.querySelector("#search").value = filterSaved.search;
            document.querySelector("#author").value = filterSaved.author;
            search(document.querySelector("#search"));
        } 
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", "Não foi possível encontrar textos no momento.");
    }
    finally { isLoading.false() }
}

function poeiria(data) {
    if(data) {
        $box.innerHTML = '';
    
        data.sort((a,b) => a.title > b.title ? 1 : -1 );
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
    const regexA = new RegExp($author.value, 'i');

    vazio.test($author.value) 
        ?poeiria(vazio.test(value) ? registers : registers.filter((register) => (regex.test(register.title) || regex.test(register.lines.join(" ")))))
        :poeiria(vazio.test(value) ? searchAuthor($author) : registers.filter((register) => 
            (regex.test(register.title) || regex.test(register.lines.join(" "))) && regexA.test(register.author)));
    localStorage.setItem("filter-write", JSON.stringify({search: value, author: $author.value}));
}

const searchAuthor = (element) => {
    const value = element.value;
    const regex = new RegExp(value, 'i');    
    
    const $search = document.querySelector("#search");
    const regexS = new RegExp($search.value, 'i');
    
    vazio.test($search.value) 
    ?poeiria(vazio.test(value) ? registers : registers.filter((register) => regex.test(register.author)))
    :poeiria(vazio.test(value) ? search($search) : registers.filter((register) => 
        (regexS.test(register.title) || regexS.test(register.lines.join(" "))) && regex.test(register.author)));
    localStorage.setItem("filter-write", JSON.stringify({search: $search.value, author: value}));
}