/**
 * Isadora Carvalho Arquitetura
 * Loading System - Dynamic page loading handler
 */

(function() {
    const LOADER_SEEN_KEY = 'isadoraSite_loaderSeen_v1';
    const hasSeenLoader = (() => {
        try {
            return sessionStorage.getItem(LOADER_SEEN_KEY) === '1';
        } catch {
            return false;
        }
    })();

    if (hasSeenLoader) {
        // Loader only on first visit per tab/session.
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hide');
            overlay.remove();
        }
        return;
    }

    const loadingStartTime = Date.now();
    const minimumLoadingTime = 2500; // 2.5 seconds minimum
    let pageLoaded = false;
    let fontsLoaded = false;
    
    function checkIfCanHideLoader() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - loadingStartTime;
        
        // Only hide if: page loaded, fonts loaded, AND minimum time passed
        if (pageLoaded && fontsLoaded && elapsedTime >= minimumLoadingTime) {
            hideLoader();
        }
    }
    
    function hideLoader() {
        const svg = document.querySelector('.loading-svg');
        const overlay = document.getElementById('loading-overlay');
        
        if (svg) {
            svg.classList.add('final-color');
        }
        
        // Wait a moment to show final colors
        setTimeout(() => {
            if (overlay) {
                overlay.classList.add('hide');
                
                // Remove from DOM after animation
                setTimeout(() => {
                    try {
                        sessionStorage.setItem(LOADER_SEEN_KEY, '1');
                    } catch {
                        // ignore
                    }
                    overlay.remove();
                }, 800);
            }
        }, 600);
    }
    
    function markPageLoaded() {
        pageLoaded = true;
        checkIfCanHideLoader();
    }
    
    function markFontsLoaded() {
        fontsLoaded = true;
        checkIfCanHideLoader();
    }
    
    // Font loading detection
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(markFontsLoaded);
    } else {
        // Fallback for browsers without Font Loading API
        fontsLoaded = true;
    }
    
    // Page load detection
    if (document.readyState === 'complete') {
        markPageLoaded();
    } else {
        window.addEventListener('load', markPageLoaded);
    }
    
    // Safety timeout (max 6 seconds)
    setTimeout(() => {
        pageLoaded = true;
        fontsLoaded = true;
        hideLoader();
    }, 6000);
    
})();