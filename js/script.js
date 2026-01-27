/**
 * Isadora Carvalho Arquitetura
 * Main JavaScript - Enhanced Interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Header Scroll Effect =====
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    function handleHeaderScroll() {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }
    
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    
    // ===== Mobile Menu =====
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking a link
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuButton.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // ===== Smooth Scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Sempre limpar o hash da URL para manter limpo
                history.replaceState(null, null, window.location.pathname);
            }
        });
    });
    
    // ===== Active Navigation Link =====
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavLink, { passive: true });
    updateActiveNavLink();
    
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
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animateElements.forEach(el => animationObserver.observe(el));
    
    // ===== Logo Hover Effect =====
    const logoSvg = document.getElementById('logo-svg');
    const logoNome = document.getElementById('logo-nome');
    
    if (logoSvg && logoNome) {
        const addHover = () => {
            logoSvg.style.color = 'var(--color-primary)';
            logoNome.style.color = 'var(--color-primary)';
        };
        
        const removeHover = () => {
            logoSvg.style.color = '';
            logoNome.style.color = '';
        };
        
        logoSvg.addEventListener('mouseenter', addHover);
        logoSvg.addEventListener('mouseleave', removeHover);
        logoNome.addEventListener('mouseenter', addHover);
        logoNome.addEventListener('mouseleave', removeHover);
    }
    
    // ===== Popup Form =====
    const openFormBtn = document.getElementById('open-form-btn');
    const popupFormBg = document.getElementById('popup-form-bg');
    const closeFormBtn = document.getElementById('close-form-btn');
    const projetoForm = document.getElementById('projeto-form');
    const formSuccess = document.getElementById('form-success');
    const formError = document.getElementById('form-error');
    
    if (openFormBtn && popupFormBg && closeFormBtn) {
        openFormBtn.addEventListener('click', () => {
            popupFormBg.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            if (formSuccess) formSuccess.classList.add('hidden');
            if (formError) formError.classList.add('hidden');
            if (projetoForm) {
                projetoForm.style.display = 'block';
                projetoForm.reset();
            }
        });
        
        closeFormBtn.addEventListener('click', () => {
            popupFormBg.classList.add('hidden');
            document.body.style.overflow = '';
        });
        
        popupFormBg.addEventListener('click', (e) => {
            if (e.target === popupFormBg) {
                popupFormBg.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Submit do formulário agora é tratado por js/web3forms.js
    
    // ===== Depoimentos Slider =====
    const depoimentoCards = document.querySelectorAll('.depoimento-card');
    const depNavBtns = document.querySelectorAll('.dep-nav-btn');
    let currentDepoimento = 0;
    let depoimentoInterval;
    
    function showDepoimento(index) {
        depoimentoCards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        depNavBtns.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        currentDepoimento = index;
    }
    
    function nextDepoimento() {
        const next = (currentDepoimento + 1) % depoimentoCards.length;
        showDepoimento(next);
    }
    
    if (depoimentoCards.length > 0) {
        depNavBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                showDepoimento(index);
                resetDepoimentoInterval();
            });
        });
        
        // Initial state
        showDepoimento(0);
        
        // Auto-advance
        function startDepoimentoInterval() {
            depoimentoInterval = setInterval(nextDepoimento, 5000);
        }
        
        function resetDepoimentoInterval() {
            clearInterval(depoimentoInterval);
            startDepoimentoInterval();
        }
        
        startDepoimentoInterval();
    }
    
    // ===== Portfolio Projects (Carousel) =====
    function renderProjetos() {
        const container = document.getElementById('projetos-container');
        if (!container) return;

        // Buscar projetos em destaque (featured=true) ou todos se não houver destaques
        fetch('/api/projects?featured=true')
            .then(res => res.json())
            .then(data => {
                let projetos = data.projects || [];
                
                // Se não houver projetos em destaque, buscar todos
                if (projetos.length === 0) {
                    return fetch('/api/projects').then(res => res.json());
                }
                return { projects: projetos };
            })
            .then(data => {
                const projetos = data.projects || [];
                container.innerHTML = '';
                
                if (projetos.length === 0) {
                    container.innerHTML = '<p style="text-align:center;color:var(--color-gray-400);width:100%;">Em breve novos projetos.</p>';
                    return;
                }
                
                // Limitar a 8 projetos no carrossel
                projetos.slice(0, 8).forEach((proj, idx) => {
                    // Pegar imagem de capa ou primeira imagem
                    const images = getProjectImages(proj);
                    const coverUrl = images[0] || '';
                    const categoryLabel = getCategoryLabel(proj.category);
                    
                    const card = document.createElement('div');
                    card.className = 'portfolio-card';
                    card.setAttribute('data-animate', 'fadeUp');
                    card.setAttribute('data-delay', (idx * 50).toString());
                    card.setAttribute('tabindex', '0');
                    card.setAttribute('role', 'button');
                    card.setAttribute('aria-label', `Ver projeto ${proj.title}`);
                    
                    card.innerHTML = `
                        ${coverUrl ? `<img src="${coverUrl}" alt="${proj.title}" onerror="this.style.display='none'">` : ''}
                        <div class="portfolio-card-overlay"${!coverUrl ? ' style="opacity:1;"' : ''}>
                            <h3 class="portfolio-card-title">${proj.title}</h3>
                            <span class="portfolio-card-category">${categoryLabel}</span>
                        </div>
                    `;
                    
                    card.addEventListener('click', () => openProjetoModal(proj));
                    card.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openProjetoModal(proj);
                        }
                    });
                    
                    container.appendChild(card);
                });
                
                // Re-observe new elements
                container.querySelectorAll('[data-animate]').forEach(el => {
                    animationObserver.observe(el);
                });
                
                // Inicializar navegação do carrossel
                initCarouselNav();
            })
            .catch(() => {
                // Fallback: show placeholder cards
                container.innerHTML = `
                    <div class="portfolio-card" data-animate="fadeUp">
                        <div class="portfolio-card-overlay" style="opacity:1;">
                            <h3 class="portfolio-card-title">Residência Boa Viagem</h3>
                            <span class="portfolio-card-category">Arquitetura Residencial</span>
                        </div>
                    </div>
                    <div class="portfolio-card" data-animate="fadeUp" data-delay="100">
                        <div class="portfolio-card-overlay" style="opacity:1;">
                            <h3 class="portfolio-card-title">Apartamento Graças</h3>
                            <span class="portfolio-card-category">Design de Interiores</span>
                        </div>
                    </div>
                    <div class="portfolio-card" data-animate="fadeUp" data-delay="200">
                        <div class="portfolio-card-overlay" style="opacity:1;">
                            <h3 class="portfolio-card-title">Studio Criativo</h3>
                            <span class="portfolio-card-category">Comercial</span>
                        </div>
                    </div>
                `;
            });
    }
    
    // ===== Carousel Navigation =====
    function initCarouselNav() {
        const carousel = document.getElementById('projetos-container');
        const prevBtn = document.getElementById('portfolio-prev');
        const nextBtn = document.getElementById('portfolio-next');
        
        if (!carousel || !prevBtn || !nextBtn) return;
        
        const scrollAmount = 300; // pixels to scroll
        
        // Check if carousel needs navigation (content overflows)
        function checkOverflow() {
            const hasOverflow = carousel.scrollWidth > carousel.clientWidth;
            
            if (hasOverflow) {
                prevBtn.classList.add('visible');
                nextBtn.classList.add('visible');
                carousel.classList.add('has-overflow');
            } else {
                prevBtn.classList.remove('visible');
                nextBtn.classList.remove('visible');
                carousel.classList.remove('has-overflow');
            }
        }
        
        // Initial check
        checkOverflow();
        
        // Re-check on window resize
        window.addEventListener('resize', checkOverflow);
        
        // Navigation clicks
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        
        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else if (e.key === 'ArrowRight') {
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });
    }
    
    // ===== Helper Functions =====
    function getProjectImages(proj) {
        // Retorna array de URLs de imagens do projeto
        if (!proj.files || proj.files.length === 0) return [];
        
        // Filtrar apenas imagens (não PDFs)
        const imageFiles = proj.files.filter(f => f.type === 'image');
        
        // Ordenar: capa primeiro, depois por ordem
        imageFiles.sort((a, b) => {
            if (a.id === proj.coverImage) return -1;
            if (b.id === proj.coverImage) return 1;
            return (a.order || 0) - (b.order || 0);
        });
        
        return imageFiles.map(f => f.url);
    }
    
    function getCategoryLabel(category) {
        const labels = {
            'residencial': 'Arquitetura Residencial',
            'interiores': 'Design de Interiores',
            'comercial': 'Comercial'
        };
        return labels[category] || 'Arquitetura';
    }
    
    // ===== Modal Gallery =====
    let galeriaImgs = [];
    let galeriaIdx = 0;
    let currentProj = null;
    
    function openProjetoModal(proj) {
        currentProj = proj;
        galeriaImgs = getProjectImages(proj);
        galeriaIdx = 0;
        
        const modal = document.getElementById('modal-projeto-bg');
        const title = document.getElementById('modal-projeto-title');
        const descEl = document.getElementById('modal-projeto-desc');
        
        title.textContent = proj.title;
        if (descEl) descEl.textContent = proj.description || '';
        
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
            img.draggable = false;
            
            img.onload = function() {
                spinner.remove();
                img.style.display = 'block';
                
                // Aplica proteção após carregar
                if (window.ImageProtection) {
                    window.ImageProtection.protectAllImages();
                }
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
    
    // Keyboard navigation for modal
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
    
    // Touch/Swipe support for modal
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
                if (Math.abs(diff) > 50) {
                    if (diff < 0 && galeriaImgs.length > 0) {
                        galeriaIdx = (galeriaIdx + 1) % galeriaImgs.length;
                        renderModalImg();
                    } else if (diff > 0 && galeriaImgs.length > 0) {
                        galeriaIdx = (galeriaIdx - 1 + galeriaImgs.length) % galeriaImgs.length;
                        renderModalImg();
                    }
                }
            }
            touchStartX = null;
            touchEndX = null;
        });
    }
    
    // ===== Background Parallax =====
    const archBgs = document.querySelectorAll('.arch-bg');
    
    function handleParallax() {
        const scrollY = window.scrollY;
        archBgs.forEach((arch, index) => {
            const speed = 0.03 * (index + 1);
            arch.style.transform = `translateY(${scrollY * speed}px) rotate(${index % 2 === 0 ? 15 : -10}deg)`;
        });
    }
    
    if (archBgs.length > 0) {
        window.addEventListener('scroll', handleParallax, { passive: true });
    }
    
    // ===== Initialize =====
    renderProjetos();
    
});