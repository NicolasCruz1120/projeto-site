let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

function gerarNovoId() {
    const maxId = usuarios.reduce((max, usuario) => Math.max(max, usuario.id || 0), 0);
    return maxId + 1;
}

function registrarLog(acao, mensagem, nivel = 'info') {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || { nome: 'Sistema' };
    const logs = JSON.parse(localStorage.getItem("systemLogs")) || [];
    
    logs.push({
        timestamp: new Date().toISOString(),
        level: nivel,
        user: usuario.nome,
        userId: usuario.id,
        action: acao,
        message: mensagem,
        ip: ''
    });
    
    localStorage.setItem("systemLogs", JSON.stringify(logs));
}

function registrarUsuario(novoUsuario) {

    const usuarioExistente = usuarios.find(u => u.email === novoUsuario.email);
    if (usuarioExistente) {
        throw new Error("E-mail já cadastrado");
    }


    novoUsuario.id = gerarNovoId();
    

    usuarios.push(novoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    registrarLog('Cadastro', `Novo usuário registrado: ${novoUsuario.nome} (ID: ${novoUsuario.id})`);
    return novoUsuario;
}


function autenticarUsuario(email, senha) {
    const usuario = usuarios.find(u => u.email === email);
    
    if (!usuario) {
        throw new Error("Usuário não encontrado");
    }

    if (usuario.senha !== senha) {
        throw new Error("Senha incorreta");
    }

    return usuario;
}


function atualizarUsuario(id, dadosAtualizados) {
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index === -1) {
        throw new Error("Usuário não encontrado");
    }

    usuarios[index] = { ...usuarios[index], ...dadosAtualizados };
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    registrarLog('Atualização', `Usuário ID ${id} atualizado`);
    return usuarios[index];
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    const username = document.getElementById("username");
    const confirmarsenha = document.getElementById("confirmar-senha");
    const paginaatual = window.location.pathname.split('/').pop();

    usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];


    if (paginaatual === 'index.html' && usuarios.length === 0) {
        const adminPadrao = {
            id: 1, 
            nome: "admin",
            email: "admin@solucoesit.com",
            senha: "senhaadmin",
            admin: true
        };
        usuarios.push(adminPadrao);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        try {

            if (!email.value || !senha.value || !username.value) {
                throw new Error("Por favor, preencha todos os campos.");
            }

            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailRegex.test(email.value)) {
                throw new Error("Por favor, insira um e-mail válido.");
            }

            if (paginaatual === 'index.html') {

                if (senha.value.length < 6) {
                    throw new Error("A senha deve ter pelo menos 6 caracteres.");
                }

                if (senha.value !== confirmarsenha.value) {
                    throw new Error("As senhas devem ser iguais");
                }

                // Registra novo usuário
                const novoUsuario = {
                    nome: username.value,
                    email: email.value,
                    senha: senha.value,
                    admin: false
                };

                const usuarioRegistrado = registrarUsuario(novoUsuario);
                alert(`Cadastro realizado com sucesso!`);
                window.location.href = "/frontend/login.html";
                
            } else {

                const usuario = autenticarUsuario(email.value, senha.value);

                localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

                registrarLog('Login', `Usuário ${usuario.nome} (ID: ${usuario.id}) fez login`);
                alert("Login realizado com sucesso!");

                if (usuario.admin) {
                    window.location.href = "/frontend/admin.html";
                } else {
                    window.location.href = "/frontend/chamados.html";
                }
            }

        } catch (error) {
            console.error("Erro:", error);
            registrarLog('Erro', error.message, 'error');
            alert(error.message);
        }
    });
});