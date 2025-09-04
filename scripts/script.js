// Datos de ejemplo para simular la aplicación
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let lists = JSON.parse(localStorage.getItem('lists')) || [];

// Elementos del DOM
const registerModal = document.getElementById('register-modal');
const loginModal = document.getElementById('login-modal');
const createListModal = document.getElementById('create-list-modal');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const heroRegisterBtn = document.getElementById('hero-register-btn');
const goToLoginBtn = document.getElementById('go-to-login');
const goToRegisterBtn = document.getElementById('go-to-register');
const closeModalButtons = document.querySelectorAll('.close-modal');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const createListForm = document.getElementById('create-list-form');
const createListBtn = document.getElementById('create-list-btn');
const myListsSection = document.getElementById('my-lists');
const listsGrid = document.querySelector('.lists-grid');
let navLinks = document.querySelector('.nav-links');

// Mostrar u ocultar modales
function showModal(modal) {
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

// Event listeners para los botones de registro/login
registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(registerModal);
});

loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(loginModal);
});

heroRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(registerModal);
});

goToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideModal(registerModal);
    showModal(loginModal);
});

goToRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideModal(loginModal);
    showModal(registerModal);
});

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        hideModal(registerModal);
        hideModal(loginModal);
        hideModal(createListModal);
    });
});

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target === registerModal) hideModal(registerModal);
    if (e.target === loginModal) hideModal(loginModal);
    if (e.target === createListModal) hideModal(createListModal);
});

// Registro de usuario
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    // Verificar si el usuario ya existe
    if (users.find(user => user.email === email)) {
        alert('Este correo electrónico ya está registrado');
        return;
    }

    // Crear nuevo usuario
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password // En una app real, esto debería estar encriptado
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Iniciar sesión automáticamente
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert('Registro exitoso. ¡Bienvenido/a!');
    hideModal(registerModal);
    updateUIForAuthState();
});

// Inicio de sesión
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('Credenciales incorrectas');
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert(`Bienvenido/a de nuevo, ${user.name}`);
    hideModal(loginModal);
    updateUIForAuthState();
});

// Crear nueva lista
if (createListBtn) {
    createListBtn.addEventListener('click', () => {
        if (!currentUser) {
            showModal(loginModal);
            return;
        }
        showModal(createListModal);
    });
}

if (createListForm) {
    createListForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('list-name').value;
        const description = document.getElementById('list-description').value;
        const collaboratorsInput = document.getElementById('list-collaborators').value;

        const collaborators = collaboratorsInput
            ? collaboratorsInput.split(',').map(email => email.trim())
            : [];

        // Añadir al usuario actual como colaborador
        if (!collaborators.includes(currentUser.email)) {
            collaborators.push(currentUser.email);
        }

        const newList = {
            id: Date.now().toString(),
            name,
            description,
            owner: currentUser.id,
            collaborators,
            items: [],
            createdAt: new Date().toISOString()
        };

        lists.push(newList);
        localStorage.setsetItem('lists', JSON.stringify(lists));

        alert('Lista creada exitosamente');
        hideModal(createListModal);
        renderUserLists();
    });
}

// Renderizar las listas del usuario
function renderUserLists() {
    if (!currentUser) return;

    const userLists = lists.filter(list =>
        list.owner === currentUser.id ||
        list.collaborators.includes(currentUser.email)
    );

    listsGrid.innerHTML = '';

    if (userLists.length === 0) {
        listsGrid.innerHTML = `
            <div class="no-lists">
                <p>No tienes listas aún. ¡Crea una para comenzar!</p>
            </div>
        `;
        return;
    }

    userLists.forEach(list => {
        const listElement = document.createElement('div');
        listElement.className = 'list-card';
        listElement.innerHTML = `
            <h3>${list.name}</h3>
            <div class="list-meta">
                <p>${list.description || 'Sin descripción'}</p>
                <p>Creada: ${new Date(list.createdAt).toLocaleDateString()}</p>
                <p>Items: ${list.items.length}</p>
                <p>Colaboradores: ${list.collaborators.length}</p>
            </div>
            <div class="list-actions">
                <button class="btn btn-outline">Abrir</button>
                <button class="btn btn-primary">Compartir</button>
            </div>
        `;
        listsGrid.appendChild(listElement);
    });
}

// Actualizar la UI según el estado de autenticación
function updateUIForAuthState() {
    if (currentUser) {
        // Cambiar botones de login/register a perfil y cerrar sesión
        navLinks.innerHTML = `
            <li><a href="#">Inicio</a></li>
            <li><a href="#how-it-works">Cómo funciona</a></li>
            <li><a href="#features">Características</a></li>
            <li><a href="#" id="profile-btn">Hola, ${currentUser.name}</a></li>
            <li><a href="#" id="logout-btn" class="btn btn-outline">Cerrar sesión</a></li>
        `;

        // Mostrar sección de listas
        myListsSection.style.display = 'block';
        renderUserLists();

        // Añadir event listeners a los nuevos botones
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateUIForAuthState();
            alert('Sesión cerrada correctamente');
        });
    } else {
        // Restaurar botones de login/register
        navLinks.innerHTML = `
            <li><a href="#">Inicio</a></li>
            <li><a href="#how-it-works">Cómo funciona</a></li>
            <li><a href="#features">Características</a></li>
            <li><a href="#" id="login-btn" class="btn btn-outline">Iniciar Sesión</a></li>
            <li><a href="#" id="register-btn" class="btn btn-primary">Registrarse</a></li>
        `;

        // Ocultar sección de listas
        myListsSection.style.display = 'none';

        // Reasignar event listeners a los botones de login/register
        document.getElementById('login-btn').addEventListener('click', (e) => {
            e.preventDefault();
            showModal(loginModal);
        });

        document.getElementById('register-btn').addEventListener('click', (e) => {
            e.preventDefault();
            showModal(registerModal);
        });
    }
}

// Inicializar la aplicación
function initApp() {
    updateUIForAuthState();
}

// Ejecutar la inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);