/**
 * Web3Forms Integration
 * Função para envio de formulários via Web3Forms API
 * Site: Isadora Carvalho - Arquitetura & Interiores
 *
 * Documentação: https://web3forms.com/docs
 * 
 * NOTA: A access_key é segura para uso no frontend porque:
 * - Só pode enviar emails para o endereço configurado no painel Web3Forms
 * - Tem rate limiting built-in
 * - É o método recomendado pela própria Web3Forms
 */

(function() {
    'use strict';

    // Access key do Web3Forms (seguro para frontend - só envia para emails configurados)
    const WEB3FORMS_ACCESS_KEY = '7c304038-b18e-4824-be86-5458e04934e6';
    const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('projeto-form');

        if (form) {
            initializeForm(form);
        }
    });

    // =====================================================
    // FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DO FORMULÁRIO
    // =====================================================
    function initializeForm(form) {
        // Remove o action original (FormSubmit) se existir
        form.removeAttribute('action');
        form.removeAttribute('target');

        // Remove campos hidden do FormSubmit
        const formsubmitFields = form.querySelectorAll('input[name^="_"]');
        formsubmitFields.forEach(field => field.remove());

        // Adiciona listener de submit
        form.addEventListener('submit', handleFormSubmit);
    }

    // =====================================================
    // HANDLER DO SUBMIT
    // =====================================================
    async function handleFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const formSuccess = document.getElementById('form-success');
        const formError = document.getElementById('form-error');

        // Esconde mensagens anteriores
        if (formSuccess) formSuccess.classList.add('hidden');
        if (formError) formError.classList.add('hidden');

        // Validação básica
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Estado de loading
        setLoadingState(submitBtn, true);

        try {
            // Usar FormData que é o método recomendado pela Web3Forms
            // O FormData automaticamente inclui todos os campos, incluindo h-captcha-response
            const formData = new FormData(form);
            
            // Adiciona metadados extras
            formData.append('from_name', 'Site Isadora Carvalho Arquitetura');
            formData.append('subject', 'Novo contato do site - ' + (formData.get('tipo_projeto') || 'Projeto'));

            const response = await fetch(WEB3FORMS_ENDPOINT, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                handleSuccess(form, formSuccess);
            } else {
                throw new Error(result.message || 'Erro ao enviar formulário');
            }

        } catch (error) {
            handleError(error, formError);
        } finally {
            setLoadingState(submitBtn, false);
        }
    }

    // =====================================================
    // FUNÇÕES AUXILIARES
    // =====================================================

    /**
     * Define estado de loading no botão
     */
    function setLoadingState(button, isLoading) {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `
                <span class="spinner-btn"></span>
                <span>Enviando...</span>
            `;
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || 'Enviar Mensagem';
        }
    }

    /**
     * Trata sucesso no envio
     */
    function handleSuccess(form, successElement) {
        const popupContent = form.closest('.popup-content');
        const popupHeader = popupContent ? popupContent.querySelector('.popup-header') : null;

        // Esconde o formulário
        form.style.display = 'none';

        // Esconde o cabeçalho ("Vamos conversar...") para ficar apenas a confirmação
        if (popupHeader) {
            popupHeader.style.display = 'none';
        }

        // Mostra mensagem de sucesso
        if (successElement) {
            successElement.classList.remove('hidden');
        }

        // Reseta o formulário
        form.reset();

        // Após mostrar sucesso, inicia animação de envelope
        setTimeout(() => {
            const popup = document.getElementById('popup-form-bg');
            
            // ETAPA 1: Transforma em envelope (mostra ícone)
            if (popupContent) {
                popupContent.classList.add('transform-to-envelope');
            }

            // ETAPA 2: Após virar envelope, faz ele voar E o fundo some junto
            setTimeout(() => {
                if (popupContent) {
                    popupContent.classList.add('flying');
                }
                // Fundo começa a desaparecer junto com o envelope
                if (popup) {
                    popup.classList.add('fading');
                }

                // ETAPA 3: Após voar, esconde tudo
                setTimeout(() => {
                    if (popup) {
                        popup.classList.add('hidden');
                        document.body.style.overflow = '';

                        // Restaura para próximo uso
                        setTimeout(() => {
                            if (popupContent) {
                                popupContent.classList.remove('transform-to-envelope', 'flying');
                            }
                            if (popup) {
                                popup.classList.remove('fading');
                            }
                            form.style.display = 'block';
                            if (popupHeader) {
                                popupHeader.style.display = '';
                            }
                            if (successElement) {
                                successElement.classList.add('hidden');
                            }
                        }, 300);
                    }
                }, 1500); // Mesma duração do voo (1.5s)
            }, 800); // Tempo para ver o envelope formado
        }, 2500);
    }

    /**
     * Trata erro no envio
     */
    function handleError(error, errorElement) {
        console.error('Erro Web3Forms:', error);

        if (errorElement) {
            errorElement.classList.remove('hidden');
            const msg = (error && error.message) ? error.message : '';
            errorElement.querySelector('p').textContent = msg
                ? msg
                : 'Ocorreu um erro ao enviar sua mensagem. Tente novamente ou entre em contato pelo WhatsApp.';
        } else {
            alert('Ops! Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
        }
    }

    // =====================================================
    // EXPORTA CONFIGURAÇÃO PARA DEBUG
    // =====================================================
    window.Web3FormsConfig = {
        endpoint: WEB3FORMS_ENDPOINT,
        isConfigured: true
    };

})();
