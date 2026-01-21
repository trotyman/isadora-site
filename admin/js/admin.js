/**
 * Admin Panel - Isadora Carvalho Arquitetura
 * Gerenciamento de projetos e portfólio
 */

// ========== CONFIGURAÇÃO ==========
const API_URL = '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;
let currentProject = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Verificar autenticação
    if (authToken) {
        try {
            await validateToken();
            showDashboard();
        } catch {
            logout();
        }
    } else {
        showLogin();
    }

    // Event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Mobile menu
    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);

    // New project
    document.getElementById('new-project-btn').addEventListener('click', () => openProjectModal());

    // Save project
    document.getElementById('save-project-btn').addEventListener('click', saveProject);

    // Filters
    document.getElementById('filter-status').addEventListener('change', loadProjects);
    document.getElementById('filter-category').addEventListener('change', loadProjects);

    // Password form
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);

    // File upload
    setupFileUpload();
}

// ========== AUTENTICAÇÃO ==========
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer login');
        }

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);

        showDashboard();
        showToast('Login realizado com sucesso!', 'success');
    } catch (error) {
        errorEl.textContent = error.message;
    }
}

async function validateToken() {
    const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
        throw new Error('Token inválido');
    }

    const data = await response.json();
    currentUser = data.user;
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showLogin();
}

// ========== NAVEGAÇÃO ==========
function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').textContent = '';
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser?.name || '';

    loadStats();
    loadRecentProjects();
    loadCategories();
}

function showSection(sectionName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionName}`);
    });

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        projects: 'Projetos',
        settings: 'Configurações'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';

    // Load section data
    if (sectionName === 'projects') {
        loadProjects();
    }

    // Close mobile menu
    document.querySelector('.sidebar').classList.remove('open');
}

function toggleMobileMenu() {
    document.querySelector('.sidebar').classList.toggle('open');
}

// ========== DASHBOARD ==========
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/projects/admin/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('stat-total').textContent = data.stats.total;
            document.getElementById('stat-published').textContent = data.stats.published;
            document.getElementById('stat-draft').textContent = data.stats.draft;
            document.getElementById('stat-featured').textContent = data.stats.featured;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function loadRecentProjects() {
    try {
        const response = await fetch(`${API_URL}/projects/admin/all`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('recent-projects-list');
            const recent = data.projects.slice(0, 5);

            if (recent.length === 0) {
                container.innerHTML = '<p style="color: var(--color-gray-dark); text-align: center; padding: 20px;">Nenhum projeto ainda</p>';
                return;
            }

            container.innerHTML = recent.map(project => `
                <div class="project-list-item">
                    <div class="project-list-thumb">
                        ${project.coverImage
                            ? `<img src="${getFileUrl(project, project.coverImage)}" alt="">`
                            : '<i class="fas fa-image"></i>'
                        }
                    </div>
                    <div class="project-list-info">
                        <h4>${project.title}</h4>
                        <span>${capitalizeFirst(project.category)} • ${capitalizeFirst(project.status)}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar projetos recentes:', error);
    }
}

// ========== PROJETOS ==========
async function loadProjects() {
    try {
        const status = document.getElementById('filter-status').value;
        const category = document.getElementById('filter-category').value;

        let url = `${API_URL}/projects/admin/all?`;
        if (status) url += `status=${status}&`;
        if (category) url += `category=${category}&`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            renderProjects(data.projects);
        }
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        showToast('Erro ao carregar projetos', 'error');
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-list');

    if (projects.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--color-gray-dark);">
                <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 16px;"></i>
                <p>Nenhum projeto encontrado</p>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card">
            <div class="project-cover">
                ${project.coverImage
                    ? `<img src="${getFileUrl(project, project.coverImage)}" alt="">`
                    : '<i class="fas fa-image"></i>'
                }
                <span class="project-status-badge status-${project.status}">${capitalizeFirst(project.status)}</span>
            </div>
            <div class="project-info">
                <h4 class="project-title">${project.title}</h4>
                <p class="project-category">${capitalizeFirst(project.category)}</p>
                <div class="project-meta">
                    ${project.location ? `<span><i class="fas fa-map-marker-alt"></i> ${project.location}</span>` : ''}
                    ${project.year ? `<span><i class="fas fa-calendar"></i> ${project.year}</span>` : ''}
                    <span><i class="fas fa-images"></i> ${project.files.length} arquivos</span>
                </div>
                <div class="project-actions">
                    <button class="btn btn-outline btn-sm" onclick="editProject('${project.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProject('${project.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/projects/categories`);
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('filter-category');
            const defaultOptions = '<option value="">Todas as Categorias</option>';

            const categoryOptions = data.categories.map(cat =>
                `<option value="${cat}">${capitalizeFirst(cat)}</option>`
            ).join('');

            select.innerHTML = defaultOptions + categoryOptions;
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// ========== MODAL DO PROJETO ==========
function openProjectModal(project = null) {
    currentProject = project;
    const modal = document.getElementById('project-modal');
    const title = document.getElementById('modal-title');
    const filesSection = document.getElementById('files-section');

    if (project) {
        title.textContent = 'Editar Projeto';
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-category').value = project.category;
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-full-description').value = project.fullDescription || '';
        document.getElementById('project-location').value = project.location || '';
        document.getElementById('project-area').value = project.area || '';
        document.getElementById('project-year').value = project.year || '';
        document.getElementById('project-client').value = project.client || '';
        document.getElementById('project-status').value = project.status;
        document.getElementById('project-featured').checked = project.featured;
        document.getElementById('project-tags').value = (project.tags || []).join(', ');

        filesSection.classList.remove('hidden');
        renderProjectFiles(project);
    } else {
        title.textContent = 'Novo Projeto';
        document.getElementById('project-form').reset();
        document.getElementById('project-id').value = '';
        document.getElementById('project-year').value = new Date().getFullYear();
        filesSection.classList.add('hidden');
        document.getElementById('files-list').innerHTML = '';
    }

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('project-modal').classList.add('hidden');
    currentProject = null;
}

async function editProject(projectId) {
    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            openProjectModal(data.project);
        }
    } catch (error) {
        showToast('Erro ao carregar projeto', 'error');
    }
}

async function saveProject() {
    const projectId = document.getElementById('project-id').value;
    const tagsInput = document.getElementById('project-tags').value;

    const projectData = {
        title: document.getElementById('project-title').value,
        category: document.getElementById('project-category').value,
        description: document.getElementById('project-description').value,
        fullDescription: document.getElementById('project-full-description').value,
        location: document.getElementById('project-location').value,
        area: document.getElementById('project-area').value,
        year: parseInt(document.getElementById('project-year').value) || null,
        client: document.getElementById('project-client').value,
        status: document.getElementById('project-status').value,
        featured: document.getElementById('project-featured').checked,
        tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : []
    };

    if (!projectData.title) {
        showToast('O título é obrigatório', 'error');
        return;
    }

    try {
        const url = projectId
            ? `${API_URL}/projects/${projectId}`
            : `${API_URL}/projects`;

        const method = projectId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(projectData)
        });

        const data = await response.json();

        if (data.success) {
            showToast(projectId ? 'Projeto atualizado!' : 'Projeto criado!', 'success');

            // Se é novo projeto, abre para upload de arquivos
            if (!projectId) {
                openProjectModal(data.project);
            } else {
                closeModal();
                loadProjects();
                loadStats();
                loadRecentProjects();
            }
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showToast(error.message || 'Erro ao salvar projeto', 'error');
    }
}

async function deleteProject(projectId) {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            showToast('Projeto excluído!', 'success');
            loadProjects();
            loadStats();
            loadRecentProjects();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showToast(error.message || 'Erro ao excluir projeto', 'error');
    }
}

// ========== UPLOAD DE ARQUIVOS ==========
function setupFileUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = '';
    });
}

async function handleFiles(files) {
    if (!currentProject) {
        showToast('Salve o projeto antes de adicionar arquivos', 'warning');
        return;
    }

    const formData = new FormData();
    for (const file of files) {
        formData.append('files', file);
    }

    try {
        showToast('Fazendo upload...', 'info');

        const response = await fetch(`${API_URL}/projects/${currentProject.id}/files`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showToast(`${data.files.length} arquivo(s) enviado(s)!`, 'success');

            // Recarregar projeto
            const projectResponse = await fetch(`${API_URL}/projects/${currentProject.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const projectData = await projectResponse.json();

            if (projectData.success) {
                currentProject = projectData.project;
                renderProjectFiles(currentProject);
            }
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showToast(error.message || 'Erro ao fazer upload', 'error');
    }
}

function renderProjectFiles(project) {
    const container = document.getElementById('files-list');

    if (!project.files || project.files.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = project.files.map(file => {
        const fileUrl = file.url || `/uploads/projects/${project.id}/${file.filename}`;
        return `
        <div class="file-item">
            <div class="file-preview">
                ${file.type === 'image'
                    ? `<img src="${fileUrl}" alt="">`
                    : `<a href="${fileUrl}" target="_blank"><i class="fas fa-file-pdf pdf-icon"></i></a>`
                }
            </div>
            <div class="file-info" title="${file.originalName}">
                ${file.originalName}
            </div>
            <div class="file-actions">
                ${file.type === 'image' ? `
                    <button class="set-cover ${project.coverImage === file.id ? 'active' : ''}"
                            onclick="setCoverImage('${file.id}')"
                            title="Definir como capa">
                        <i class="fas fa-star"></i>
                    </button>
                ` : ''}
                <button class="delete-file" onclick="deleteFile('${file.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `}).join('');
}

async function setCoverImage(fileId) {
    if (!currentProject) return;

    try {
        const response = await fetch(`${API_URL}/projects/${currentProject.id}/cover/${fileId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            currentProject = data.project;
            renderProjectFiles(currentProject);
            showToast('Capa definida!', 'success');
        }
    } catch (error) {
        showToast('Erro ao definir capa', 'error');
    }
}

async function deleteFile(fileId) {
    if (!currentProject) return;
    if (!confirm('Excluir este arquivo?')) return;

    try {
        const response = await fetch(`${API_URL}/projects/${currentProject.id}/files/${fileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.success) {
            currentProject.files = currentProject.files.filter(f => f.id !== fileId);
            if (currentProject.coverImage === fileId) {
                currentProject.coverImage = null;
            }
            renderProjectFiles(currentProject);
            showToast('Arquivo excluído!', 'success');
        }
    } catch (error) {
        showToast('Erro ao excluir arquivo', 'error');
    }
}

// ========== CONFIGURAÇÕES ==========
async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        showToast('As senhas não coincidem', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Senha alterada com sucesso!', 'success');
            document.getElementById('password-form').reset();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showToast(error.message || 'Erro ao alterar senha', 'error');
    }
}

// ========== UTILIDADES ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getFileById(project, fileId) {
    return project.files?.find(f => f.id === fileId);
}

function getFileUrl(project, fileId) {
    const file = getFileById(project, fileId);
    if (!file) return null;
    // Se tiver URL do R2, usar diretamente
    if (file.url) return file.url;
    // Fallback para caminho local (desenvolvimento)
    return `/uploads/projects/${project.id}/${file.filename}`;
}

// Expor funções globalmente para onclick
window.showSection = showSection;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.setCoverImage = setCoverImage;
window.deleteFile = deleteFile;
window.closeModal = closeModal;
