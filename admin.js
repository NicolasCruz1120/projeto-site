function abrirLogs() {
    window.location.href = "logs.html";
}

function registrarLog(acao, mensagem, nivel = 'info') {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || { nome: 'Sistema' };
    const logs = JSON.parse(localStorage.getItem("systemLogs")) || [];
    
    logs.push({
        timestamp: new Date().toISOString(),
        level: nivel,
        user: usuario.nome,
        action: acao,
        message: mensagem,
    });
    
    localStorage.setItem("systemLogs", JSON.stringify(logs));
}


document.addEventListener("DOMContentLoaded", function() {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
    if (!usuario.admin) {
        alert("Acesso restrito a administradores!");
        registrarLog('Acesso restrito', `Usuário ${usuario.nome} tentou acessar o painel administrativo`)
        window.location.href = "index.html";
        return;
    }



    const lista = document.getElementById("lista-chamados");
    const modal = document.getElementById("modal-detalhes");
    const closeBtn = document.querySelector(".close-modal");
    const cancelBtn = document.getElementById("cancelar-edicoes");
    const saveBtn = document.getElementById("salvar-edicoes");
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");
    
    let chamados = JSON.parse(localStorage.getItem("chamados")) || [];
    let chamadoEditando = null;

    function formatStatus(status) {
            const statusMap = {
                'aberto': 'Aberto',
                'em_andamento': 'Em Andamento',
                'resolvido': 'Resolvido'
            };
            return statusMap[status] || 'Aberto';
        }

    function carregarChamados(filtro = "", status = "all") {
        lista.innerHTML = `
        <li class="lista-header">
            <span><b>Usuário</b></span>
            <span><b>Tipo</b></span>
            <span><b>Marca/Modelo</b></span>
            <span><b>Problema</b></span>
            <span><b>Data</b></span>
            <span><b>Status</b></span>
            <span><b>Ações</b></span>
        </li>
        `;

        const chamadosFiltrados = chamados.filter(chamado => {
            const matchesSearch = chamado.usuario.toLowerCase().includes(filtro.toLowerCase()) ||
                                 chamado.tipoAparelho.toLowerCase().includes(filtro.toLowerCase()) ||
                                 chamado.marcaModelo.toLowerCase().includes(filtro.toLowerCase()) ||
                                 chamado.problema.toLowerCase().includes(filtro.toLowerCase());
            
            const matchesStatus = status === "all" || chamado.status === status;
            
            return matchesSearch && matchesStatus;
        });

        if (chamadosFiltrados.length === 0) {
            lista.innerHTML += '<li class="sem-resultados"><p>Nenhum chamado encontrado</p></li>';
            return;
        }

        chamadosFiltrados.forEach((chamado, index) => {
            const item = document.createElement("li");
            item.className = "chamado-item";
            item.innerHTML = `
                <span>${chamado.usuario}</span>
                <span>${chamado.tipoAparelho}</span>
                <span>${chamado.marcaModelo}</span> 
                <span>${chamado.problema.substring(0, 30)}${chamado.problema.length > 30 ? '...' : ''}</span>
                <span>${chamado.data}</span>
                <span class="status-badge ${chamado.status || 'aberto'}">
                    ${formatStatus(chamado.status)}
                </span>
                <span class="acoes">
                    <button class="detalhes-btn" data-index="${index}">Editar</button>
                </span>
            `;
            lista.appendChild(item);
        });
    }


    function abrirModalEdicao(index) {
        chamadoEditando = chamados[index];
        
        document.getElementById("modal-usuario").textContent = chamadoEditando.usuario;
        document.getElementById("modal-tipo").textContent = chamadoEditando.tipoAparelho;
        document.getElementById("modal-marca").textContent = chamadoEditando.marcaModelo;
        document.getElementById("modal-data").textContent = chamadoEditando.data;
        document.getElementById("modal-problema").textContent = chamadoEditando.problema;
    
        document.getElementById("edit-status").value = chamadoEditando.status || "aberto";
        document.getElementById("edit-acompanhamento").value = chamadoEditando.acompanhamento || "";
        document.getElementById("edit-alteracoes").value = chamadoEditando.alteracoes || "";
        document.getElementById("edit-resolucao").value = chamadoEditando.resolucao || "";
        

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function salvarEdicoes() {
        if (!chamadoEditando) return;
        chamadoEditando.status = document.getElementById("edit-status").value;
        chamadoEditando.acompanhamento = document.getElementById("edit-acompanhamento").value;
        chamadoEditando.alteracoes = document.getElementById("edit-alteracoes").value;
        chamadoEditando.resolucao = document.getElementById("edit-resolucao").value;
        
        localStorage.setItem("chamados", JSON.stringify(chamados));
        

        fecharModal();
        carregarChamados(searchInput.value, statusFilter.value);
    }

    function fecharModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        chamadoEditando = null;
    }

    closeBtn.addEventListener("click", fecharModal);
    cancelBtn.addEventListener("click", fecharModal);
    saveBtn.addEventListener("click", salvarEdicoes);
    
    searchInput.addEventListener("input", () => {
        carregarChamados(searchInput.value, statusFilter.value);
    });
    
    statusFilter.addEventListener("change", () => {
        carregarChamados(searchInput.value, statusFilter.value);
    });

    lista.addEventListener("click", (e) => {
        const btn = e.target.closest(".detalhes-btn");
        if (!btn) return;
        
        const index = btn.getAttribute("data-index");
        if (index !== null) {
            abrirModalEdicao(parseInt(index));
        }
    });

    carregarChamados();

    function atualizarContadores() {
        const chamados = JSON.parse(localStorage.getItem("chamados")) || [];
        
        document.getElementById("badge-pendentes").textContent = 
            chamados.filter(c => c.status === 'aberto').length;
        
        document.getElementById("badge-andamento").textContent = 
            chamados.filter(c => c.status === 'em_andamento').length;
        
        document.getElementById("badge-resolvidos").textContent = 
            chamados.filter(c => c.status === 'resolvido').length;
    }

    atualizarContadores();

});