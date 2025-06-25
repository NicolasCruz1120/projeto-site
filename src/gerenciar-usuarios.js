document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("user-form");
    const userList = document.getElementById("user-list");
    const modal = document.getElementById("modal-editar-usuario");
    const closeModal = document.querySelector(".close-modal");
    const editForm = document.getElementById("edit-user-form");
    const deleteBtn = document.getElementById("delete-user-btn");

    let currentEditIndex = null;

    function carregarUsuarios() {
        return JSON.parse(localStorage.getItem("usuarios")) || [];
    }

    function salvarUsuarios(usuarios) {
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    function renderizarUsuarios() {
        const usuarios = carregarUsuarios();
        userList.innerHTML = "";

        usuarios.forEach((user, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${user.nome}</strong> (${user.email})
                <button data-index="${index}" class="edit-btn"><i class="fas fa-edit"></i></button>
            `;
            userList.appendChild(li);
        });
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const nome = document.getElementById("username").value.trim();
        const senha = document.getElementById("senha").value;

        if (!email || !nome || !senha) {
            alert("Preencha todos os campos.");
            return;
        }

        const usuarios = carregarUsuarios();

        if (usuarios.some(u => u.email === email)) {
            alert("Este e-mail já está cadastrado.");
            return;
        }

        usuarios.push({ nome, email, senha });
        salvarUsuarios(usuarios);

        form.reset();
        renderizarUsuarios();
        alert("Usuário criado com sucesso.");
    });

    userList.addEventListener("click", function (e) {
        if (e.target.closest(".edit-btn")) {
            const index = e.target.closest(".edit-btn").dataset.index;
            const usuarios = carregarUsuarios();
            const user = usuarios[index];
            currentEditIndex = index;

            document.getElementById("edit-username").value = user.nome;
            document.getElementById("edit-email").value = user.email;
            document.getElementById("edit-password").value = "";
            modal.style.display = "block";
        }
    });

    closeModal.addEventListener("click", () => modal.style.display = "none");

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    editForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const usuarios = carregarUsuarios();

        const nome = document.getElementById("edit-username").value.trim();
        const email = document.getElementById("edit-email").value.trim();
        const novaSenha = document.getElementById("edit-password").value;

        if (!nome || !email) {
            alert("Nome e e-mail são obrigatórios.");
            return;
        }

        const duplicado = usuarios.some((u, i) => i != currentEditIndex && u.email === email);
        if (duplicado) {
            alert("Este e-mail já está cadastrado por outro usuário.");
            return;
        }

        usuarios[currentEditIndex].nome = nome;
        usuarios[currentEditIndex].email = email;
        if (novaSenha) {
            usuarios[currentEditIndex].senha = novaSenha;
        }

        salvarUsuarios(usuarios);
        renderizarUsuarios();
        modal.style.display = "none";
        alert("Usuário atualizado.");
    });

    deleteBtn.addEventListener("click", function () {
        if (confirm("Tem certeza que deseja excluir este usuário?")) {
            const usuarios = carregarUsuarios();
            usuarios.splice(currentEditIndex, 1);
            salvarUsuarios(usuarios);
            renderizarUsuarios();
            modal.style.display = "none";
            alert("Usuário excluído.");
        }
    });

    renderizarUsuarios();
});
