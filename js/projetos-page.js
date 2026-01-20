/**
 * Isadora Carvalho Arquitetura
 * Projetos Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Header Scroll Effect =====
    const header = document.getElementById('header');
    
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
    
    // ===== Mobile Menu =====
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuButton.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // ===== Scroll Animations =====
    const animateElements = document.querySelectorAll('[data-animate]');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animateElements.forEach(el => animationObserver.observe(el));
    
    // ===== Filter Buttons =====
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterProjects();
        });
    });
    
    function filterProjects() {
        const items = document.querySelectorAll('.projeto-item');
        items.forEach(item => {
            const category = item.dataset.category || 'all';
            if (currentFilter === 'all' || category === currentFilter) {
                item.style.display = '';
                setTimeout(() => item.classList.add('animated'), 50);
            } else {
                item.style.display = 'none';
                item.classList.remove('animated');
            }
        });
    }
    
    // ===== Load Projects =====
    function renderProjetos() {
        const container = document.getElementById('projetos-lista');
        if (!container) return;
        
        // Loading state
        container.innerHTML = `
            <div class="projetos-loading">
                <div class="spinner"></div>
            </div>
        `;
        
        fetch('/api/list_projects')
            .then(res => res.json())
            .then(data => {
                const projetos = data.projects || [];
                container.innerHTML = '';
                
                if (projetos.length === 0) {
                    container.innerHTML = `
                        <div class="projetos-empty">
                            <i class="fas fa-folder-open"></i>
                            <h3>Nenhum projeto encontrado</h3>
                            <p>Em breve novos projetos serão adicionados.</p>
                        </div>
                    `;
                    return;
                }
                
                projetos.forEach((proj, idx) => {
                    const categories = ['residencial', 'interiores', 'comercial'];
                    const category = categories[idx % categories.length];
                    
                    const description = generateDescription(proj.name, category);
                    
                    const item = document.createElement('article');
                    item.className = 'projeto-item';
                    item.setAttribute('data-animate', 'fadeUp');
                    item.setAttribute('data-category', category);
                    item.setAttribute('tabindex', '0');
                    item.setAttribute('role', 'button');
                    item.setAttribute('aria-label', `Ver projeto ${proj.name}`);
                    
                    item.innerHTML = `
                        <div class="projeto-image-wrapper ${!proj.images[0] ? 'no-image' : ''}">
                            ${proj.images[0] ? `<img src="${proj.images[0]}" alt="${proj.name}" class="projeto-image" onerror="this.parentElement.classList.add('no-image');this.remove();">` : ''}
                        </div>
                        <div class="projeto-info">
                            <span class="projeto-category">${getCategoryLabel(category)}</span>
                            <h2 class="projeto-title">${formatName(proj.name)}</h2>
                            <p class="projeto-description">${description}</p>
                            <div class="projeto-meta">
                                <span class="projeto-meta-item">
                                    <i class="fas fa-images"></i>
                                    ${proj.images.length} fotos
                                </span>
                            </div>
                            <span class="projeto-cta">
                                Ver projeto <i class="fas fa-arrow-right"></i>
                            </span>
                        </div>
                    `;
                    
                    item.addEventListener('click', () => openProjetoModal(proj, description));
                    item.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openProjetoModal(proj, description);
                        }
                    });
                    
                    container.appendChild(item);
                });
                
                // Animate items
                setTimeout(() => {
                    container.querySelectorAll('[data-animate]').forEach(el => {
                        animationObserver.observe(el);
                    });
                }, 100);
            })
            .catch(() => {
                // Fallback with example projects
                container.innerHTML = '';
                const exampleProjects = [
                    { name: 'Residência Boa Viagem', category: 'residencial' },
                    { name: 'Apartamento Graças', category: 'interiores' },
                    { name: 'Studio Criativo', category: 'comercial' },
                    { name: 'Casa de Praia', category: 'residencial' },
                    { name: 'Loft Moderno', category: 'interiores' }
                ];
                
                exampleProjects.forEach((proj, idx) => {
                    const description = generateDescription(proj.name, proj.category);
                    
                    const item = document.createElement('article');
                    item.className = 'projeto-item';
                    item.setAttribute('data-animate', 'fadeUp');
                    item.setAttribute('data-category', proj.category);
                    
                    item.innerHTML = `
                        <div class="projeto-image-wrapper no-image"></div>
                        <div class="projeto-info">
                            <span class="projeto-category">${getCategoryLabel(proj.category)}</span>
                            <h2 class="projeto-title">${proj.name}</h2>
                            <p class="projeto-description">${description}</p>
                            <span class="projeto-cta">
                                Ver projeto <i class="fas fa-arrow-right"></i>
                            </span>
                        </div>
                    `;
                    
                    container.appendChild(item);
                });
                
                setTimeout(() => {
                    container.querySelectorAll('[data-animate]').forEach(el => {
                        el.classList.add('animated');
                    });
                }, 100);
            });
    }
    
    function formatName(name) {
        return name.replace(/_/g, ' ');
    }
    
    function getCategoryLabel(category) {
        const labels = {
            'residencial': 'Arquitetura Residencial',
            'interiores': 'Design de Interiores',
            'comercial': 'Comercial'
        };
        return labels[category] || 'Arquitetura';
    }
    
    function generateDescription(name, category) {
        const descriptions = {
            'residencial': `Projeto residencial ${formatName(name).toLowerCase()}, desenvolvido com foco na integração dos ambientes e aproveitamento da luz natural, criando espaços acolhedores e funcionais para o dia a dia.`,
            'interiores': `Design de interiores para ${formatName(name).toLowerCase()}, onde cada elemento foi cuidadosamente selecionado para criar uma atmosfera única e personalizada.`,
            'comercial': `Espaço comercial ${formatName(name).toLowerCase()}, projetado para otimizar o fluxo de trabalho e proporcionar uma experiência diferenciada aos visitantes.`
        };
        return descriptions[category] || `Projeto ${formatName(name).toLowerCase()}, desenvolvido com atenção aos detalhes e soluções personalizadas.`;
    }
    
    // ===== Modal Gallery =====
    let galeriaImgs = [];
    let galeriaIdx = 0;
    let galeriaDesc = '';
    
    function openProjetoModal(proj, description) {
        galeriaImgs = proj.images || [];
        galeriaIdx = 0;
        galeriaDesc = description;
        
        const modal = document.getElementById('modal-projeto-bg');
        const title = document.getElementById('modal-projeto-title');
        const descEl = document.getElementById('modal-projeto-desc');
        
        title.textContent = formatName(proj.name);
        if (descEl) descEl.textContent = description;
        
        renderModalImg();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    function renderModalImg() {
        const galeria = document.getElementById('modal-projeto-galeria');
        galeria.innerHTML = '';
        
        if (galeriaImgs.length > 0) {
            // Spinner
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            spinner.style.margin = '100px auto';
            galeria.appendChild(spinner);
            
            // Image
            const img = document.createElement('img');
            img.src = galeriaImgs[galeriaIdx];
            img.alt = '';
            img.style.display = 'none';
            
            img.onload = function() {
                spinner.remove();
                img.style.display = 'block';
            };
            
            img.onerror = function() {
                spinner.remove();
                galeria.innerHTML = '<p style="color: var(--color-gray-400);">Erro ao carregar imagem.</p>';
            };
            
            galeria.appendChild(img);
            
            // Counter
            const counter = document.createElement('div');
            counter.className = 'image-counter';
            counter.textContent = `${galeriaIdx + 1} / ${galeriaImgs.length}`;
            galeria.appendChild(counter);
        } else {
            galeria.innerHTML = '<p style="color: var(--color-gray-400);">Nenhuma imagem disponível.</p>';
        }
    }
    
    // Modal Navigation
    const prevBtn = document.getElementById('modal-prev-img');
    const nextBtn = document.getElementById('modal-next-img');
    const closeModalBtn = document.getElementById('close-modal-projeto');
    const modalBg = document.getElementById('modal-projeto-bg');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (galeriaImgs.length > 0) {
                galeriaIdx = (galeriaIdx - 1 + galeriaImgs.length) % galeriaImgs.length;
                renderModalImg();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (galeriaImgs.length > 0) {
                galeriaIdx = (galeriaIdx + 1) % galeriaImgs.length;
                renderModalImg();
            }
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalBg.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }
    
    if (modalBg) {
        modalBg.addEventListener('click', (e) => {
            if (e.target === modalBg) {
                modalBg.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modalBg && !modalBg.classList.contains('hidden')) {
            if (e.key === 'Escape') {
                modalBg.classList.add('hidden');
                document.body.style.overflow = '';
            } else if (e.key === 'ArrowLeft' && galeriaImgs.length > 0) {
                galeriaIdx = (galeriaIdx - 1 + galeriaImgs.length) % galeriaImgs.length;
                renderModalImg();
            } else if (e.key === 'ArrowRight' && galeriaImgs.length > 0) {
                galeriaIdx = (galeriaIdx + 1) % galeriaImgs.length;
                renderModalImg();
            }
        }
    });
    
    // Touch/Swipe support
    let touchStartX = null;
    let touchEndX = null;
    const modalGaleria = document.getElementById('modal-projeto-galeria');
    
    if (modalGaleria) {
        modalGaleria.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: true });
        
        modalGaleria.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                touchEndX = e.touches[0].clientX;
            }
        }, { passive: true });
        
        modalGaleria.addEventListener('touchend', () => {
            if (touchStartX !== null && touchEndX !== null) {
                const diff = touchEndX - touchStartX;
                if (Math.abs(diff) > 50 && galeriaImgs.length > 0) {
                    if (diff < 0) {
                        galeriaIdx = (galeriaIdx + 1) % galeriaImgs.length;
                    } else {
                        galeriaIdx = (galeriaIdx - 1 + galeriaImgs.length) % galeriaImgs.length;
                    }
                    renderModalImg();
                }
            }
            touchStartX = null;
            touchEndX = null;
        });
    }
    
    // ===== Initialize =====
    renderProjetos();
    
});