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
        if(uid !== '') backPage('home');
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
        backPage('home');
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", error);
    }
    finally { isLoading.false() }
}

const registration = async () => {
    try {
        if(!$form.checkValidity()) 
            return isAlert.toast.info("Validação", "Preencha os dados corretamente.");

        isLoading.true();
        await Poeiria.createUser($form.email.value, $form.password.value);
        backPage('home');
    }
    catch (error) {
        console.error(error);
        isAlert.toast.danger("Erro", error);
    }
    finally { isLoading.false() }
}

const vazio = /^\s*$/; 
const recoverPassword = async () => {
    try {
        if(vazio.test($form.email.value)) 
            return isAlert.toast.info("Validação", "Preencha o campo de email para prosseguir.");

        isLoading.true();
        await Poeiria.recoverPassword($form.email.value);
        isAlert.toast.light("Redefinição de Senha", "Confira seu email para criar a nova senha.");
    }
    catch (error) {
        console.error(error)
        isAlert.toast.danger("Erro", "Não foi possível redefinir a senha no momento.");
    }
    finally { isLoading.false() }
}

const $loginGoogle = document.querySelector("#loginGoogle");
$loginGoogle.onclick = () => {
    Poeiria.loginG();
}