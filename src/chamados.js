document.addEventListener("DOMContentLoaded", function () {
    try {
        const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
        
        if (!usuario) {
            throw new Error("Usuário não logado");
        }

        const username = usuario.nome;
        console.log("Usuário logado:", username);
        

        const usernameElement = document.getElementById("username");
        if (usernameElement) {
            usernameElement.textContent = username;
        } else {
            console.warn("Elemento para exibir o username não encontrado");
        }

    } catch (error) {
        console.error("Erro ao recuperar usuário:", error.message);
            window.location.href = "login.html";
        return;
    }


    const form = document.querySelector("form");
    const tipoAparelho = document.getElementById("tipo-aparelho");
    const marcaModelo = document.getElementById("marca-modelo");
    const problema = document.getElementById("problema");

    if (!form || !tipoAparelho || !marcaModelo || !problema) {
        console.error("Elementos do formulário não encontrados");
        return;
    }

    

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        try {
            const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
            if (!usuario) {
                throw new Error("Usuário não autenticado");
            }

            const chamado = {
                usuario: usuario.nome,
                userId: usuario.id, 
                tipoAparelho: tipoAparelho.value.trim(),
                marcaModelo: marcaModelo.value.trim(),
                problema: problema.value.trim(),
                data: new Date().toISOString(), 
                dataExibicao: new Date().toLocaleString(),
                status: "Aberto",
                acompanhamento: "Chamado recebido",
                alteracoes: []
            };

            if (!chamado.tipoAparelho || !chamado.marcaModelo || !chamado.problema) {
                exibirMensagem("Por favor, preencha todos os campos obrigatórios", "error");
                return;
            }

            const chamados = JSON.parse(localStorage.getItem("chamados")) || [];
            chamados.push(chamado);
            localStorage.setItem("chamados", JSON.stringify(chamados));

            exibirMensagem("Chamado enviado com sucesso!", "success");
            form.reset();

        } catch (error) {
            console.error("Erro ao enviar chamado:", error);
            exibirMensagem("Ocorreu um erro ao enviar o chamado", "error");
        }
    });

    function exibirMensagem(texto, tipo = "success") {
        const existingMsg = document.querySelector(".custom-message");
        if (existingMsg) existingMsg.remove();

        const msg = document.createElement("div");
        msg.className = "custom-message";
        msg.textContent = texto;
        
        const styles = {
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "15px 25px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            zIndex: "1000",
            color: "white",
            animation: "fadeIn 0.3s ease-in-out"
        };

        if (tipo === "success") {
            styles.background = "#4CAF50";
        } else if (tipo === "error") {
            styles.background = "#f44336";
        } else {
            styles.background = "#2196F3";
        }

        Object.assign(msg.style, styles);
        
        document.body.appendChild(msg);
        setTimeout(() => {
            msg.style.animation = "fadeOut 0.3s ease-in-out";
            setTimeout(() => msg.remove(), 300);
        }, 3000);
    }
});