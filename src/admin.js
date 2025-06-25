function abrirLogs() {
    window.location.href = "logs.html";
}

function abrirUsuarios() {
    window.location.href = "gerenciar-usuarios.html";
}

function formatDate(dateString) {
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
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

function exportarUsuarios() {

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    

    const dataStr = JSON.stringify(usuarios, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportName = 'usuarios_' + new Date().toISOString().slice(0, 10) + '.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
    
    registrarLog('Exportação de dados', 'Usuários exportados para arquivo JSON', 'info');
}


document.addEventListener("DOMContentLoaded", function() {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
    if (!usuario.admin) {
        alert("Acesso restrito a administradores!");
        registrarLog('Acesso restrito', `Usuário ${usuario.nome} tentou acessar o painel administrativo`)
        window.location.href = "/frontend/index.html";
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
                'aberto': 'aberto',
                'em_andamento': 'Em Andamento',
                'resolvido': 'Resolvido'
            };
            return statusMap[status] || 'aberto';
        }
    function getNomeUsuario(userId) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.id === userId);
    return usuario ? usuario.nome : 'Usuário desconhecido';
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
        const nomeUsuario = getNomeUsuario(chamado.userId).toLowerCase();
        const matchesSearch = nomeUsuario.includes(filtro.toLowerCase()) ||
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
            <span>${getNomeUsuario(chamado.userId)}</span>
            <span>${chamado.tipoAparelho}</span>
            <span>${chamado.marcaModelo}</span> 
            <span>${chamado.problema.substring(0, 30)}${chamado.problema.length > 30 ? '...' : ''}</span>
            <span>${formatDate(chamado.data)}</span>
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
    
    document.getElementById("modal-usuario").textContent = getNomeUsuario(chamadoEditando.userId);
    document.getElementById("modal-tipo").textContent = chamadoEditando.tipoAparelho;
    document.getElementById("modal-marca").textContent = chamadoEditando.marcaModelo;
    document.getElementById("modal-data").textContent = formatDate(chamadoEditando.data);
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