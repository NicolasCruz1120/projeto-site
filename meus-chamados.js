document.addEventListener("DOMContentLoaded", function() {
    try {
        const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
        if (!usuario) {
            throw new Error("Usuário não está logado");
        }

        console.log("Usuário logado:", usuario);
        
        const username = usuario.nome;
        localStorage.setItem("username", username);
        console.log("Nome de usuário:", username);

        const usernameElement = document.getElementById("username");
        if (usernameElement) {
            usernameElement.textContent = username;
        } else {
            console.warn("Elemento para exibir o username não encontrado");
        }


        const modal = document.getElementById('modal-detalhes');
        const closeBtn = document.querySelector('.close-modal');
        const lista = document.getElementById("lista-chamados");
        
        if (!modal || !closeBtn || !lista) {
            throw new Error("Elementos do DOM não encontrados");
        }

        const chamados = JSON.parse(localStorage.getItem("chamados")) || [];
        

        const meusChamados = chamados.filter(c => 
            usuario.admin || c.usuario === username
        );


        function abrirModal(chamado) {
            const fields = {
                'modal-tipo': chamado.tipoAparelho,
                'modal-marca': chamado.marcaModelo,
                'modal-problema': chamado.problema,
                'modal-data': formatDate(chamado.data),
                'modal-status': chamado.status,
                'modal-acompanhamento': chamado.acompanhamento,
                'modal-resolucao': chamado.resolucao
            };

            Object.entries(fields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || 'Não informado';
                }
            });

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function fecharModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }


        closeBtn.addEventListener('click', fecharModal);
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                fecharModal();
            }
        });

        if (meusChamados.length === 0) {
            lista.innerHTML = '<li class="sem-chamados"><p>Você ainda não criou nenhum chamado.</p></li>';
            return;
        }


        lista.innerHTML = ''; 
        meusChamados.forEach((chamado, index) => {
            const item = document.createElement("li");
            item.className = "chamado-item";
            item.innerHTML = `
                <span>${chamado.tipoAparelho || 'Não informado'}</span>
                <span>${chamado.marcaModelo || 'Não informado'}</span>
                <span class="truncate">${chamado.problema || 'Não informado'}</span>
                <span>${formatDate(chamado.data) || 'Não informado'}</span>
                <span class="acoes">
                    <button class="detalhes-btn" data-index="${index}">Detalhes</button>
                    ${usuario.admin ? '' : `<button class="remover-btn" data-index="${index}">Remover</button>`}
                </span>
            `;
            lista.appendChild(item);
        });


        lista.addEventListener("click", function(e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const index = btn.getAttribute('data-index');
            if (index === null) return;

            if (btn.classList.contains('detalhes-btn')) {
                abrirModal(meusChamados[index]);
            } else if (btn.classList.contains('remover-btn')) {
                removerChamado(index);
            }
        });


        function removerChamado(localIndex) {
            if (!confirm("Deseja realmente remover este chamado?")) return;

            const chamadoParaRemover = meusChamados[localIndex];
            const indiceReal = chamados.findIndex(
                c => c.usuario === chamadoParaRemover.usuario &&
                     c.data === chamadoParaRemover.data &&
                     c.problema === chamadoParaRemover.problema
            );

            if (indiceReal !== -1) {
                chamados.splice(indiceReal, 1);
                localStorage.setItem("chamados", JSON.stringify(chamados));
                alert("Chamado removido com sucesso!");
                location.reload();
            }
        }

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR');
    }

    } catch (error) {
        console.error("Erro:", error.message);
        alert("Erro: " + error.message);
        window.location.href = "login.html";
    }
});