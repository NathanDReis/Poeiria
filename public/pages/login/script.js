const $eyes = document.querySelectorAll("#password-box svg");
const $password = document.querySelector("#password-box input");
$eyes.forEach((eye) => {
    eye.onclick = () => {
        $eyes.forEach((e) => e.classList.toggle("hidden"));
        $password.type = $password.type === 'password' ? 'text' : 'password';
    }
})

const validState = async () => {
    try {
        const uid = await Poeiria.getMyUID();
        if(uid !== '') location = "../home/index.html";
    }
    catch (error) {
        console.error(error);
    }
}
validState();

const $form = document.querySelector("form");
$form.oninput = () => {
    $form.submit.disabled = !$form.checkValidity() && $form.password.value.length > 6;
}

$form.onsubmit = async (e) => {
    try {
        isLoading.true();
        e.preventDefault();
        await Poeiria.login($form.email.value, $form.password.value);
        location = "../home/index.html";
    }
    catch (error) {
        openDialog.alert(error);
    }
    finally{isLoading.false()}
}

const registration = async () => {
    try {
        if($form.checkValidity()) {
            isLoading.true();
            const response = await openDialog.confirm("Criar conta",`Deseja criar ${$form.email.value} com a senha digitada?`);
            if(response) {
                await Poeiria.createUser($form.email.value, $form.password.value);
                location = "../home/index.html";
            }
        }
        else {
            openDialog.alert("Cadastro", "Preencha os dados corretamente!");
        }
    }
    catch (error) {
        openDialog.alert(error);
    }
    finally{isLoading.false()}
}

const vazio = /^\s*$/; 
const recoverPassword = async () => {
    try {
        if(!vazio.test($form.email.value)) {
                isLoading.true();
                await Poeiria.recoverPassword($form.email.value);
                openDialog.alert("Redefinição de Senha", "Confira seu email para criar a nova senha");
        }
        else {
            openDialog.alert("Preencha o email corretamente!");
        }
    }
    catch (error) {
        openDialog.alert(error);
    }
    finally{isLoading.false()}
}

const $loginGoogle = document.querySelector("#loginGoogle");
$loginGoogle.onclick = () => {
    Poeiria.loginG();
}