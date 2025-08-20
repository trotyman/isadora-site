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

    // Destacar link ativo no menu
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let fromTop = window.scrollY + 100;
        navLinks.forEach(link => {
            const section = document.querySelector(link.getAttribute('href'));
            if (
                section &&
                section.offsetTop <= fromTop &&
                section.offsetTop + section.offsetHeight > fromTop
            ) {
                link.classList.add('text-primary', 'font-medium');
                link.classList.remove('hover:text-primary');
            } else {
                link.classList.remove('text-primary', 'font-medium');
                link.classList.add('hover:text-primary');
            }
        });
    });

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
});
