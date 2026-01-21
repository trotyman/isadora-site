/**
 * Image Protection & Watermark System
 * Protege imagens contra download e prints indevidos
 */

(function() {
    'use strict';

    const WATERMARK_LOGO = '/assets/logo-completa.svg';
    const WATERMARK_PATTERN = '/assets/logo-simbolo.svg';

    /**
     * Adiciona marca d'água a um container de imagem
     */
    function addWatermark(container) {
        // Evita duplicação
        if (container.querySelector('.watermark-overlay')) return;

        // Watermark central com logo completa
        const watermarkOverlay = document.createElement('div');
        watermarkOverlay.className = 'watermark-overlay';
        
        const logoImg = document.createElement('img');
        logoImg.src = WATERMARK_LOGO;
        logoImg.alt = '';
        logoImg.className = 'watermark-logo';
        logoImg.draggable = false;
        
        watermarkOverlay.appendChild(logoImg);

        // Padrão de marca d'água com logo símbolo
        const patternOverlay = document.createElement('div');
        patternOverlay.className = 'watermark-pattern';

        // Camada de proteção invisível
        const protectionLayer = document.createElement('div');
        protectionLayer.className = 'image-protection-layer';

        // Adiciona todos os overlays
        container.appendChild(patternOverlay);
        container.appendChild(watermarkOverlay);
        container.appendChild(protectionLayer);
    }

    /**
     * Protege uma imagem específica
     */
    function protectImage(img) {
        // Desabilita arrastar
        img.draggable = false;
        img.setAttribute('draggable', 'false');
        
        // Evento de drag
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });

        // Evento de context menu na imagem
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }

    /**
     * Protege todos os containers de imagem na página
     */
    function protectAllImages() {
        // Seleciona containers de imagem que precisam de proteção
        const protectedContainers = document.querySelectorAll(
            '.portfolio-card, .projeto-image-wrapper, .modal-gallery, .protected-image-container'
        );

        protectedContainers.forEach(container => {
            // Adiciona classe de container protegido
            container.classList.add('protected-image-container');
            
            // Encontra e protege a imagem
            const img = container.querySelector('img');
            if (img) {
                protectImage(img);
            }

            // Adiciona marca d'água (apenas para containers maiores)
            if (container.classList.contains('modal-gallery') || 
                container.classList.contains('projeto-image-wrapper') ||
                container.classList.contains('portfolio-card')) {
                addWatermark(container);
            }
        });
    }

    /**
     * Desabilita clique-direito em toda a página de projetos
     */
    function disableContextMenuOnImages() {
        document.addEventListener('contextmenu', function(e) {
            // Verifica se o clique foi em uma imagem ou container protegido
            if (e.target.tagName === 'IMG' || 
                e.target.closest('.protected-image-container') ||
                e.target.closest('.portfolio-card') ||
                e.target.closest('.projeto-image-wrapper') ||
                e.target.closest('.modal-gallery')) {
                e.preventDefault();
                return false;
            }
        });
    }

    /**
     * Desabilita teclas de print/screenshot
     */
    function disablePrintShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Desabilita PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                
                // Mostra aviso temporário
                showProtectionWarning();
                return false;
            }

            // Desabilita Ctrl+P (Print)
            if (e.ctrlKey && e.key === 'p') {
                // Permite impressão normal da página, mas mostra aviso
                // se estiver visualizando uma imagem em modal
                const modal = document.querySelector('.project-modal.active');
                if (modal) {
                    e.preventDefault();
                    showProtectionWarning();
                    return false;
                }
            }

            // Desabilita Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                // Não bloqueia devtools, apenas para não parecer muito agressivo
            }
        });
    }

    /**
     * Mostra aviso de proteção
     */
    function showProtectionWarning() {
        // Verifica se já existe um aviso
        let warning = document.querySelector('.protection-warning');
        
        if (!warning) {
            warning = document.createElement('div');
            warning.className = 'protection-warning';
            warning.innerHTML = `
                <div class="protection-warning-content">
                    <i class="fas fa-shield-alt"></i>
                    <p>Conteúdo protegido por direitos autorais</p>
                </div>
            `;
            warning.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(74, 72, 61, 0.95);
                color: white;
                padding: 20px 40px;
                border-radius: 8px;
                z-index: 10000;
                text-align: center;
                animation: fadeInOut 2s ease forwards;
            `;
            
            // Adiciona CSS para animação se ainda não existir
            if (!document.querySelector('#protection-warning-styles')) {
                const style = document.createElement('style');
                style.id = 'protection-warning-styles';
                style.textContent = `
                    @keyframes fadeInOut {
                        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                        15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    }
                    .protection-warning-content {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .protection-warning-content i {
                        font-size: 1.5rem;
                        color: #cc8a7a;
                    }
                    .protection-warning-content p {
                        margin: 0;
                        font-size: 0.95rem;
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(warning);
            
            // Remove após animação
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.parentNode.removeChild(warning);
                }
            }, 2000);
        }
    }

    /**
     * Observa mudanças no DOM para proteger novas imagens
     */
    function observeDOMChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    // Pequeno delay para garantir que elementos foram renderizados
                    setTimeout(protectAllImages, 100);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Inicializa proteção
     */
    function init() {
        // Aguarda DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                protectAllImages();
                disableContextMenuOnImages();
                disablePrintShortcuts();
                observeDOMChanges();
            });
        } else {
            protectAllImages();
            disableContextMenuOnImages();
            disablePrintShortcuts();
            observeDOMChanges();
        }
    }

    // Inicializa
    init();

    // Expõe funções para uso externo (ex: quando modal abre)
    window.ImageProtection = {
        protectAllImages: protectAllImages,
        addWatermark: addWatermark,
        protectImage: protectImage
    };

})();
