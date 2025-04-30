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
        openDialog.alert("LOGIN", error);
    }
}

// DIALOG
document.querySelector("body").innerHTML += `
    <dialog>
        <article>
            <div class="box">
                <h1></h1>
                <p></p>
                <div class="buttons">
                    <button type="button" style="--color: tomato;" onclick="closeDialog(false)">Cancelar</button>
                    <button type="button" style="--color: blue;" onclick="closeDialog(true)">Ok</button>
                </div>
            </div>
        </article>
    </dialog>`
    
const $dialog = document.querySelector("dialog");
const dialogTitle = $dialog.querySelector(".box h1");
const dialogText = $dialog.querySelector(".box p");
const dialogButtons = $dialog.querySelectorAll(".box .buttons button");
let dialogResponse = undefined;
let dialogType;

const openDialog = {
    alert: (title, error="Poeiria team") => {
        dialogTitle.innerHTML = title;
        dialogText.innerHTML = error;
        dialogButtons[0].classList.add("hidden");
        dialogType = 'alert';
        $dialog.show();
    },
    confirm: (title, message="Poeiria team") => {
        dialogTitle.innerHTML = title;
        dialogText.innerHTML = message;
        dialogType = 'confirm';
        $dialog.show();

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if(dialogResponse != undefined) {
                    clearInterval(interval);
                    const result = dialogResponse;
                    dialogResponse = undefined;
                    resolve(result);
                }
            })
        })
    }
}

function closeDialog(response) {
    dialogTitle.innerHTML = "";
    dialogText.innerHTML = "";
    dialogButtons[0].classList.remove("hidden");
    $dialog.close();
    if(dialogType != 'alert') return dialogResponse = response;
}