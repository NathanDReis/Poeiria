document.addEventListener('DOMContentLoaded', function () {
    /* TOOLTIP Bootstrap */
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl =>
      new bootstrap.Tooltip(tooltipTriggerEl)
    );
});  

const createLoading = () => {
    const $html = document.querySelector("html");
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading";
    
    const loadingSpan = document.createElement("span");
    loadingSpan.classList.add("loader");
    loadingDiv.appendChild(loadingSpan);
    
    $html.appendChild(loadingDiv);
}

const isLoading = {
    true: () => {
        createLoading();
    },
    false: () => {
        const $loadingDiv = document.querySelector("#loading");
        $loadingDiv.remove();
    }
}

async function logout() {
    try {
        isLoading.true();
        await Poeiria.logout();
    }
    catch (error) {
        isAlert.toast.danger("Erro", error);
    }
    finally { isLoading.false() }
}

// TOAST
document.querySelector("body").innerHTML += `
     <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto" id="toastTitle"></strong>
          <small id="toastComplement"></small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body" id="toastMessage"></div>
      </div>
    </div>`;

const toastExecute = (title="Poeiria", message="", complement="", type="") => {
    const $toastTitle = document.querySelector("#toastTitle");
    const $toastComplement = document.querySelector("#toastComplement");
    const $toastMessage = document.querySelector("#toastMessage");
    
    $toastTitle.innerHTML = title;
    $toastComplement.innerHTML = complement;
    $toastMessage.innerHTML = message;
    
    const toastLive = document.getElementById('liveToast');
    toastLive.classList.add(type);
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
    toastBootstrap.show();
}

const isAlert = {
    toast: {
        light: (title, message, complement) => toastExecute(title, message, complement, "text-bg-light"),
        info: (title, message, complement) => toastExecute(title, message, complement, "text-bg-info"),
        danger: (title, message, complement) => toastExecute(title, message, complement, "text-bg-danger"),
        success: (title, message, complement) => toastExecute(title, message, complement, "text-bg-success"),
    }
}

// FORMAT TIMESTAMPS
const zero = (number) => {
    if(number < 10 && number >= 0) 
        return `0${number}`

    if(number < 0) 
        return `-0${number*-1}`

    return number;
}
const formatDate = (date) => {
    const result = date.seconds 
        ? new Date(date.seconds * 1000 + Math.floor(date.nanoseconds / 1000000))
        : new Date(date);

    const day = zero(result.getDate());
    const month = zero(result.getMonth() + 1);
    const year = zero(result.getFullYear());

    return `${day}/${month}/${year}`;
}

/* VOLTAR */
function backPage(page, isRead) {
    if (page) return locationApp(`../${page}/index.html`, page);

    let url = document.referrer;
    if (url.length === 0) return backPage('home');

    if (url.includes("write")) {
        page = 'write';
        url = '../write/index.html?view=';
    }

    if (url.includes("home")) {
        page = 'home';
        url = '../home/index.html?view=';
    }

    if (url.includes("read")) {
        page = 'read';
        url = '../read/index.html?doc=';
    }

    const docId = new URLSearchParams(location.search).get('doc');
    if (!docId) return locationApp(url, page);

    if (docId) {
        url += docId;
    }

    if (!(url.includes("add") && isRead)) 
        return locationApp(url, page);

    const history = sessionStorage.getItem("history") ?? "[home]";
    const historyList = JSON.parse(history);
    const historyPath = historyList.length > 2 ? historyList.length - 4 : 0
    url = `../${historyList[historyPath].page}/index.html?view=` + docId;

    locationApp(url, page);
}

function locationApp(url, page) {
    const history = sessionStorage.getItem("history") ?? "[]";
    const historyList = JSON.parse(history);
    historyList.push({
        id: historyList.length,
        url,
        page,
    });
    sessionStorage.setItem("history", JSON.stringify(historyList));
    window.location = url;
}

function scroll() {
    const viewId = new URLSearchParams(location.search).get('view');
    if (!viewId) return;
    
    const docView = document.getElementById(viewId);
    if (!docView) return;

    docView.scrollIntoView({ behavior: "smooth", block: "center"});
}