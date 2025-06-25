// Utility Functions
function formatDate(dateString) {
    try {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return "Data inválida";
    }
}

function formatStatus(status) {
    const statusMap = {
        'aberto': 'Aberto',
        'em_andamento': 'Em Andamento',
        'resolvido': 'Resolvido'
    };
    return statusMap[status] || 'Aberto';
}

function getNomeUsuario(userId) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.id === userId);
    return usuario ? usuario.nome : 'Usuário desconhecido';
}

function registrarLog(acao, mensagem, nivel = 'info') {
    try {
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
    } catch (e) {
        console.error("Erro ao registrar log:", e);
    }
}


function abrirLogs() {
    window.location.href = "logs.html";
}

function abrirUsuarios() {
    window.location.href = "gerenciar-usuarios.html";
}

function exportarUsuarios() {
    try {
        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const dataStr = JSON.stringify(usuarios, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportName = 'usuarios_' + new Date().toISOString().slice(0, 10) + '.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
        
        registrarLog('Exportação de dados', 'Usuários exportados para arquivo JSON', 'info');
    } catch (e) {
        console.error("Erro ao exportar usuários:", e);
        alert("Erro ao exportar usuários");
    }
}


function initAdminDashboard() {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
    if (!usuario.admin) {
        alert("Acesso restrito a administradores!");
        registrarLog('Acesso restrito', `Usuário ${usuario.nome} tentou acessar o painel administrativo`, 'warning');
        window.location.href = "/frontend/index.html";
        return;
    }


    const elements = {
        lista: document.getElementById("lista-chamados"),
        modal: document.getElementById("modal-detalhes"),
        closeBtn: document.querySelector(".close-modal"),
        cancelBtn: document.getElementById("cancelar-edicoes"),
        saveBtn: document.getElementById("salvar-edicoes"),
        searchInput: document.getElementById("search-input"),
        statusFilter: document.getElementById("status-filter")
    };


    let state = {
        chamados: JSON.parse(localStorage.getItem("chamados")) || [],
        chamadoEditando: null
    };


    function carregarChamados(filtro = "", status = "all") {
        elements.lista.innerHTML = `
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

        const chamadosFiltrados = state.chamados.filter(chamado => {
            const nomeUsuario = getNomeUsuario(chamado.userId).toLowerCase();
            const matchesSearch = nomeUsuario.includes(filtro.toLowerCase()) ||
                                chamado.tipoAparelho.toLowerCase().includes(filtro.toLowerCase()) ||
                                chamado.marcaModelo.toLowerCase().includes(filtro.toLowerCase()) ||
                                chamado.problema.toLowerCase().includes(filtro.toLowerCase());
            
            const matchesStatus = status === "all" || chamado.status === status;
            
            return matchesSearch && matchesStatus;
        });

        if (chamadosFiltrados.length === 0) {
            elements.lista.innerHTML += '<li class="sem-resultados"><p>Nenhum chamado encontrado</p></li>';
            return;
        }

        chamadosFiltrados.forEach((chamado, index) => {
            const item = document.createElement("li");
            item.className = "chamado-item";
            item.innerHTML = `
                <span>${getNomeUsuario(chamado.userId)}</span>
                <span>${chamado.tipoAparelho}</span>
                <span>${chamado.marcaModelo}</span> 
                <span class="truncate">${chamado.problema.substring(0, 30)}${chamado.problema.length > 30 ? '...' : ''}</span>
                <span>${formatDate(chamado.data)}</span>
                <span class="status-badge ${chamado.status || 'aberto'}">
                    ${formatStatus(chamado.status)}
                </span>
                <span class="acoes">
                    <button class="detalhes-btn" data-index="${index}">Editar</button>
                </span>
            `;
            elements.lista.appendChild(item);
        });
    }

    function abrirModalEdicao(index) {
        state.chamadoEditando = state.chamados[index];
        

        document.getElementById("modal-usuario").textContent = getNomeUsuario(state.chamadoEditando.userId);
        document.getElementById("modal-tipo").textContent = state.chamadoEditando.tipoAparelho;
        document.getElementById("modal-marca").textContent = state.chamadoEditando.marcaModelo;
        document.getElementById("modal-data").textContent = formatDate(state.chamadoEditando.data);
        document.getElementById("modal-problema").textContent = state.chamadoEditando.problema;


        document.getElementById("edit-status").value = state.chamadoEditando.status || "aberto";
        document.getElementById("edit-acompanhamento").value = state.chamadoEditando.acompanhamento || "";
        document.getElementById("edit-alteracoes").value = state.chamadoEditando.alteracoes || "";
        document.getElementById("edit-resolucao").value = state.chamadoEditando.resolucao || "";
        
        elements.modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function salvarEdicoes() {
        if (!state.chamadoEditando) return;
        

        state.chamadoEditando.status = document.getElementById("edit-status").value;
        state.chamadoEditando.acompanhamento = document.getElementById("edit-acompanhamento").value;
        state.chamadoEditando.alteracoes = document.getElementById("edit-alteracoes").value;
        state.chamadoEditando.resolucao = document.getElementById("edit-resolucao").value;
        

        localStorage.setItem("chamados", JSON.stringify(state.chamados));
        

        registrarLog('Edição de chamado', 
                   `Chamado ID ${state.chamadoEditando.id} foi atualizado`, 
                   'info');
        

        fecharModal();
        carregarChamados(elements.searchInput.value, elements.statusFilter.value);
        atualizarContadores();
    }

    function fecharModal() {
        elements.modal.style.display = "none";
        document.body.style.overflow = "auto";
        state.chamadoEditando = null;
    }

    function atualizarContadores() {
        document.getElementById("badge-pendentes").textContent = 
            state.chamados.filter(c => c.status === 'aberto').length;
        
        document.getElementById("badge-andamento").textContent = 
            state.chamados.filter(c => c.status === 'em_andamento').length;
        
        document.getElementById("badge-resolvidos").textContent = 
            state.chamados.filter(c => c.status === 'resolvido').length;
    }


    elements.closeBtn.addEventListener("click", fecharModal);
    elements.cancelBtn.addEventListener("click", fecharModal);
    elements.saveBtn.addEventListener("click", salvarEdicoes);
    
    elements.searchInput.addEventListener("input", () => {
        carregarChamados(elements.searchInput.value, elements.statusFilter.value);
    });
    
    elements.statusFilter.addEventListener("change", () => {
        carregarChamados(elements.searchInput.value, elements.statusFilter.value);
    });

    elements.lista.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        
        const index = btn.getAttribute("data-index");
        if (index === null) return;

        if (btn.classList.contains("detalhes-btn")) {
            abrirModalEdicao(parseInt(index));
        }
    });


carregarChamados();
atualizarContadores();
}

document.addEventListener("DOMContentLoaded", function() {
    try {
        initAdminDashboard();
    } catch (e) {
        console.error("Erro ao inicializar dashboard:", e);
        alert("Ocorreu um erro ao carregar a página");
        registrarLog('Erro de inicialização', `Erro ao carregar dashboard: ${e.message}`, 'error');
    }
});