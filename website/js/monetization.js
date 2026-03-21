(function () {
    const CONFIG = {
        adClient: 'ca-pub-XXXXXXXXXXXXXXXX',
        adSlots: {
            topBanner: '1111111111',
            inline: '2222222222',
            detail: '3333333333',
            footer: '4444444444',
            booking: '5555555555',
            sticky: '6666666666'
        }
    };

    const OFFERS = {
        insurance: {
            id: 'insurance-check',
            title: 'Best deals on car insurance',
            description: 'Compare zero-dep, bumper-to-bumper and premium cover options tailored to your car profile.',
            cta: 'Get Insurance',
            href: 'https://example.com/affiliate/car-insurance',
            icon: 'fas fa-shield-alt',
            label: 'Insurance',
            priceText: 'Save on premium renewals'
        },
        premiumInsurance: {
            id: 'premium-insurance',
            title: 'Premium car insurance cover',
            description: 'High-value vehicle plans with add-ons for roadside support, consumables and invoice protection.',
            cta: 'View Premium Cover',
            href: 'https://example.com/affiliate/premium-insurance',
            icon: 'fas fa-gem',
            label: 'Premium Insurance',
            priceText: 'Protect premium vehicles'
        },
        loan: {
            id: 'emi-loan',
            title: 'Top loan offers',
            description: 'Estimate EMIs, compare lender rates and see which finance option fits your budget band.',
            cta: 'Check Loan',
            href: 'https://example.com/affiliate/car-loan',
            icon: 'fas fa-calculator',
            label: 'Loan',
            priceText: 'Low-EMI options'
        },
        warranty: {
            id: 'extended-warranty',
            title: 'Used car warranty plans',
            description: 'Reduce post-purchase risk with coverage on engine, gearbox and roadside assistance.',
            cta: 'View Offer',
            href: 'https://example.com/affiliate/car-warranty',
            icon: 'fas fa-tools',
            label: 'Warranty',
            priceText: 'Coverage for hidden repairs'
        },
        sell: {
            id: 'instant-sell',
            title: 'Sell your car instantly',
            description: 'Get a resale estimate, compare channels and move into a faster sale flow for your current car.',
            cta: 'Sell Your Car',
            href: 'https://example.com/affiliate/sell-car',
            icon: 'fas fa-bolt',
            label: 'Resale',
            priceText: 'Fast valuation support'
        }
    };

    let interactionBound = false;
    let observer = null;

    function track(eventName, payload) {
        const detail = Object.assign({
            ts: new Date().toISOString(),
            page: payload?.page || document.body?.dataset?.page || document.body?.className || 'website'
        }, payload || {});

        try {
            if (window.dataLayer && Array.isArray(window.dataLayer)) {
                window.dataLayer.push(Object.assign({ event: eventName }, detail));
            }
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, detail);
            }
            sessionStorage.setItem('iw:lastMonetizationEvent', JSON.stringify({ eventName, detail }));
        } catch (error) {
            console.warn('[IW Monetization] tracking failed', error);
        }
    }

    function trackClick(payload) {
        track('iw_affiliate_click', payload);
    }

    function trackConversion(payload) {
        track('iw_affiliate_conversion', payload);
    }

    function getIntent(context) {
        const price = Number(context?.price || 0);
        const budget = (context?.budget || '').toLowerCase();
        if (price >= 1000000 || context?.segment === 'premium') return 'premium';
        if (price > 0 && price < 500000) return 'budget';
        if (budget === 'lt5' || budget === 'lt3' || budget === 'lt2' || budget === 'lt1') return 'budget';
        return 'standard';
    }

    function pickOffers(context, count) {
        const intent = getIntent(context || {});
        const pool = intent === 'premium'
            ? [OFFERS.premiumInsurance, OFFERS.warranty, OFFERS.loan]
            : intent === 'budget'
                ? [OFFERS.loan, OFFERS.insurance, OFFERS.sell]
                : [OFFERS.insurance, OFFERS.loan, OFFERS.warranty];
        return pool.slice(0, count || 3);
    }

    function pickOffer(context) {
        return pickOffers(context, 1)[0];
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function adSenseMarkup(slotKey, format) {
        const slot = CONFIG.adSlots[slotKey] || slotKey || CONFIG.adSlots.inline;
        return `
            <div class="iw-adsense-shell" aria-label="Advertisement placeholder">
                <ins class="adsbygoogle iw-adsense-slot"
                    data-ad-client="${CONFIG.adClient}"
                    data-ad-slot="${slot}"
                    data-ad-format="${format || 'auto'}"
                    data-full-width-responsive="true"></ins>
            </div>
        `;
    }

    function createAdBanner(options) {
        const opts = options || {};
        const context = opts.context || {};
        return `
            <section class="iw-ad-banner" data-iw-placement="${escapeHtml(opts.placement || 'inline-banner')}">
                <div class="iw-ad-banner-copy">
                    <span class="iw-sponsored-badge">Sponsored</span>
                    <h3>${escapeHtml(opts.title || 'Recommended for you')}</h3>
                    <p>${escapeHtml(opts.description || 'Relevant insurance, loan and warranty recommendations placed for high-intent car buyers.')}</p>
                    <div class="iw-ad-banner-actions">
                        <a class="iw-affiliate-btn js-affiliate-cta" href="${escapeHtml(opts.primaryHref || pickOffer(context).href)}" data-iw-offer-id="${escapeHtml(opts.offerId || pickOffer(context).id)}" data-iw-placement="${escapeHtml(opts.placement || 'inline-banner')}" data-iw-page="${escapeHtml(context.page || '')}" target="_blank" rel="noopener sponsored">${escapeHtml(opts.primaryCta || pickOffer(context).cta)}</a>
                        <a class="iw-affiliate-link js-affiliate-cta" href="${escapeHtml(opts.secondaryHref || OFFERS.sell.href)}" data-iw-offer-id="${escapeHtml(opts.secondaryOfferId || OFFERS.sell.id)}" data-iw-placement="${escapeHtml(opts.placement || 'inline-banner')}" data-iw-page="${escapeHtml(context.page || '')}" target="_blank" rel="noopener sponsored">${escapeHtml(opts.secondaryCta || 'Sell Your Car Instantly')}</a>
                    </div>
                </div>
                ${adSenseMarkup(opts.slotKey || 'inline', opts.format || 'horizontal')}
            </section>
        `;
    }

    function createNativeAdCard(options) {
        const opts = options || {};
        const offer = opts.offer || pickOffer(opts.context || {});
        return `
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.1s">
                <article class="car-card car-card-standard iw-native-ad-card" data-iw-placement="${escapeHtml(opts.placement || 'listing-inline')}" data-iw-offer-id="${escapeHtml(offer.id)}">
                    <span class="iw-sponsored-badge">Sponsored</span>
                    <div class="car-card-img-wrapper">
                        <div class="iw-native-ad-media">
                            <i class="${escapeHtml(offer.icon)}"></i>
                            <div class="iw-native-ad-copy">${escapeHtml(offer.description)}</div>
                        </div>
                    </div>
                    <div class="car-card-body">
                        <h5 class="car-title mb-0">${escapeHtml(offer.title)}</h5>
                        <div class="car-price">${escapeHtml(offer.priceText)}</div>
                        <div class="car-specs-row">
                            <div class="car-spec-item"><i class="fas fa-badge-check text-primary"></i><span>${escapeHtml(offer.label)}</span></div>
                            <div class="car-spec-item"><i class="fas fa-sparkles text-primary"></i><span>High intent fit</span></div>
                        </div>
                        <div class="car-summary">Integrated offer placeholder designed to match listing cards without breaking scroll rhythm.</div>
                        <div class="car-card-actions">
                            <a class="iw-affiliate-btn js-affiliate-cta" href="${escapeHtml(offer.href)}" data-iw-offer-id="${escapeHtml(offer.id)}" data-iw-placement="${escapeHtml(opts.placement || 'listing-inline')}" data-iw-page="${escapeHtml(opts.context?.page || '')}" target="_blank" rel="noopener sponsored">${escapeHtml(offer.cta)}</a>
                            <a class="iw-affiliate-link js-affiliate-cta" href="${escapeHtml(OFFERS.sell.href)}" data-iw-offer-id="${escapeHtml(OFFERS.sell.id)}" data-iw-placement="${escapeHtml(opts.placement || 'listing-inline')}" data-iw-page="${escapeHtml(opts.context?.page || '')}" target="_blank" rel="noopener sponsored">View Offer</a>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }

    function createRecommendationWidget(options) {
        const opts = options || {};
        const context = opts.context || {};
        const offers = opts.offers || pickOffers(context, 3);
        return `
            <section class="iw-recommendation-widget" data-iw-placement="${escapeHtml(opts.placement || 'recommendation-widget')}">
                <div class="iw-widget-head">
                    <div>
                        <span class="iw-widget-kicker">${escapeHtml(opts.kicker || 'Recommended for you')}</span>
                        <h3>${escapeHtml(opts.title || 'Recommended for you')}</h3>
                    </div>
                    <p>${escapeHtml(opts.subtitle || 'Minimal monetization units designed to complement, not interrupt, the buying journey.')}</p>
                </div>
                <div class="iw-recommendation-grid">
                    ${offers.map((offer) => `
                        <article class="iw-recommendation-offer">
                            <span class="iw-sponsored-badge">Sponsored</span>
                            <span class="iw-recommendation-offer-icon"><i class="${escapeHtml(offer.icon)}"></i></span>
                            <h4>${escapeHtml(offer.title)}</h4>
                            <p>${escapeHtml(offer.description)}</p>
                            <div class="iw-recommendation-actions">
                                <a class="iw-affiliate-btn js-affiliate-cta" href="${escapeHtml(offer.href)}" data-iw-offer-id="${escapeHtml(offer.id)}" data-iw-placement="${escapeHtml(opts.placement || 'recommendation-widget')}" data-iw-page="${escapeHtml(context.page || '')}" target="_blank" rel="noopener sponsored">${escapeHtml(offer.cta)}</a>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    }

    function createPreFooterRevenueSection(options) {
        const opts = options || {};
        const context = opts.context || {};
        return `
            <section class="iw-prefooter-revenue-section" data-iw-placement="${escapeHtml(opts.placement || 'pre-footer')}">
                <div class="iw-prefooter-revenue-layout">
                    <div class="iw-revenue-grid">
                        <article class="iw-revenue-column">
                            <span class="iw-revenue-kicker">Recommended for you</span>
                            <h3>Check Car Insurance</h3>
                            <p>Surface relevant insurance cover and IDV-led plans for users already evaluating condition and ownership risk.</p>
                            <div class="iw-recommendation-actions">
                                <a class="iw-affiliate-btn js-affiliate-cta" href="${escapeHtml(OFFERS.insurance.href)}" data-iw-offer-id="${escapeHtml(OFFERS.insurance.id)}" data-iw-placement="${escapeHtml(opts.placement || 'pre-footer')}" data-iw-page="${escapeHtml(context.page || '')}" target="_blank" rel="noopener sponsored">Check Car Insurance</a>
                            </div>
                        </article>
                        <article class="iw-revenue-column">
                            <span class="iw-revenue-kicker">Best deals on car insurance</span>
                            <h3>Calculate EMI</h3>
                            <p>Keep budget-conscious buyers in flow with an EMI route that complements sub-₹5L and financing-led browsing behavior.</p>
                            <div class="iw-recommendation-actions">
                                <a class="iw-affiliate-btn js-affiliate-cta" href="${escapeHtml(OFFERS.loan.href)}" data-iw-offer-id="${escapeHtml(OFFERS.loan.id)}" data-iw-placement="${escapeHtml(opts.placement || 'pre-footer')}" data-iw-page="${escapeHtml(context.page || '')}" target="_blank" rel="noopener sponsored">Calculate EMI</a>
                            </div>
                        </article>
                        <article class="iw-revenue-column">
                            <span class="iw-revenue-kicker">Top loan offers</span>
                            <h3>Sell Your Car Instantly</h3>
                            <p>Capture seller intent with a clean resale CTA that fits naturally near footer navigation and browse completion moments.</p>
                            <div class="iw-recommendation-actions">
                                <a class="iw-affiliate-btn js-affiliate-cta" href="${escapeHtml(OFFERS.sell.href)}" data-iw-offer-id="${escapeHtml(OFFERS.sell.id)}" data-iw-placement="${escapeHtml(opts.placement || 'pre-footer')}" data-iw-page="${escapeHtml(context.page || '')}" target="_blank" rel="noopener sponsored">Sell Your Car Instantly</a>
                            </div>
                        </article>
                    </div>
                    ${adSenseMarkup(opts.slotKey || 'footer', 'rectangle')}
                </div>
            </section>
        `;
    }

    function createInlineRecommendation(options) {
        const opts = options || {};
        const offer = opts.offer || pickOffer(opts.context || {});
        const secondary = (opts.context && getIntent(opts.context) === 'premium') ? OFFERS.warranty : OFFERS.loan;
        return `
            <div class="iw-inline-recommendation" data-iw-placement="${escapeHtml(opts.placement || 'post-submit')}">
                <span class="iw-sponsored-badge">Sponsored</span>
                <h4>${escapeHtml(opts.title || 'Next useful step')}</h4>
                <p>${escapeHtml(opts.copy || offer.description)}</p>
                <div class="iw-recommendation-actions">
                    <a class="iw-affiliate-btn js-affiliate-cta" href="${escapeHtml(offer.href)}" data-iw-offer-id="${escapeHtml(offer.id)}" data-iw-placement="${escapeHtml(opts.placement || 'post-submit')}" data-iw-page="${escapeHtml(opts.context?.page || '')}" target="_blank" rel="noopener sponsored">${escapeHtml(offer.cta)}</a>
                    <a class="iw-affiliate-link js-affiliate-cta" href="${escapeHtml(secondary.href)}" data-iw-offer-id="${escapeHtml(secondary.id)}" data-iw-placement="${escapeHtml(opts.placement || 'post-submit')}" data-iw-page="${escapeHtml(opts.context?.page || '')}" target="_blank" rel="noopener sponsored">${escapeHtml(secondary.cta)}</a>
                </div>
            </div>
        `;
    }

    function createStickyBottomAd(options) {
        const opts = options || {};
        const offer = opts.offer || pickOffer(opts.context || {});
        return `
            <div class="iw-sticky-bottom-ad" data-iw-sticky>
                <div class="iw-sticky-inner">
                    <div class="iw-sticky-copy">
                        <strong>${escapeHtml(offer.title)}</strong>
                        <span>${escapeHtml(offer.description)}</span>
                    </div>
                    <div class="iw-sticky-actions">
                        <a class="iw-affiliate-btn js-affiliate-cta" href="${escapeHtml(offer.href)}" data-iw-offer-id="${escapeHtml(offer.id)}" data-iw-placement="sticky-bottom" data-iw-page="${escapeHtml(opts.context?.page || '')}" target="_blank" rel="noopener sponsored">${escapeHtml(offer.cta)}</a>
                        <button type="button" class="iw-sticky-dismiss" aria-label="Dismiss sponsored offer">×</button>
                    </div>
                </div>
            </div>
        `;
    }

    function hydrate(scope) {
        bindInteractions(scope || document);
        initLazyAds(scope || document);
    }

    function bindInteractions(scope) {
        if (interactionBound) return;
        document.addEventListener('click', function (event) {
            const affiliateLink = event.target.closest('.js-affiliate-cta');
            if (affiliateLink) {
                trackClick({
                    offerId: affiliateLink.dataset.iwOfferId,
                    placement: affiliateLink.dataset.iwPlacement,
                    page: affiliateLink.dataset.iwPage || document.body?.className || 'website'
                });
                return;
            }

            const dismissBtn = event.target.closest('.iw-sticky-dismiss');
            if (dismissBtn) {
                const sticky = dismissBtn.closest('[data-iw-sticky]');
                if (sticky) {
                    sticky.classList.remove('is-visible');
                    sessionStorage.setItem('iw:sticky-dismissed', '1');
                }
            }
        });
        interactionBound = true;
    }

    function initLazyAds(scope) {
        const root = scope || document;
        const slots = root.querySelectorAll('ins.adsbygoogle:not([data-iw-init])');
        if (!slots.length) return;

        if (!observer && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    pushAd(entry.target);
                    observer.unobserve(entry.target);
                });
            }, { rootMargin: '160px 0px' });
        }

        slots.forEach((slot) => {
            slot.dataset.iwInit = '1';
            if (observer) {
                observer.observe(slot);
            } else {
                pushAd(slot);
            }
        });
    }

    function pushAd(slot) {
        if (!slot || slot.dataset.iwLoaded === '1') return;
        slot.dataset.iwLoaded = '1';
        try {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
        } catch (error) {
            console.debug('[IW Monetization] adsense placeholder not initialized yet', error);
        }
    }

    function mountStickyBottomAd(options) {
        if (window.innerWidth > 767) return;
        if (sessionStorage.getItem('iw:sticky-dismissed') === '1') return;
        const existing = document.querySelector('[data-iw-sticky]');
        if (existing) {
            existing.classList.add('is-visible');
            return;
        }
        const wrapper = document.createElement('div');
        wrapper.innerHTML = createStickyBottomAd(options);
        const sticky = wrapper.firstElementChild;
        if (!sticky) return;
        document.body.appendChild(sticky);
        sticky.classList.add('is-visible');
        hydrate(sticky);
    }

    window.IWMonetization = {
        config: CONFIG,
        offers: OFFERS,
        trackClick,
        trackConversion,
        pickOffer,
        pickOffers,
        getIntent,
        createAdBanner,
        createNativeAdCard,
        createRecommendationWidget,
        createPreFooterRevenueSection,
        createInlineRecommendation,
        createStickyBottomAd,
        mountStickyBottomAd,
        hydrate
    };

    document.addEventListener('DOMContentLoaded', function () {
        hydrate(document);
    });
})();