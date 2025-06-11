function registrarLog(acao, mensagem, nivel = 'info') {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || { nome: 'Sistema' };
    const logs = JSON.parse(localStorage.getItem("systemLogs")) || [];
    
    logs.push({
        timestamp: new Date().toISOString(),
        level: nivel,
        user: usuario.nome,
        action: acao,
        message: mensagem
    });
    
    localStorage.setItem("systemLogs", JSON.stringify(logs));
}


document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    const username = document.getElementById("username");
    const  confirmarsenha = document.getElementById("confirmar-senha");
    const paginaatual = window.location.pathname.split('/').pop();



    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!email.value || !senha.value || !username.value) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email.value)) {
            alert("Por favor, insira um e-mail válido.");
            return;
        }
        if (paginaatual === 'index.html') {

            if (senha.value.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres.");
                return;
            }

            if (senha.value !== confirmarsenha.value) {
                alert("As senhas devem ser iguais")
                return;
            }
        }
        


        const isAdmin = (username.value.toLowerCase() === "admin" && senha.value === "senhaadmin" );

        const usuario = {
            nome: username.value,
            email: email.value,
            senha: senha.value,
            admin: isAdmin
        };

        localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

        alert("Login realizado com sucesso!");
        registrarLog('Login', `Usuário ${username.value} fez login no sistema`)
        
        if (isAdmin) {
            window.location.href = "admin.html";
        } else {
            window.location.href = "chamados.html";
        }
    });
});