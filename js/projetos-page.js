/**
 * Isadora Carvalho Arquitetura
 * Projetos Page JavaScript
 */

// ===== Watermark URL Helper =====
const R2_PUBLIC_BASE = 'https://pub-c223da626df34d90984474e07d938a70.r2.dev';

function getWatermarkedUrl(originalUrl) {
    if (!originalUrl) return '';
    if (originalUrl.includes(R2_PUBLIC_BASE)) {
        const path = originalUrl.replace(R2_PUBLIC_BASE + '/', '');
        return `/api/image/${path}`;
    }
    return originalUrl;
}

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
    
    // ===== Helper Functions =====
    function getProjectImages(proj) {
        if (!proj.files || proj.files.length === 0) return [];
        
        const imageFiles = proj.files.filter(f => f.type === 'image');
        
        imageFiles.sort((a, b) => {
            if (a.id === proj.coverImage) return -1;
            if (b.id === proj.coverImage) return 1;
            return (a.order || 0) - (b.order || 0);
        });
        
        return imageFiles.map(f => f.url);
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
        
        fetch('/api/projects')
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
                    const category = proj.category || 'residencial';
                    const images = getProjectImages(proj);
                    const coverUrl = getWatermarkedUrl(images[0] || '');
                    const description = proj.description || generateDescription(proj.title, category);
                    
                    const item = document.createElement('article');
                    item.className = 'projeto-item';
                    item.setAttribute('data-animate', 'fadeUp');
                    item.setAttribute('data-category', category);
                    item.setAttribute('tabindex', '0');
                    item.setAttribute('role', 'button');
                    item.setAttribute('aria-label', `Ver projeto ${proj.title}`);
                    
                    item.innerHTML = `
                        <div class="projeto-image-wrapper ${!coverUrl ? 'no-image' : ''}">
                            ${coverUrl ? `<div class="projeto-image" style="background-image: url('${coverUrl}')" data-src="${coverUrl}"></div><div class="image-protection-layer"></div>` : ''}
                        </div>
                        <div class="projeto-info">
                            <span class="projeto-category">${getCategoryLabel(category)}</span>
                            <h2 class="projeto-title">${proj.title}</h2>
                            <p class="projeto-description">${description}</p>
                            <div class="projeto-meta">
                                <span class="projeto-meta-item">
                                    <i class="fas fa-images"></i>
                                    ${images.length} fotos
                                </span>
                            </div>
                            <span class="projeto-cta">
                                Ver projeto <i class="fas fa-arrow-right"></i>
                            </span>
                        </div>
                    `;
                    
                    // Passar o projeto com as imagens processadas
                    const projWithImages = { ...proj, images };
                    item.addEventListener('click', () => openProjetoModal(projWithImages, description));
                    item.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openProjetoModal(projWithImages, description);
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
            .catch((err) => {
                console.error('Erro ao carregar projetos:', err);
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
        return (name || '').replace(/_/g, ' ');
    }
    
    function getCategoryLabel(category) {
        const labels = {
            'residencial': 'Arquitetura Residencial',
            'interiores': 'Design de Interiores',
            'comercial': 'Comercial'
        };
        return labels[category] || 'Arquitetura';
    }
    
    function generateDescription(title, category) {
        const name = formatName(title).toLowerCase();
        const descriptions = {
            'residencial': `Projeto residencial ${name}, desenvolvido com foco na integração dos ambientes e aproveitamento da luz natural, criando espaços acolhedores e funcionais para o dia a dia.`,
            'interiores': `Design de interiores para ${name}, onde cada elemento foi cuidadosamente selecionado para criar uma atmosfera única e personalizada.`,
            'comercial': `Espaço comercial ${name}, projetado para otimizar o fluxo de trabalho e proporcionar uma experiência diferenciada aos visitantes.`
        };
        return descriptions[category] || `Projeto ${name}, desenvolvido com atenção aos detalhes e soluções personalizadas.`;
    }
    
    // ===== Modal Gallery =====
    let galeriaImgs = [];
    let galeriaIdx = 0;
    let galeriaDesc = '';
    
    function openProjetoModal(proj, description) {
        // proj.images já vem processado do renderProjetos
        galeriaImgs = proj.images || [];
        galeriaIdx = 0;
        galeriaDesc = description;
        
        const modal = document.getElementById('modal-projeto-bg');
        const title = document.getElementById('modal-projeto-title');
        const descEl = document.getElementById('modal-projeto-desc');
        
        title.textContent = proj.title || formatName(proj.name);
        if (descEl) descEl.textContent = description;
        
        renderModalImg();
        modal.classList.remove('hidden');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Aplica proteção de imagem após modal abrir
        setTimeout(() => {
            if (window.ImageProtection) {
                window.ImageProtection.protectAllImages();
            }
        }, 100);
    }
    
    function renderModalImg() {
        const galeria = document.getElementById('modal-projeto-galeria');
        galeria.innerHTML = '';
        
        if (galeriaImgs.length > 0) {
            // URL com watermark para exibição pública
            const imgUrl = getWatermarkedUrl(galeriaImgs[galeriaIdx]);
            
            // Spinner
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            spinner.style.margin = '100px auto';
            galeria.appendChild(spinner);
            
            // Preload image to check if it loads
            const preloadImg = new Image();
            preloadImg.onload = function() {
                spinner.remove();
                
                // Create protected image container
                const imgContainer = document.createElement('div');
                imgContainer.className = 'modal-image-protected';
                imgContainer.style.backgroundImage = `url('${imgUrl}')`;
                imgContainer.setAttribute('data-src', imgUrl);
                
                // Protection layer
                const protectionLayer = document.createElement('div');
                protectionLayer.className = 'image-protection-layer';
                imgContainer.appendChild(protectionLayer);
                
                // Watermark overlay (backup visual, a real já está na imagem)
                const watermark = document.createElement('div');
                watermark.className = 'watermark-overlay';
                watermark.innerHTML = '<img src="/assets/logo-completa.svg" alt="" class="watermark-logo" draggable="false">';
                imgContainer.appendChild(watermark);
                
                // Watermark pattern
                const pattern = document.createElement('div');
                pattern.className = 'watermark-pattern';
                imgContainer.appendChild(pattern);
                
                galeria.appendChild(imgContainer);
                
                // Counter
                const counter = document.createElement('div');
                counter.className = 'image-counter';
                counter.textContent = `${galeriaIdx + 1} / ${galeriaImgs.length}`;
                galeria.appendChild(counter);
                
                // Aplica proteção após carregar
                if (window.ImageProtection) {
                    window.ImageProtection.protectAllImages();
                }
            };
            
            preloadImg.onerror = function() {
                spinner.remove();
                galeria.innerHTML = '<p style="color: var(--color-gray-400);">Erro ao carregar imagem.</p>';
            };
            
            preloadImg.src = imgUrl;
        } else {
            galeria.innerHTML = '<p style="color: var(--color-gray-400);">Nenhuma imagem disponível.</p>';
        }
    }
    
    // Modal Navigation
    const prevBtn = document.getElementById('modal-prev-img');
    const nextBtn = document.getElementById('modal-next-img');
    const prevBtnMobile = document.getElementById('modal-prev-mobile');
    const nextBtnMobile = document.getElementById('modal-next-mobile');
    const closeModalBtn = document.getElementById('close-modal-projeto');
    const modalBg = document.getElementById('modal-projeto-bg');
    
    function goToPrevImage() {
        if (galeriaImgs.length > 0) {
            galeriaIdx = (galeriaIdx - 1 + galeriaImgs.length) % galeriaImgs.length;
            renderModalImg();
        }
    }
    
    function goToNextImage() {
        if (galeriaImgs.length > 0) {
            galeriaIdx = (galeriaIdx + 1) % galeriaImgs.length;
            renderModalImg();
        }
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevImage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextImage);
    }
    
    if (prevBtnMobile) {
        prevBtnMobile.addEventListener('click', goToPrevImage);
    }
    
    if (nextBtnMobile) {
        nextBtnMobile.addEventListener('click', goToNextImage);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalBg.classList.add('hidden');
            modalBg.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    if (modalBg) {
        modalBg.addEventListener('click', (e) => {
            if (e.target === modalBg) {
                modalBg.classList.add('hidden');
                modalBg.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modalBg && !modalBg.classList.contains('hidden')) {
            if (e.key === 'Escape') {
                modalBg.classList.add('hidden');
                modalBg.classList.remove('active');
                document.body.style.overflow = '';
            } else if (e.key === 'ArrowLeft') {
                goToPrevImage();
            } else if (e.key === 'ArrowRight') {
                goToNextImage();
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