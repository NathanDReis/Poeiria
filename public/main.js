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
        isLoading.false();
    }
    catch (error) {
        isAlert.toast.danger("Erro", error);
    }
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