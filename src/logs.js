document.addEventListener("DOMContentLoaded", function() {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
    if (!usuario.admin) {
        alert("Acesso restrito a administradores!");
        window.location.href = "index.html";
        return;
    }


    let logs = [];
    let currentPage = 1;
    const logsPerPage = 20;
    

    const logsBody = document.getElementById("logs-body");
    const logsSearch = document.getElementById("logs-search");
    const logsLevel = document.getElementById("logs-level");
    const logsDate = document.getElementById("logs-date");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");
    const lastUpdate = document.getElementById("last-update");
    const refreshBtn = document.getElementById("refresh-logs");
    const exportBtn = document.getElementById("export-logs");
    const clearBtn = document.getElementById("clear-logs");


    function carregarLogs() {
        logs = JSON.parse(localStorage.getItem("systemLogs")) || [];
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        atualizarTabela();
        atualizarPaginacao();
        lastUpdate.textContent = new Date().toLocaleString();
    }


    function filtrarLogs() {
        const searchTerm = logsSearch.value.toLowerCase();
        const levelFilter = logsLevel.value;
        const dateFilter = logsDate.value;
        
        const filtered = logs.filter(log => {
            const matchesSearch = log.message.toLowerCase().includes(searchTerm) || 
                                 log.user.toLowerCase().includes(searchTerm) ||
                                 log.action.toLowerCase().includes(searchTerm);
            
            const matchesLevel = levelFilter === "all" || log.level === levelFilter;
            
            const matchesDate = dateFilter === "all" || 
                (dateFilter === "today" && isToday(new Date(log.timestamp))) ||
                (dateFilter === "week" && isThisWeek(new Date(log.timestamp))) ||
                (dateFilter === "month" && isThisMonth(new Date(log.timestamp)));
            
            return matchesSearch && matchesLevel && matchesDate;
        });
        
        return filtered;
    }


    function atualizarTabela() {
        const filteredLogs = filtrarLogs();
        const startIdx = (currentPage - 1) * logsPerPage;
        const paginatedLogs = filteredLogs.slice(startIdx, startIdx + logsPerPage);
        
        logsBody.innerHTML = paginatedLogs.map(log => `
            <tr class="log-row log-${log.level}">
                <td>${formatDate(log.timestamp)}</td>
                <td><span class="log-badge ${log.level}">${log.level.toUpperCase()}</span></td>
                <td>${log.user}</td>
                <td>${log.action}</td>
                <td>${log.message}</td>
                <td>${log.ip || 'N/A'}</td>
            </tr>
        `).join('');
    }

 
    function atualizarPaginacao() {
        const filteredLogs = filtrarLogs();
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }


    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR');
    }

    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    function isThisWeek(date) {
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        return date >= firstDayOfWeek;
    }

    function isThisMonth(date) {
        const today = new Date();
        return date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    }


    function exportarLogs() {
        const filteredLogs = filtrarLogs();
        const csvContent = [
            ['Data/Hora', 'Nível', 'Usuário', 'Ação', 'Detalhes', 'IP'],
            ...filteredLogs.map(log => [
                formatDate(log.timestamp),
                log.level,
                log.user,
                log.action,
                log.message,
                log.ip || 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `logs_solucoesit_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    }

    function limparLogs() {
        if (confirm("Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.")) {
            localStorage.setItem("systemLogs", JSON.stringify([]));
            carregarLogs();
        }
    }


    logsSearch.addEventListener('input', () => {
        currentPage = 1;
        atualizarTabela();
        atualizarPaginacao();
    });

    logsLevel.addEventListener('change', () => {
        currentPage = 1;
        atualizarTabela();
        atualizarPaginacao();
    });

    logsDate.addEventListener('change', () => {
        currentPage = 1;
        atualizarTabela();
        atualizarPaginacao();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            atualizarTabela();
            atualizarPaginacao();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const filteredLogs = filtrarLogs();
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            atualizarTabela();
            atualizarPaginacao();
        }
    });

    refreshBtn.addEventListener('click', carregarLogs);
    exportBtn.addEventListener('click', exportarLogs);
    clearBtn.addEventListener('click', limparLogs);

    carregarLogs();
});