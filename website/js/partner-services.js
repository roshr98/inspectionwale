(function () {
    const serviceMeta = {
        loan: {
            label: 'Car Loan',
            icon: 'fas fa-hand-holding-usd',
            copy: 'Compare EMI-fit finance options once the car and budget look right.'
        },
        insurance: {
            label: 'Insurance',
            icon: 'fas fa-shield-alt',
            copy: 'Renew expiring policies or request quotes that match the inspected vehicle.'
        },
        warranty: {
            label: 'Extended Warranty',
            icon: 'fas fa-certificate',
            copy: 'Keep major repair risk covered for used cars with longer ownership plans.'
        },
        'rto-transfer': {
            label: 'RTO Transfer',
            icon: 'fas fa-exchange-alt',
            copy: 'Track ownership paperwork, RC transfer and compliance tasks after the deal closes.'
        }
    };

    function initPartnerServices() {
        const modalEl = document.getElementById('partnerServiceModal');
        const form = document.getElementById('partnerServiceRequestForm');
        if (!modalEl || !form) return;

        const selectedTitle = modalEl.querySelector('[data-partner-service-selected-title]');
        const selectedCopy = modalEl.querySelector('[data-partner-service-selected-copy]');
        const selectedIcon = modalEl.querySelector('.partner-service-modal__selected-icon i');
        const categoryInput = document.getElementById('partnerServiceCategory');
        const sourceInput = document.getElementById('partnerServiceSource');
        const contextInput = document.getElementById('partnerServiceContext');
        const requirementInput = document.getElementById('partnerServiceRequirement');
        const submitButton = document.getElementById('partnerServiceRequestSubmit');
        const statusEl = document.getElementById('partnerServiceRequestStatus');
        const modalTitle = document.getElementById('partnerServiceModalLabel');
        const defaultButtonLabel = submitButton ? submitButton.textContent : 'Request Assistance';

        let activeRequest = {
            serviceKey: '',
            serviceLabel: '',
            source: sourceInput ? sourceInput.value : '',
            pageContext: '',
            listingTitle: '',
            listingId: '',
            expectedPrice: '',
            vehicleDetails: ''
        };

        function getQuoteUrl() {
            const host = window.location && window.location.hostname ? window.location.hostname : '';
            const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
            return isLocal
                ? 'https://dnocsuec6aeok3oykcujglp2hq0bocso.lambda-url.us-east-1.on.aws/'
                : '/api/quote';
        }

        function escapeForText(value) {
            return String(value || '').replace(/\s+/g, ' ').trim();
        }

        function readText(selector) {
            const node = document.querySelector(selector);
            return node ? escapeForText(node.textContent) : '';
        }

        function getCurrentContext(trigger) {
            const source = trigger.dataset.partnerServiceSource || 'website';
            const explicitTarget = trigger.dataset.partnerServiceContextTarget;
            const explicitContext = trigger.dataset.partnerServiceContext || '';
            const pageContext = explicitContext || source.replace(/-/g, ' ');
            const listingTitle = explicitTarget ? readText(explicitTarget) : '';
            const listingId = readText('#carDetailId') || '';
            const expectedPrice = readText('#carDetailExpPrice') || '';
            const vehicleDetails = [
                listingTitle,
                readText('#carDetailKmsDisplay'),
                readText('#carDetailTitle')
            ].filter(Boolean).join(' | ');

            return {
                source,
                pageContext,
                listingTitle,
                listingId,
                expectedPrice,
                vehicleDetails
            };
        }

        function setStatus(message, type) {
            if (!statusEl) return;
            statusEl.textContent = message || '';
            statusEl.classList.remove('is-visible', 'is-success', 'is-error');
            if (!message) return;
            statusEl.classList.add('is-visible');
            if (type === 'success') statusEl.classList.add('is-success');
            if (type === 'error') statusEl.classList.add('is-error');
        }

        function openModal(trigger) {
            const serviceKey = trigger.dataset.partnerService || '';
            const meta = serviceMeta[serviceKey];
            if (!meta) return;

            const context = getCurrentContext(trigger);
            activeRequest = {
                serviceKey,
                serviceLabel: meta.label,
                source: context.source,
                pageContext: context.pageContext,
                listingTitle: context.listingTitle,
                listingId: context.listingId,
                expectedPrice: context.expectedPrice,
                vehicleDetails: context.vehicleDetails
            };

            if (selectedTitle) selectedTitle.textContent = meta.label;
            if (selectedCopy) selectedCopy.textContent = trigger.dataset.partnerServiceCopy || meta.copy;
            if (selectedIcon) selectedIcon.className = meta.icon;
            if (modalTitle) modalTitle.textContent = meta.label + ' Assistance';
            if (categoryInput) categoryInput.value = serviceKey;
            if (sourceInput) sourceInput.value = context.source;
            if (contextInput) contextInput.value = [context.pageContext, context.listingTitle].filter(Boolean).join(' | ');
            if (requirementInput) {
                requirementInput.value = [
                    'I need support for ' + meta.label.toLowerCase() + '.',
                    context.listingTitle ? 'Vehicle: ' + context.listingTitle : '',
                    context.expectedPrice ? 'Price: ' + context.expectedPrice : ''
                ].filter(Boolean).join('\n');
                requirementInput.focus();
                requirementInput.setSelectionRange(requirementInput.value.length, requirementInput.value.length);
            }
            setStatus('', '');
            form.classList.remove('was-validated');

            if (window.bootstrap && bootstrap.Modal) {
                const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modal.show();
            }
        }

        document.querySelectorAll('[data-partner-service]').forEach((button) => {
            button.addEventListener('click', function () {
                openModal(button);
            });
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                setStatus('Please complete the required details so the team can respond properly.', 'error');
                return;
            }

            form.classList.remove('was-validated');
            setStatus('', '');

            const formData = new FormData(form);
            const payload = {
                formType: 'partner-service-lead',
                name: escapeForText(formData.get('name')),
                mobile: escapeForText(formData.get('mobile')),
                email: escapeForText(formData.get('email')),
                city: escapeForText(formData.get('city')),
                message: escapeForText(formData.get('message')),
                serviceCategory: activeRequest.serviceKey || escapeForText(formData.get('serviceCategory')),
                serviceLabel: activeRequest.serviceLabel,
                sourceSection: activeRequest.source,
                pageContext: activeRequest.pageContext,
                listingTitle: activeRequest.listingTitle,
                listingId: activeRequest.listingId,
                expectedPrice: activeRequest.expectedPrice,
                vehicleDetails: activeRequest.vehicleDetails,
                model: activeRequest.vehicleDetails || activeRequest.listingTitle || activeRequest.serviceLabel
            };

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }

            try {
                const response = await fetch(getQuoteUrl(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json().catch(function () { return {}; });
                if (!response.ok || data.error) {
                    throw new Error(data.error || 'request_failed');
                }

                setStatus('Request received. The team will contact you shortly.', 'success');
                form.reset();
                if (categoryInput) categoryInput.value = activeRequest.serviceKey;
                if (sourceInput) sourceInput.value = activeRequest.source;
                if (contextInput) contextInput.value = [activeRequest.pageContext, activeRequest.listingTitle].filter(Boolean).join(' | ');

                window.setTimeout(function () {
                    if (window.bootstrap && bootstrap.Modal) {
                        const modal = bootstrap.Modal.getInstance(modalEl);
                        if (modal) modal.hide();
                    }
                    setStatus('', '');
                }, 1800);
            } catch (error) {
                setStatus(
                    error && error.message === 'name and mobile required'
                        ? 'Name and mobile number are required.'
                        : 'Unable to send the request right now. Please try again.',
                    'error'
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = defaultButtonLabel;
                }
            }
        });

        modalEl.addEventListener('hidden.bs.modal', function () {
            setStatus('', '');
            form.classList.remove('was-validated');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPartnerServices);
    } else {
        initPartnerServices();
    }
})();
