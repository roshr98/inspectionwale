(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').css('top', '0px');
        } else {
            $('.sticky-top').css('top', '-100px');
        }
    });
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Date and time picker
    $('.date').datetimepicker({
        format: 'L'
    });
    $('.time').datetimepicker({
        format: 'LT'
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 25,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
})(jQuery);

(function(){
    const API_ENDPOINT = 'https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings'
    const REQUIRED_PHOTO_SLOTS = ['exteriorFront', 'exteriorBack', 'exteriorLeft', 'exteriorRight', 'interiorSeat', 'interiorCluster']
    const DOCUMENT_SLOT = 'rcDocument'
    const FALLBACK_IMAGES = ['Images/car-1.jpg', 'Images/car-2.jpg', 'Images/car-3.jpg', 'Images/car-4.jpg']

    const listingsCache = new Map()
    const selectedPhotos = new Map()
    const previewUrls = new Map()
    let currentListingId = null

    document.addEventListener('DOMContentLoaded', () => {
        initListCarForm()
        initReserveForm()
        initDetailModal()
        fetchAndRenderListings()
    })

    async function fetchAndRenderListings() {
        const carousel = document.getElementById('customerListingsCarousel')
        if (!carousel) return

        const indicators = document.getElementById('customerListingsIndicators')
        const inner = document.getElementById('customerListingsInner')

        try {
            const res = await fetch(API_ENDPOINT, { headers: { Accept: 'application/json' } })
            const data = await res.json()
            if (!res.ok || !data || data.ok === false) {
                throw new Error((data && data.error) || 'failed_to_fetch')
            }

            const items = Array.isArray(data.items) ? data.items : []
            listingsCache.clear()
            items.forEach(item => {
                if (item && item.listingId) listingsCache.set(item.listingId, item)
            })

            if (!items.length) {
                renderEmptyCarousel(inner, indicators)
            } else {
                renderCarousel(items, inner, indicators)
            }
        } catch (error) {
            console.error('Unable to load listings', error)
            renderEmptyCarousel(inner, indicators, 'Customer listings are being verified. Please check again shortly.')
        }
    }

    function renderEmptyCarousel(inner, indicators, message) {
        if (!inner) return
        inner.innerHTML = ''
        if (indicators) indicators.innerHTML = ''

        const item = document.createElement('div')
        item.className = 'carousel-item active'
        const row = document.createElement('div')
        row.className = 'row g-4'
        const col = document.createElement('div')
        col.className = 'col-12'
        const card = document.createElement('div')
        card.className = 'customer-highlight-card p-4 h-100 text-center'
        const text = document.createElement('p')
        text.className = 'text-muted mb-0'
        text.textContent = message || 'Approved customer listings will appear here once they are verified by our team.'
        card.appendChild(text)
        col.appendChild(card)
        row.appendChild(col)
        item.appendChild(row)
        inner.appendChild(item)

        toggleCarouselControls(false)
    }

    function renderCarousel(items, inner, indicators) {
        if (!inner) return
        inner.innerHTML = ''
        if (indicators) indicators.innerHTML = ''

        const groups = []
        for (let i = 0; i < items.length; i += 2) {
            groups.push(items.slice(i, i + 2))
        }

        groups.forEach((group, index) => {
            const itemEl = document.createElement('div')
            itemEl.className = 'carousel-item' + (index === 0 ? ' active' : '')
            const row = document.createElement('div')
            row.className = 'row g-4'

            group.forEach((listing, groupIndex) => {
                row.appendChild(buildListingCard(listing, index + groupIndex))
            })

            itemEl.appendChild(row)
            inner.appendChild(itemEl)

            if (indicators) {
                const indicator = document.createElement('button')
                indicator.type = 'button'
                indicator.setAttribute('data-bs-target', '#customerListingsCarousel')
                indicator.setAttribute('data-bs-slide-to', String(index))
                indicator.setAttribute('aria-label', `Listing set ${index + 1}`)
                if (index === 0) {
                    indicator.classList.add('active')
                    indicator.setAttribute('aria-current', 'true')
                }
                indicators.appendChild(indicator)
            }
        })

        toggleCarouselControls(groups.length > 1)
    }

    function toggleCarouselControls(visible) {
        const carousel = document.getElementById('customerListingsCarousel')
        if (!carousel) return
        const controls = carousel.querySelectorAll('.carousel-control-prev, .carousel-control-next')
        controls.forEach(ctrl => {
            ctrl.classList.toggle('d-none', !visible)
        })
        const indicators = document.getElementById('customerListingsIndicators')
        if (indicators) {
            indicators.classList.toggle('d-none', controls.length === 0 || !visible)
        }
    }

    function buildListingCard(listing, index) {
        const col = document.createElement('div')
        col.className = 'col-lg-6'
        const article = document.createElement('article')
        article.className = 'customer-highlight-card p-4 h-100'
        article.dataset.listingId = listing.listingId
        article.setAttribute('role', 'button')
        article.setAttribute('tabindex', '0')

        article.addEventListener('click', () => openDetailModal(listing.listingId))
        article.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openDetailModal(listing.listingId)
            }
        })

        const header = document.createElement('div')
        header.className = 'd-flex justify-content-between align-items-start mb-3'

        const info = document.createElement('div')
        const title = document.createElement('h4')
        title.className = 'mb-1'
        title.textContent = buildListingTitle(listing)
        const stats = document.createElement('p')
        stats.className = 'text-muted mb-0'
        stats.textContent = buildListingStats(listing)
        info.appendChild(title)
        info.appendChild(stats)

        const imageWrapper = document.createElement('div')
        const heroImg = document.createElement('img')
        heroImg.className = 'rounded'
        heroImg.style.width = '110px'
        heroImg.style.height = '80px'
        heroImg.style.objectFit = 'cover'
        heroImg.alt = `${buildListingTitle(listing)} photo`
        heroImg.src = pickHeroImage(listing, index)
        imageWrapper.appendChild(heroImg)

        header.appendChild(info)
        header.appendChild(imageWrapper)

        const summary = document.createElement('p')
        summary.className = 'text-muted'
        summary.textContent = listing.summary || 'Owner-listed vehicle. InspectionWale verifies every submission before it goes live.'

        const footer = document.createElement('div')
        footer.className = 'd-flex align-items-center justify-content-between'
        const price = document.createElement('strong')
        price.className = 'text-primary'
        price.textContent = formatPrice(listing.car && listing.car.expectedPrice)

        const buttonGroup = document.createElement('div')
        buttonGroup.className = 'd-flex gap-2'

        const detailsBtn = document.createElement('button')
        detailsBtn.type = 'button'
        detailsBtn.className = 'btn btn-outline-primary btn-sm'
        detailsBtn.textContent = 'View Details'
        detailsBtn.addEventListener('click', (event) => {
            event.stopPropagation()
            openDetailModal(listing.listingId)
        })

        const reserveBtn = document.createElement('button')
        reserveBtn.type = 'button'
        reserveBtn.className = 'btn btn-success btn-sm'
        reserveBtn.textContent = 'Reserve'
        reserveBtn.addEventListener('click', (event) => {
            event.stopPropagation()
            openReserveModal(listing.listingId)
        })

        buttonGroup.appendChild(detailsBtn)
        buttonGroup.appendChild(reserveBtn)

        footer.appendChild(price)
        footer.appendChild(buttonGroup)

        article.appendChild(header)
        article.appendChild(summary)
        article.appendChild(footer)
        col.appendChild(article)
        return col
    }

    function buildListingTitle(listing) {
        const car = listing.car || {}
        const make = car.make || ''
        const model = car.model || ''
        const edition = car.edition ? ` ${car.edition}` : ''
        return `${make} ${model}${edition}`.trim()
    }

    function buildListingStats(listing) {
        const car = listing.car || {}
        const parts = []
        if (car.registrationYear) parts.push(car.registrationYear)
        if (car.kmsDriven) parts.push(formatKms(car.kmsDriven))
        return parts.join(' • ')
    }

    function pickHeroImage(listing, index) {
        const photos = listing.photos || {}
        const primary = photos.exteriorFront && photos.exteriorFront.url
        if (primary) return primary
        const fallback = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
        return fallback
    }

    function formatPrice(value) {
        if (value === undefined || value === null || value === '') return 'Price on request'
        const numeric = Number(String(value).replace(/[^0-9.]/g, ''))
        if (!Number.isFinite(numeric) || numeric <= 0) return 'Price on request'
        return `Rs. ${new Intl.NumberFormat('en-IN').format(Math.round(numeric))}`
    }

    function formatKms(value) {
        if (value === undefined || value === null || value === '') return ''
        const numeric = Number(String(value).replace(/[^0-9.]/g, ''))
        if (!Number.isFinite(numeric)) return String(value)
        return `${new Intl.NumberFormat('en-IN').format(Math.round(numeric))} KM`
    }

    function initListCarForm() {
        const form = document.getElementById('listCarForm')
        if (!form) return

        const alertBox = document.getElementById('listCarFormAlert')
        const submitBtn = document.getElementById('listCarSubmitBtn')

        form.querySelectorAll('.list-car-photo').forEach(input => {
            input.addEventListener('change', () => handlePhotoChange(input))
        })

        form.querySelectorAll('[data-clear]').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = btn.getAttribute('data-clear')
                clearPhotoInput(slot, form)
            })
        })

        form.addEventListener('submit', async (event) => {
            event.preventDefault()
            event.stopPropagation()

            if (!form.checkValidity()) {
                form.classList.add('was-validated')
                return
            }

            if (!validateRequiredPhotos()) {
                showAlert(alertBox, 'danger', 'Please attach all required photos before submitting.')
                return
            }

            form.classList.remove('was-validated')
            hideAlert(alertBox)
            submitBtn.disabled = true
            submitBtn.innerText = 'Uploading...'

            try {
                const filesPayload = []
                for (const [slot, file] of selectedPhotos.entries()) {
                    filesPayload.push({ slot, contentType: file.type || 'image/jpeg' })
                }

                const uploadMeta = await apiPost('requestUpload', { files: filesPayload })
                const submissionId = uploadMeta.submissionId

                for (const upload of uploadMeta.uploads || []) {
                    const file = selectedPhotos.get(upload.slot)
                    if (!file) continue
                    const uploadResponse = await fetch(upload.uploadUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': file.type || 'image/jpeg' },
                        body: file
                    })
                    if (!uploadResponse.ok) {
                        throw new Error('upload_failed')
                    }
                }

                const payload = buildListingPayload(form, uploadMeta)
                payload.submissionId = submissionId

                const submitResult = await apiPost('submitListing', payload)
                showAlert(alertBox, 'success', submitResult.message || 'Submitted successfully. Our team will verify and publish the listing.')
                
                // Show success popup and close modal
                setTimeout(() => {
                    alert('Thank you for listing your car! We have received your submission and will verify it shortly. You will be contacted once approved.')
                    const listCarModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl)
                    listCarModal.hide()
                    form.reset()
                    resetPhotoPreviews(form)
                    hideAlert(alertBox)
                }, 1500)
            } catch (error) {
                console.error('Listing submission failed', error)
                showAlert(alertBox, 'danger', friendlyError(error))
            } finally {
                submitBtn.disabled = false
                submitBtn.innerText = 'Submit for Verification'
            }
        })

        const modalEl = document.getElementById('listCarModal')
        if (modalEl) {
            modalEl.addEventListener('hidden.bs.modal', () => {
                hideAlert(alertBox)
                form.reset()
                resetPhotoPreviews(form)
                form.classList.remove('was-validated')
            })
        }
    }

    function handlePhotoChange(input) {
        const slot = input.getAttribute('data-slot')
        if (!slot) return
        const previewImg = input.form ? input.form.querySelector(`img[data-preview="${slot}"]`) : null
        const clearBtn = input.form ? input.form.querySelector(`[data-clear="${slot}"]`) : null

        if (!input.files || !input.files.length) {
            selectedPhotos.delete(slot)
            if (previewUrls.has(slot)) {
                URL.revokeObjectURL(previewUrls.get(slot))
                previewUrls.delete(slot)
            }
            if (previewImg) {
                previewImg.src = ''
                previewImg.classList.add('d-none')
            }
            if (clearBtn) clearBtn.classList.add('d-none')
            return
        }

        const file = input.files[0]
        selectedPhotos.set(slot, file)

        if (previewUrls.has(slot)) {
            URL.revokeObjectURL(previewUrls.get(slot))
        }
        const url = URL.createObjectURL(file)
        previewUrls.set(slot, url)

        if (previewImg) {
            previewImg.src = url
            previewImg.classList.remove('d-none')
        }
        if (clearBtn) clearBtn.classList.remove('d-none')
    }

    function clearPhotoInput(slot, form) {
        const input = form.querySelector(`input[data-slot="${slot}"]`)
        if (!input) return
        input.value = ''
        input.dispatchEvent(new Event('change', { bubbles: true }))
    }

    function resetPhotoPreviews(form) {
        selectedPhotos.clear()
        for (const url of previewUrls.values()) {
            URL.revokeObjectURL(url)
        }
        previewUrls.clear()
        form.querySelectorAll('img[data-preview]').forEach(img => {
            img.src = ''
            img.classList.add('d-none')
        })
        form.querySelectorAll('[data-clear]').forEach(btn => btn.classList.add('d-none'))
    }

    function validateRequiredPhotos() {
        for (const slot of [...REQUIRED_PHOTO_SLOTS, DOCUMENT_SLOT]) {
            if (!selectedPhotos.has(slot)) return false
        }
        return true
    }

    function buildListingPayload(form, uploadMeta) {
        const formData = new FormData(form)
        const seller = {
            name: formData.get('sellerName') || '',
            mobile: formData.get('sellerMobile') || '',
            email: formData.get('sellerEmail') || ''
        }

        const car = {
            make: formData.get('carMake') || '',
            model: formData.get('carModel') || '',
            edition: formData.get('carEdition') || '',
            registrationYear: formData.get('registrationYear') || '',
            kmsDriven: formData.get('kmsDriven') || '',
            expectedPrice: formData.get('expectedPrice') || ''
        }

        const photos = []
        const uploads = uploadMeta.uploads || []
        uploads.forEach(upload => {
            const file = selectedPhotos.get(upload.slot)
            photos.push({
                slot: upload.slot,
                key: upload.key,
                contentType: upload.contentType || (file && file.type) || 'image/jpeg',
                originalName: file && file.name ? file.name : ''
            })
        })

        return { seller, car, photos }
    }

    function initReserveForm() {
        const form = document.getElementById('reserveListingForm')
        if (!form) return
        const alertBox = document.getElementById('reserveFormAlert')
        const submitBtn = document.getElementById('reserveSubmitBtn')

        form.addEventListener('submit', async (event) => {
            event.preventDefault()
            event.stopPropagation()

            if (!form.checkValidity()) {
                form.classList.add('was-validated')
                return
            }

            form.classList.remove('was-validated')
            hideAlert(alertBox)
            submitBtn.disabled = true
            submitBtn.innerText = 'Submitting...'

            const formData = new FormData(form)
            const payload = {
                listingId: formData.get('listingId'),
                name: formData.get('name'),
                email: formData.get('email') || '',
                mobile: formData.get('mobile'),
                offerPrice: formData.get('offerPrice') || ''
            }

            try {
                const result = await apiPost('reserve', payload)
                showAlert(alertBox, 'success', result.message || 'Thank you! We will share your offer with the seller and call you shortly.')
                submitBtn.innerText = 'Submitted'
            } catch (error) {
                console.error('Reserve request failed', error)
                showAlert(alertBox, 'danger', friendlyError(error))
                submitBtn.disabled = false
                submitBtn.innerText = 'Reserve Now'
            }
        })

        const modalEl = document.getElementById('reserveListingModal')
        if (modalEl) {
            modalEl.addEventListener('hidden.bs.modal', () => {
                form.reset()
                form.classList.remove('was-validated')
                hideAlert(alertBox)
                submitBtn.disabled = false
                submitBtn.innerText = 'Reserve Now'
                
                // Clean up any stray modal backdrops
                const backdrops = document.querySelectorAll('.modal-backdrop')
                backdrops.forEach(backdrop => backdrop.remove())
                document.body.classList.remove('modal-open')
                document.body.style.overflow = ''
                document.body.style.paddingRight = ''
            })
        }
    }

    function openReserveModal(listingId) {
        const listing = listingsCache.get(listingId)
        if (!listing) return
        const form = document.getElementById('reserveListingForm')
        if (!form) return

        const summary = document.getElementById('reserveListingSummary')
        const hiddenId = document.getElementById('reserveListingId')
        const alertBox = document.getElementById('reserveFormAlert')
        const submitBtn = document.getElementById('reserveSubmitBtn')

        form.reset()
        form.classList.remove('was-validated')
        hideAlert(alertBox)
        submitBtn.disabled = false
        submitBtn.innerText = 'Reserve Now'

        hiddenId.value = listingId
        summary.textContent = `${buildListingTitle(listing)} • ${buildListingStats(listing)} • ${formatPrice(listing.car && listing.car.expectedPrice)}`

        const modalEl = document.getElementById('reserveListingModal')
        const modal = new bootstrap.Modal(modalEl)
        modal.show()
    }

    function initDetailModal() {
        const detailReserveBtn = document.getElementById('detailReserveBtn')
        const detailBookBtn = document.getElementById('detailBookInspectionBtn')

        if (detailReserveBtn) {
            detailReserveBtn.addEventListener('click', () => {
                if (!currentListingId) return
                
                // Close detail modal first
                const detailModalEl = document.getElementById('listingDetailModal')
                if (detailModalEl) {
                    const detailModal = bootstrap.Modal.getInstance(detailModalEl)
                    if (detailModal) {
                        detailModal.hide()
                    }
                }
                
                // Wait for modal to close, then open reserve modal
                setTimeout(() => {
                    openReserveModal(currentListingId)
                }, 300)
            })
        }

        if (detailBookBtn) {
            detailBookBtn.addEventListener('click', () => {
                if (!currentListingId) return
                const listing = listingsCache.get(currentListingId)
                if (!listing) return
                
                // Close detail modal first
                const modalEl = document.getElementById('listingDetailModal')
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl)
                    if (modal) {
                        modal.hide()
                    }
                }
                
                // Prefill and scroll to booking form after modal closes
                setTimeout(() => {
                    prefillBookingForm(listing)
                    const bookingSection = document.getElementById('book')
                    if (bookingSection) {
                        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                }, 300)
            })
        }
    }

    function openDetailModal(listingId) {
        const listing = listingsCache.get(listingId)
        if (!listing) return
        currentListingId = listingId

        const titleEl = document.getElementById('listingDetailTitle')
        const summaryEl = document.getElementById('listingDetailSummary')
        const metaEl = document.getElementById('listingDetailMeta')
        const heroImg = document.getElementById('listingDetailHero')
        const thumbContainer = document.getElementById('listingDetailThumbnails')
        const yearEl = document.getElementById('detailYear')
        const kmsEl = document.getElementById('detailKms')
        const priceEl = document.getElementById('detailPrice')

        if (titleEl) titleEl.textContent = buildListingTitle(listing)
        if (summaryEl) summaryEl.textContent = listing.summary || 'Owner-listed vehicle. InspectionWale verifies every submission before it goes live.'
        if (metaEl) metaEl.textContent = listing.createdAt ? `Submitted on ${new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''
        if (yearEl) yearEl.textContent = listing.car && listing.car.registrationYear ? listing.car.registrationYear : '-'
        if (kmsEl) kmsEl.textContent = listing.car && listing.car.kmsDriven ? formatKms(listing.car.kmsDriven) : '-'
        if (priceEl) priceEl.textContent = formatPrice(listing.car && listing.car.expectedPrice)

        const photos = []
        const photoEntries = listing.photos ? Object.entries(listing.photos) : []
        photoEntries.forEach(([slot, meta]) => {
            if (meta && meta.url && slot !== DOCUMENT_SLOT) photos.push({ slot, url: meta.url })
        })

        if (!photos.length) {
            photos.push({ slot: 'exteriorFront', url: pickHeroImage(listing, 0) })
        }

        if (heroImg) {
            heroImg.src = photos[0].url
            heroImg.alt = `${buildListingTitle(listing)} photo`
        }

        if (thumbContainer) {
            thumbContainer.innerHTML = ''
            photos.forEach((photo, idx) => {
                const btn = document.createElement('button')
                btn.type = 'button'
                btn.className = 'btn btn-outline-secondary p-0'
                btn.style.width = '90px'
                btn.style.height = '60px'
                btn.style.overflow = 'hidden'
                btn.title = `View ${photo.slot}`
                const img = document.createElement('img')
                img.src = photo.url
                img.alt = `${photo.slot} view`
                img.className = 'w-100 h-100'
                img.style.objectFit = 'cover'
                btn.appendChild(img)
                btn.addEventListener('click', () => {
                    if (heroImg) {
                        heroImg.src = photo.url
                        heroImg.alt = `${buildListingTitle(listing)} photo`
                    }
                    thumbContainer.querySelectorAll('button').forEach(el => el.classList.remove('active'))
                    btn.classList.add('active')
                })
                if (idx === 0) btn.classList.add('active')
                thumbContainer.appendChild(btn)
            })
        }

        const modalEl = document.getElementById('listingDetailModal')
        const modal = new bootstrap.Modal(modalEl)
        
        // Clean up backdrop on modal hide
        modalEl.addEventListener('hidden.bs.modal', function cleanupBackdrop() {
            const backdrops = document.querySelectorAll('.modal-backdrop')
            backdrops.forEach(backdrop => backdrop.remove())
            document.body.classList.remove('modal-open')
            document.body.style.overflow = ''
            document.body.style.paddingRight = ''
        }, { once: true })
        
        modal.show()
    }

    function prefillBookingForm(listing) {
        const car = listing.car || {}
        const makeField = document.getElementById('bk_make')
        const yearField = document.getElementById('bk_year')
        const kmsField = document.getElementById('bk_kms')
        const typeField = document.getElementById('bk_cartype')

        if (makeField) makeField.value = buildListingTitle(listing)
        if (yearField) yearField.value = car.registrationYear || ''
        if (kmsField) kmsField.value = stripDigits(car.kmsDriven)
        if (typeField) typeField.value = 'used'
    }

    function stripDigits(value) {
        if (value === undefined || value === null) return ''
        const digits = String(value).replace(/[^0-9]/g, '')
        return digits
    }

    async function apiPost(action, body) {
        const res = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...body })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || (data && data.ok === false)) {
            const error = new Error((data && data.error) || 'request_failed')
            error.payload = data
            throw error
        }
        return data
    }

    function showAlert(element, type, message) {
        if (!element) return
        element.className = `alert alert-${type}`
        element.textContent = message
        element.classList.remove('d-none')
    }

    function hideAlert(element) {
        if (!element) return
        element.classList.add('d-none')
        element.textContent = ''
    }

    function friendlyError(error) {
        if (!error) return 'Something went wrong. Please try again.'
        if (error.message === 'upload_failed') {
            return 'Photo upload failed. Please check your connection and try once more.'
        }
        if (error.payload && error.payload.error) {
            switch (error.payload.error) {
                case 'files_required':
                    return 'Please attach the requested photos before submitting.'
                case 'car_details_incomplete':
                    return 'Car details are incomplete. Kindly fill in make, model, year, KMs and expected price.'
                case 'seller_details_required':
                    return 'Name and mobile number are required.'
                case 'listing_not_found':
                    return 'This listing is no longer available.'
                default:
                    return 'Unable to process your request right now. Please try again shortly.'
            }
        }
        return 'Unable to process your request right now. Please try again shortly.'
    }
})()


