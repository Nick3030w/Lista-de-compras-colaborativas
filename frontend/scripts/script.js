// URL base de tu API - Cambia el puerto si es necesario
const API_BASE_URL = 'http://localhost:8080/api';

// Almacenamiento de token y usuario
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let jwtToken = localStorage.getItem('jwtToken') || null;

// Función para hacer requests autenticados
async function makeAuthenticatedRequest(url, options = {}) {
    if (!jwtToken) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        }
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);

    if (response.status === 401) {
        // Token expirado o inválido
        logout();
        throw new Error('Authentication failed');
    }

    return response;
}

// Función para registrar usuario
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        return await response.text();
    } catch (error) {
        throw new Error(error.message);
    }
}

// Función para iniciar sesión
async function loginUser(loginData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Función para obtener las listas del usuario
async function getUserLists() {
    try {
        const response = await makeAuthenticatedRequest('/lists');
        if (!response.ok) {
            throw new Error('Failed to fetch lists');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching lists:', error);
        throw error;
    }
}

// Función para crear una nueva lista
async function createShoppingList(listData) {
    try {
        const response = await makeAuthenticatedRequest('/lists', {
            method: 'POST',
            body: JSON.stringify(listData)
        });

        if (!response.ok) {
            throw new Error('Failed to create list');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating list:', error);
        throw error;
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
    jwtToken = null;
    currentUser = null;
    updateUIForAuthState();
    alert('Sesión cerrada correctamente');
}

// Modificar el event listener del formulario de registro
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        // 1. Registrar usuario
        await registerUser({ name, email, password });

        // 2. Iniciar sesión automáticamente
        const loginData = await loginUser({ email, password });

        // 3. Guardar token y datos de usuario
        jwtToken = loginData.token;
        currentUser = {
            id: loginData.id,
            name: loginData.name,
            email: loginData.email
        };

        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert('Registro exitoso. ¡Bienvenido/a!');
        hideModal(registerModal);
        updateUIForAuthState();

    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Modificar el event listener del formulario de login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const loginData = await loginUser({ email, password });

        jwtToken = loginData.token;
        currentUser = {
            id: loginData.id,
            name: loginData.name,
            email: loginData.email
        };

        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert(`Bienvenido/a de nuevo, ${currentUser.name}`);
        hideModal(loginModal);
        updateUIForAuthState();

    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Modificar el event listener para crear lista
createListForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('list-name').value;
    const description = document.getElementById('list-description').value;
    const collaboratorsInput = document.getElementById('list-collaborators').value;

    try {
        const listData = {
            name,
            description,
            collaborators: collaboratorsInput ? collaboratorsInput.split(',').map(email => email.trim()) : []
        };

        await createShoppingList(listData);

        alert('Lista creada exitosamente');
        hideModal(createListModal);
        renderUserLists();

    } catch (error) {
        alert('Error creando lista: ' + error.message);
    }
});

// Actualizar la función para renderizar listas
async function renderUserLists() {
    if (!currentUser) return;

    try {
        const lists = await getUserLists();

        listsGrid.innerHTML = '';

        if (lists.length === 0) {
            listsGrid.innerHTML = `
                <div class="no-lists">
                    <p>No tienes listas aún. ¡Crea una para comenzar!</p>
                </div>
            `;
            return;
        }

        lists.forEach(list => {
            const listElement = document.createElement('div');
            listElement.className = 'list-card';
            listElement.innerHTML = `
                <h3>${list.name}</h3>
                <div class="list-meta">
                    <p>${list.description || 'Sin descripción'}</p>
                    <p>Creada: ${new Date(list.createdAt).toLocaleDateString()}</p>
                    <p>Items: ${list.items ? list.items.length : 0}</p>
                    <p>Colaboradores: ${list.collaborators ? list.collaborators.length : 0}</p>
                </div>
                <div class="list-actions">
                    <button class="btn btn-outline" onclick="openList(${list.id})">Abrir</button>
                    <button class="btn btn-primary" onclick="shareList(${list.id})">Compartir</button>
                </div>
            `;
            listsGrid.appendChild(listElement);
        });
    } catch (error) {
        console.error('Error rendering lists:', error);
        listsGrid.innerHTML = `
            <div class="no-lists">
                <p>Error cargando las listas. Intenta recargar la página.</p>
            </div>
        `;
    }
}

// Función para abrir una lista
function openList(listId) {
    // Aquí implementarás la lógica para abrir y editar una lista específica
    alert(`Abriendo lista con ID: ${listId}`);
    // window.location.href = `list.html?id=${listId}`;
}

// Función para compartir una lista
function shareList(listId) {
    // Aquí implementarás la lógica para compartir una lista
    alert(`Compartiendo lista con ID: ${listId}`);
}

// Actualizar la función updateUIForAuthState
function updateUIForAuthState() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const myListsSection = document.getElementById('my-lists');
    const navLinks = document.querySelector('.nav-links');

    if (currentUser && jwtToken) {
        // Usuario autenticado
        if (navLinks) {
            navLinks.innerHTML = `
                <li><a href="#">Inicio</a></li>
                <li><a href="#how-it-works">Cómo funciona</a></li>
                <li><a href="#features">Características</a></li>
                <li><a href="#" id="profile-btn">Hola, ${currentUser.name}</a></li>
                <li><a href="#" id="logout-btn" class="btn btn-outline">Cerrar sesión</a></li>
            `;

            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }

        if (myListsSection) {
            myListsSection.style.display = 'block';
            renderUserLists();
        }

    } else {
        // Usuario no autenticado
        if (navLinks) {
            navLinks.innerHTML = `
                <li><a href="#">Inicio</a></li>
                <li><a href="#how-it-works">Cómo funciona</a></li>
                <li><a href="#features">Características</a></li>
                <li><a href="#" id="login-btn" class="btn btn-outline">Iniciar Sesión</a></li>
                <li><a href="#" id="register-btn" class="btn btn-primary">Registrarse</a></li>
            `;

            // Re-asignar event listeners
            document.getElementById('login-btn').addEventListener('click', (e) => {
                e.preventDefault();
                showModal(loginModal);
            });

            document.getElementById('register-btn').addEventListener('click', (e) => {
                e.preventDefault();
                showModal(registerModal);
            });
        }

        if (myListsSection) {
            myListsSection.style.display = 'none';
        }
    }
}

// Inicializar la aplicación
function initApp() {
    // Verificar si hay un token guardado
    const savedToken = localStorage.getItem('jwtToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        jwtToken = savedToken;
        currentUser = JSON.parse(savedUser);
    }

    updateUIForAuthState();
}

// Ejecutar la inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);