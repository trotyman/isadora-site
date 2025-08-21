// script.js extraído do index.html
document.addEventListener('DOMContentLoaded', function () {
    // Menu mobile
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Popup Formulário ---
    const openFormBtn = document.getElementById('open-form-btn');
    const popupFormBg = document.getElementById('popup-form-bg');
    const closeFormBtn = document.getElementById('close-form-btn');
    const projetoForm = document.getElementById('projeto-form');
    const formSuccess = document.getElementById('form-success');

    if (openFormBtn && popupFormBg && closeFormBtn) {
        openFormBtn.addEventListener('click', () => {
            popupFormBg.classList.remove('hidden');
            formSuccess && formSuccess.classList.add('hidden');
            projetoForm && projetoForm.reset();
        });
        closeFormBtn.addEventListener('click', () => {
            popupFormBg.classList.add('hidden');
        });
        popupFormBg.addEventListener('click', (e) => {
            if (e.target === popupFormBg) {
                popupFormBg.classList.add('hidden');
            }
        });
    }

    if (projetoForm) {
        projetoForm.addEventListener('submit', function(e) {
            // O Formsubmit abre em nova aba, então só fechamos o popup
            setTimeout(() => {
                popupFormBg.classList.add('hidden');
            }, 500);
        });
    }

    // Suavizar scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                // Fechar menu mobile se estiver aberto
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Destacar link ativo no menu (apenas na página inicial)
    const navLinks = document.querySelectorAll('.nav-link');
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        window.addEventListener('scroll', () => {
            let fromTop = window.scrollY + 100;
            let found = false;
            navLinks.forEach(link => {
                const section = document.querySelector(link.getAttribute('href'));
                if (
                    section &&
                    section.offsetTop <= fromTop &&
                    section.offsetTop + section.offsetHeight > fromTop
                ) {
                    link.classList.add('text-primary', 'font-medium');
                    link.classList.remove('hover:text-primary');
                    found = true;
                } else {
                    link.classList.remove('text-primary', 'font-medium');
                    link.classList.add('hover:text-primary');
                }
            });
            // Se chegou ao final da página, destaca o link Contato
            const footer = document.getElementById('contato');
            const buffer = 40; // margem para garantir que o rodapé está visível
            if (!found && footer) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < window.innerHeight - buffer) {
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === '#contato') {
                            link.classList.add('text-primary', 'font-medium');
                            link.classList.remove('hover:text-primary');
                        }
                    });
                }
            }
        });
    }

    // ANIMAÇÕES - Observador de elementos na tela
    const animateOnScroll = () => {
        document.querySelectorAll('[data-animate]').forEach(el => {
            const rect = el.getBoundingClientRect();
            // Mudança aqui: de 0.85 para 0.99
            const isVisible = (rect.top <= window.innerHeight * 0.99);
            if (isVisible) {
                el.classList.add('animated');
            }
        });
    };
    // Ativa na carga e no scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // Aleatorizar direções das animações
    document.querySelectorAll('[data-animate]').forEach(el => {
        const animations = ['fadeIn', 'fadeInLeft', 'fadeInRight', 'fadeInDown', 'fadeInUp', 'zoomIn', 'rotateIn'];
        const randomAnim = animations[Math.floor(Math.random() * animations.length)];
        el.setAttribute('data-animate', randomAnim);
    });

    // --- Projetos dinâmicos ---
    function renderProjetos() {
        fetch('/api/list_projects')
            .then(res => res.json())
            .then(data => {
                const projetos = data.projects || [];
                const container = document.getElementById('projetos-container');
                if (!container) return;
                container.innerHTML = '';
                projetos.forEach((proj, idx) => {
                    const card = document.createElement('div');
                    card.className = 'group relative overflow-hidden hover-3d cursor-pointer';
                    card.setAttribute('data-animate', 'fadeIn');
                    card.setAttribute('tabindex', '0');
                    card.setAttribute('role', 'button');
                    card.setAttribute('aria-label', proj.name);
                    card.innerHTML = `
                        <div class="h-80 overflow-hidden flex items-center justify-center bg-white">
                            <img src="${proj.images[0] || ''}" alt="${proj.name}" class="w-full h-full object-cover group-hover:scale-105 transition-slow" onerror="this.style.display='none'">
                        </div>
                        <div class="absolute inset-0 bg-primary bg-opacity-0 group-hover:bg-opacity-20 transition-slow flex items-center justify-center">
                            <h3 class="text-white opacity-0 group-hover:opacity-100 text-xl font-display transition-slow">${proj.name.replace(/_/g, ' ')}</h3>
                        </div>
                    `;
                    card.addEventListener('click', () => openProjetoModal(proj));
                    container.appendChild(card);
                });
            });
    }

    // Modal galeria
    let galeriaImgs = [];
    let galeriaIdx = 0;
    function openProjetoModal(proj) {
        galeriaImgs = proj.images;
        galeriaIdx = 0;
        document.getElementById('modal-projeto-title').textContent = proj.name.replace(/_/g, ' ');
        renderModalImg();
        document.getElementById('modal-projeto-bg').classList.remove('hidden');
    }
    function renderModalImg() {
        const galeria = document.getElementById('modal-projeto-galeria');
        galeria.innerHTML = '';
        if (galeriaImgs.length > 0) {
            // Spinner de loading
            const spinner = document.createElement('div');
            spinner.className = 'flex items-center justify-center w-full h-[60vh]';
            spinner.innerHTML = `<span class="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>`;
            galeria.appendChild(spinner);

            const img = document.createElement('img');
            img.src = galeriaImgs[galeriaIdx];
            img.alt = '';
            img.className = 'max-h-[60vh] w-auto rounded shadow hidden';
            img.onload = function() {
                spinner.remove();
                img.classList.remove('hidden');
            };
            img.onerror = function() {
                spinner.remove();
                galeria.textContent = 'Erro ao carregar imagem.';
            };
            galeria.appendChild(img);

            const count = document.createElement('div');
            count.className = 'text-dark text-sm mt-2';
            count.textContent = `Imagem ${galeriaIdx+1} de ${galeriaImgs.length}`;
            galeria.appendChild(count);
        } else {
            galeria.textContent = 'Nenhuma imagem disponível.';
        }
    }
    document.getElementById('modal-prev-img').addEventListener('click', function() {
        if (galeriaImgs.length > 0) {
            galeriaIdx = (galeriaIdx - 1 + galeriaImgs.length) % galeriaImgs.length;
            renderModalImg();
        }
    });
    document.getElementById('modal-next-img').addEventListener('click', function() {
        if (galeriaImgs.length > 0) {
            galeriaIdx = (galeriaIdx + 1) % galeriaImgs.length;
            renderModalImg();
        }
    });
    document.getElementById('close-modal-projeto').addEventListener('click', function() {
        document.getElementById('modal-projeto-bg').classList.add('hidden');
    });
    document.getElementById('modal-projeto-bg').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });

    // Inicializar projetos ao carregar
    renderProjetos();
});
