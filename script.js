// Initialize menu interactions and animations
document.addEventListener('DOMContentLoaded', () => {
    // Copy page title into background title (large watermark behind header)
    document.querySelectorAll('.page-header').forEach(header => {
        const title = header.querySelector('.page-title');
        const bg = header.querySelector('.page-title-bg');
        if (title && bg) bg.textContent = title.textContent;
    });

    // PinHaus screenshot carousel – left (prev), center (main), right (next); swipe on center
    document.querySelectorAll('.pinhaus-carousel').forEach(carousel => {
        const leftStack = carousel.querySelector('.pinhaus-carousel-left .pinhaus-carousel-stack');
        const centerStack = carousel.querySelector('.pinhaus-carousel-center .pinhaus-carousel-stack');
        const rightStack = carousel.querySelector('.pinhaus-carousel-right .pinhaus-carousel-stack');
        if (!centerStack) return;
        const total = centerStack.querySelectorAll('.pinhaus-carousel-slide').length;
        let index = 0;
        let animating = false;
        function setActiveInStack(stack, i) {
            if (!stack) return;
            const slides = stack.querySelectorAll('.pinhaus-carousel-slide');
            const idx = ((i % total) + total) % total;
            slides.forEach((slide) => {
                slide.classList.toggle('active', parseInt(slide.dataset.index, 10) === idx);
            });
        }
        function getCenterSlide(idx) {
            return centerStack.querySelector(`.pinhaus-carousel-slide[data-index="${((idx % total) + total) % total}"]`);
        }
        function goTo(i) {
            const nextIndex = ((i % total) + total) % total;
            setActiveInStack(leftStack, nextIndex - 1);
            setActiveInStack(rightStack, nextIndex + 1);
            if (nextIndex === index) {
                setActiveInStack(centerStack, index);
                return;
            }
            const delta = (nextIndex - index + total) % total;
            const goingNext = delta === 1;

            const currentSlide = getCenterSlide(index);
            const newSlide = getCenterSlide(nextIndex);
            if (!currentSlide || !newSlide || animating) {
                index = nextIndex;
                setActiveInStack(centerStack, index);
                return;
            }
            animating = true;
            currentSlide.classList.add(goingNext ? 'swipe-out-left' : 'swipe-out-right');
            newSlide.classList.add('active');
            const onTransitionEnd = (e) => {
                if (e.propertyName === 'transform') {
                    currentSlide.classList.remove('active');
                    return;
                }
                if (e.propertyName === 'opacity') {
                    currentSlide.classList.remove('swipe-out-left', 'swipe-out-right');
                    currentSlide.removeEventListener('transitionend', onTransitionEnd);
                    animating = false;
                }
            };
            currentSlide.addEventListener('transitionend', onTransitionEnd);
            index = nextIndex;
        }
        goTo(0);
        carousel.querySelectorAll('.pinhaus-carousel-prev').forEach(btn => btn.addEventListener('click', () => goTo(index - 1)));
        carousel.querySelectorAll('.pinhaus-carousel-next').forEach(btn => btn.addEventListener('click', () => goTo(index + 1)));
        const centerPeek = carousel.querySelector('.pinhaus-carousel-center');
        if (centerPeek) {
            centerPeek.addEventListener('click', (e) => {
                const rect = centerPeek.getBoundingClientRect();
                const mid = rect.left + rect.width / 2;
                if (e.clientX >= mid) goTo(index + 1);
                else goTo(index - 1);
            });
        }
    });

    // Set data-text attribute on menu text elements for shadow effect
    const menuTexts = document.querySelectorAll('.menu-text');
    menuTexts.forEach(text => {
        text.setAttribute('data-text', text.textContent);
    });
    
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Calculate line height and position for split line animation
    // Line should go from bottom of viewport (0) to top of image container
    function calculateLineHeights() {
        menuItems.forEach(item => {
            const menuType = item.dataset.menu;
            const imageContainer = item.querySelector('.menu-hover-image-container');
            if (imageContainer) {
                // Get position of image container relative to viewport
                const rect = imageContainer.getBoundingClientRect();
                // Line height = distance from bottom of viewport (window.innerHeight) to top of image (rect.top)
                // This ensures line starts at absolute bottom of webpage
                const lineHeight = window.innerHeight - rect.top;
                
                // Get center X position of the menu item for line positioning
                const itemRect = item.getBoundingClientRect();
                const centerX = itemRect.left + (itemRect.width / 2);
                
                // Set CSS variables on both the menu item and the corresponding split lines
                item.style.setProperty('--line-height', `${lineHeight}px`);
                const splitLines = document.querySelectorAll(`.split-line[data-menu-item="${menuType}"]`);
                splitLines.forEach(line => {
                    line.style.setProperty('--line-height', `${lineHeight}px`);
                    line.style.setProperty('--center-x', `${centerX}px`);
                });
            }
        });
    }
    
    // Calculate initially and on window resize
    calculateLineHeights();
    window.addEventListener('resize', calculateLineHeights);
    
    // Also recalculate when menu items are hovered (in case of layout shifts)
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            setTimeout(calculateLineHeights, 10);
        });
    });
    const transitionOverlay = document.querySelector('.transition-overlay');
    const homeView = document.getElementById('home-view');
    const contentPages = document.querySelectorAll('.content-page');
    const websitesPage = document.getElementById('websites-page');
    const isFileProtocol = window.location.protocol === 'file:';
    let websitesPageController = null;
    let artGeneratorLoadPromise = null;

    function ensureArtGeneratorLoaded() {
        if (artGeneratorLoadPromise) return artGeneratorLoadPromise;
        artGeneratorLoadPromise = new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="art-generator-full.js"]')) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'art-generator-full.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load art generator'));
            document.body.appendChild(script);
        });
        return artGeneratorLoadPromise;
    }

    function getPageIdForMenu(menuType) {
        if (menuType === 'web-development') return 'websites-page';
        return `${menuType}-page`;
    }

    function resolveRouteFromLocation() {
        if (isFileProtocol) {
            const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
            if (hash === 'websites' || hash.startsWith('websites/')) return 'websites';
            return 'home';
        }
        const search = window.location.search;
        if (search && search.length > 2) {
            const ghMatch = search.match(/^\?\/?(.+)$/);
            if (ghMatch) {
                const ghSegment = ghMatch[1].replace(/~and~/g, '&').replace(/^\/+|\/+$/g, '');
                if (ghSegment === 'websites') return 'websites';
            }
        }
        const segments = window.location.pathname.split('/').filter(Boolean);
        if (segments[segments.length - 1] === 'websites') return 'websites';
        return 'home';
    }

    function getHistoryUrlForRoute(route) {
        if (isFileProtocol) {
            if (route === 'websites') return '#/websites';
            return window.location.pathname + window.location.search;
        }
        return route === 'websites' ? '/websites/' : '/';
    }

    function syncHistoryForRoute(route, replace = false) {
        const url = getHistoryUrlForRoute(route);
        const method = replace ? 'replaceState' : 'pushState';
        history[method]({ route }, '', url);
    }

    function unloadWebsitesVideos() {
        if (!websitesPage) return;
        websitesPage.querySelectorAll('.website-video').forEach(video => {
            video.pause();
            video.classList.remove('is-playing');
            video.removeAttribute('src');
            video.load();
        });
    }

    function deactivateWebsitesRows() {
        websitesPageController?.deactivateAll();
    }

    function scrollPageToTop(page) {
        if (!page) return;
        window.scrollTo(0, 0);
        page.scrollTop = 0;
        const wrapper = page.querySelector('.page-scroll-wrapper');
        if (wrapper) wrapper.scrollTop = 0;
    }

    function setWebsitesVisible(isVisible) {
        document.body.classList.toggle('websites-visible', isVisible);
        if (isVisible) {
            requestAnimationFrame(() => {
                websitesPageController?.refreshInView?.();
                setTimeout(() => websitesPageController?.refreshInView?.(), 150);
            });
        } else {
            deactivateWebsitesRows();
            unloadWebsitesVideos();
        }
    }

    function showContentPageById(pageId, options = {}) {
        const { animate = true } = options;
        const targetPage = document.getElementById(pageId);
        if (!targetPage) return;

        const reveal = () => {
            contentPages.forEach(page => page.classList.remove('active'));
            homeView.classList.add('hidden');
            targetPage.classList.add('active');
            if (pageId === 'app-designer-page') {
                ensureArtGeneratorLoaded().catch(() => {});
            }
            setWebsitesVisible(pageId === 'websites-page');
            updateHomeBodyClass();
            scrollPageToTop(targetPage);
            requestAnimationFrame(() => scrollPageToTop(targetPage));
            setTimeout(() => scrollPageToTop(targetPage), 0);
            setTimeout(() => scrollPageToTop(targetPage), 100);
            setTimeout(() => scrollPageToTop(targetPage), 350);
        };

        if (!animate) {
            reveal();
            return;
        }

        transitionOverlay.classList.add('active');
        setTimeout(() => {
            reveal();
            setTimeout(() => transitionOverlay.classList.remove('active'), 300);
        }, 200);
    }

    function showHome(options = {}) {
        const { animate = true } = options;
        const reveal = () => {
            contentPages.forEach(page => page.classList.remove('active'));
            homeView.classList.remove('hidden');
            setWebsitesVisible(false);
            updateHomeBodyClass();
            window.scrollTo(0, 0);
        };

        if (!animate) {
            reveal();
            return;
        }

        transitionOverlay.classList.add('active');
        setTimeout(() => {
            reveal();
            setTimeout(() => transitionOverlay.classList.remove('active'), 300);
        }, 200);
    }

    function navigateToRoute(route, options = {}) {
        const { replace = false, animate = true, fromPopstate = false } = options;

        if (route === 'websites') {
            showContentPageById('websites-page', { animate });
        } else if (route === 'home') {
            showHome({ animate });
        } else {
            showContentPageById(`${route}-page`, { animate });
        }

        if (!fromPopstate) {
            syncHistoryForRoute(route, replace);
        }
    }

    function handlePopstate() {
        const route = resolveRouteFromLocation();
        if (route === 'websites') {
            showContentPageById('websites-page', { animate: false });
        } else if (document.querySelector('.content-page.active') && route === 'home') {
            showHome({ animate: false });
        }
    }

    window.addEventListener('popstate', handlePopstate);

    if (isFileProtocol) {
        window.addEventListener('hashchange', () => {
            const route = resolveRouteFromLocation();
            if (route === 'websites') {
                showContentPageById('websites-page', { animate: false });
            } else if (route === 'home') {
                showHome({ animate: false });
            }
        });
    }

    // GitHub Pages SPA redirect (?/websites/)
    (function handleGhPagesRedirect() {
        if (isFileProtocol) return;
        const search = window.location.search;
        if (!search || search.length < 3) return;
        const ghMatch = search.match(/^\?\/?(.+)$/);
        if (!ghMatch) return;
        let cleanPath = '/' + ghMatch[1].replace(/~and~/g, '&').replace(/^\/+/, '');
        if (!cleanPath.endsWith('/')) cleanPath += '/';
        history.replaceState({ route: resolveRouteFromLocation() }, '', cleanPath);
    })();

    function initWebsitesPage() {
        if (!websitesPage) return;

        function resolveAssetUrl(path) {
            if (!path || /^(https?:|data:|blob:)/.test(path)) return path;
            try {
                return new URL(path, document.baseURI).href;
            } catch (_) {
                return path;
            }
        }

        const rows = Array.from(websitesPage.querySelectorAll('.website-row'));
        let activeRow = null;
        let inViewObserver = null;
        let hoverLeaveTimer = null;
        let prefersHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        rows.forEach(row => {
            const details = row.querySelector('.website-details');
            if (details) details.setAttribute('aria-hidden', prefersHover ? 'true' : 'false');
            const video = row.querySelector('.website-video');
            if (video) {
                const poster = video.getAttribute('poster');
                if (poster) video.setAttribute('poster', resolveAssetUrl(poster));
                video.muted = true;
                video.defaultMuted = true;
                video.playsInline = true;
                video.setAttribute('muted', '');
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
            }
        });

        function attemptVideoPlay(video) {
            if (!video) return Promise.resolve(false);
            const playPromise = video.play();
            if (!playPromise || typeof playPromise.then !== 'function') {
                video.classList.add('is-playing');
                return Promise.resolve(true);
            }
            return playPromise
                .then(() => {
                    video.classList.add('is-playing');
                    return true;
                })
                .catch(() => {
                    video.classList.remove('is-playing');
                    return false;
                });
        }

        function loadAndPlay(row) {
            const video = row.querySelector('.website-video');
            if (!video) return;

            const dataSrc = video.getAttribute('data-src');
            if (dataSrc && !video.getAttribute('src')) {
                video.src = resolveAssetUrl(dataSrc);
                video.load();
            }

            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                attemptVideoPlay(video);
                return;
            }

            const onReady = () => {
                video.removeEventListener('loadeddata', onReady);
                video.removeEventListener('canplay', onReady);
                attemptVideoPlay(video);
            };
            video.addEventListener('loadeddata', onReady, { once: true });
            video.addEventListener('canplay', onReady, { once: true });
        }

        function pauseVideo(row) {
            const video = row.querySelector('.website-video');
            if (!video) return;
            video.pause();
            video.classList.remove('is-playing');
            if (video.getAttribute('src')) {
                video.currentTime = 0;
            }
        }

        function updateDetailsA11y(row, expanded) {
            const details = row.querySelector('.website-details');
            if (!details) return;
            if (!prefersHover) {
                details.setAttribute('aria-hidden', 'false');
                return;
            }
            details.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        }

        function setActiveRow(row) {
            if (!row || activeRow === row) return;
            clearTimeout(hoverLeaveTimer);
            if (activeRow) {
                activeRow.classList.remove('is-active');
                updateDetailsA11y(activeRow, false);
                pauseVideo(activeRow);
            }
            activeRow = row;
            row.classList.add('is-active');
            updateDetailsA11y(row, true);
            loadAndPlay(row);
        }

        function clearActiveRow(row) {
            if (!row || activeRow !== row) return;
            row.classList.remove('is-active');
            updateDetailsA11y(row, false);
            pauseVideo(row);
            activeRow = null;
        }

        function deactivateAll() {
            clearTimeout(hoverLeaveTimer);
            if (activeRow) {
                activeRow.classList.remove('is-active');
                updateDetailsA11y(activeRow, false);
                pauseVideo(activeRow);
                activeRow = null;
            }
        }

        let scrollScanRaf = null;

        function scanMostVisibleRow() {
            if (prefersHover || !websitesPage.classList.contains('active')) return;
            const pageRect = websitesPage.getBoundingClientRect();
            let bestRow = null;
            let bestRatio = 0;
            rows.forEach(row => {
                const rect = row.getBoundingClientRect();
                const visibleTop = Math.max(rect.top, pageRect.top);
                const visibleBottom = Math.min(rect.bottom, pageRect.bottom);
                const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                const ratio = rect.height > 0 ? visibleHeight / rect.height : 0;
                if (ratio > bestRatio) {
                    bestRatio = ratio;
                    bestRow = row;
                }
            });
            if (bestRow && bestRatio >= 0.2) {
                setActiveRow(bestRow);
            }
        }

        function scheduleScrollScan() {
            if (prefersHover) return;
            cancelAnimationFrame(scrollScanRaf);
            scrollScanRaf = requestAnimationFrame(scanMostVisibleRow);
        }

        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                if (!prefersHover) return;
                clearTimeout(hoverLeaveTimer);
                setActiveRow(row);
            });
            row.addEventListener('mouseleave', () => {
                if (!prefersHover) return;
                hoverLeaveTimer = setTimeout(() => clearActiveRow(row), 60);
            });

            row.addEventListener('focusin', () => {
                if (prefersHover) setActiveRow(row);
            });
            row.addEventListener('focusout', (e) => {
                if (!prefersHover || !row.contains(e.relatedTarget)) {
                    clearActiveRow(row);
                }
            });

            const video = row.querySelector('.website-video');
            if (video) {
                video.addEventListener('click', (e) => {
                    if (prefersHover) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveRow(row);
                    loadAndPlay(row);
                });
            }
        });

        websitesPage.addEventListener('scroll', scheduleScrollScan, { passive: true });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden || !websitesPage.classList.contains('active') || prefersHover) return;
            if (activeRow) loadAndPlay(activeRow);
            else scheduleScrollScan();
        });

        function setupInViewObserver() {
            if (inViewObserver) inViewObserver.disconnect();

            const touchOptions = {
                root: websitesPage,
                threshold: [0, 0.15, 0.3, 0.5],
                rootMargin: '0px 0px -5% 0px'
            };
            const hoverOptions = {
                root: websitesPage,
                threshold: [0.35, 0.5, 0.65],
                rootMargin: '-8% 0px -8% 0px'
            };

            inViewObserver = new IntersectionObserver((entries) => {
                const visible = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length > 0) {
                    setActiveRow(visible[0].target);
                }
            }, prefersHover ? hoverOptions : touchOptions);

            rows.forEach(row => inViewObserver.observe(row));
        }

        function syncWebsitesInteractionMode() {
            const wasHover = prefersHover;
            prefersHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

            if (!prefersHover) {
                rows.forEach(row => {
                    const details = row.querySelector('.website-details');
                    if (details) details.setAttribute('aria-hidden', 'false');
                });
                setupInViewObserver();
                requestAnimationFrame(() => {
                    scheduleScrollScan();
                    setTimeout(scheduleScrollScan, 100);
                });
                return;
            }

            if (inViewObserver) {
                inViewObserver.disconnect();
                inViewObserver = null;
            }

            if (!wasHover) {
                deactivateAll();
                rows.forEach(row => {
                    const details = row.querySelector('.website-details');
                    if (details) details.setAttribute('aria-hidden', 'true');
                });
            }
        }

        websitesPageController = {
            deactivateAll,
            refreshInView: scheduleScrollScan
        };

        syncWebsitesInteractionMode();
        window.addEventListener('resize', syncWebsitesInteractionMode);

        const websitesHomeBtn = websitesPage.querySelector('.websites-home');
        if (websitesHomeBtn) {
            websitesHomeBtn.addEventListener('click', () => navigateToRoute('home'));
        }
    }

    initWebsitesPage();

    const initialRoute = resolveRouteFromLocation();
    if (initialRoute === 'websites') {
        showContentPageById('websites-page', { animate: false });
        syncHistoryForRoute('websites', true);
    }

    function updateHomeBodyClass() {
        if (homeView.classList.contains('hidden')) {
            document.body.classList.remove('home-visible');
        } else {
            document.body.classList.add('home-visible');
        }
    }
    updateHomeBodyClass();
    const backButtons = document.querySelectorAll('.back-button');
    
    menuItems.forEach(item => {
        const menuType = item.dataset.menu;
        const splitLines = document.querySelectorAll(`.split-line[data-menu-item="${menuType}"]`);
        
        // Hover effects
        item.addEventListener('mouseenter', () => {
            menuItems.forEach(menu => menu.classList.remove('active'));
            item.classList.add('active');
            // Show corresponding split lines
            splitLines.forEach(line => line.classList.add('active'));
        });
        
        item.addEventListener('mouseleave', () => {
            item.classList.remove('active');
            // Hide corresponding split lines
            splitLines.forEach(line => line.classList.remove('active'));
        });
        
        // Click handler with animation
        item.addEventListener('click', function(e) {
            const menuType = this.dataset.menu;
            // Art Page: navigate explicitly so nothing can block the link (race, CSP, or host quirk)
            if (menuType === 'art-page') {
                e.preventDefault();
                window.location.href = this.getAttribute('href') || 'art/';
                return;
            }
            e.preventDefault();
            
            // Add selecting animation
            this.classList.add('selecting');
            
            // Play transition animation
            setTimeout(() => {
                transitionOverlay.classList.add('active');
                
                setTimeout(() => {
                    // Hide home view
                    homeView.classList.add('hidden');
                    updateHomeBodyClass();
                    contentPages.forEach(page => page.classList.remove('active'));

                    // Show selected content page
                    const pageId = getPageIdForMenu(menuType);
                    const targetPage = document.getElementById(pageId);
                    if (targetPage) {
                        if (menuType === 'web-development') {
                            setWebsitesVisible(true);
                            syncHistoryForRoute('websites');
                        } else {
                            setWebsitesVisible(false);
                        }
                        targetPage.classList.add('active');
                        function scrollActiveToTop() {
                            window.scrollTo(0, 0);
                            targetPage.scrollTop = 0;
                            var w = targetPage.querySelector('.page-scroll-wrapper');
                            if (w) w.scrollTop = 0;
                        }
                        scrollActiveToTop();
                        requestAnimationFrame(scrollActiveToTop);
                        setTimeout(scrollActiveToTop, 0);
                        setTimeout(scrollActiveToTop, 100);
                        setTimeout(scrollActiveToTop, 350);
                    }
                    
                    // Remove transition overlay
                    setTimeout(() => {
                        transitionOverlay.classList.remove('active');
                        // Reset menu items
                        menuItems.forEach(menuItem => {
                            menuItem.classList.remove('selecting', 'active');
                        });
                    }, 300);
                }, 200);
            }, 400);
        });
    });
    
    // Navigation handlers for top nav
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(navItem => {
        navItem.addEventListener('click', () => {
            const navTarget = navItem.dataset.nav;

            if (navTarget === 'home') {
                const currentPage = document.querySelector('.content-page.active');
                if (currentPage) {
                    navigateToRoute('home');
                }
            } else {
                const currentPage = document.querySelector('.content-page.active');
                const targetPage = document.getElementById(`${navTarget}-page`);
                if (targetPage && targetPage !== currentPage) {
                    document.body.classList.add('nav-page-switch');
                    if (currentPage) {
                        currentPage.classList.remove('active');
                    }
                    homeView.classList.add('hidden');
                    setWebsitesVisible(false);
                    updateHomeBodyClass();
                    targetPage.classList.add('active');

                    /* Mobile: scroll to top — content-page is the scroll container; re-run with delays to beat browser scroll restore */
                    function scrollPageToTop(page) {
                        if (!page) return;
                        window.scrollTo(0, 0);
                        page.scrollTop = 0;
                        var w = page.querySelector('.page-scroll-wrapper');
                        if (w) w.scrollTop = 0;
                    }
                    scrollPageToTop(targetPage);
                    requestAnimationFrame(function () { scrollPageToTop(targetPage); });
                    setTimeout(function () { scrollPageToTop(targetPage); }, 0);
                    setTimeout(function () { scrollPageToTop(targetPage); }, 100);
                    setTimeout(function () { scrollPageToTop(targetPage); }, 350);

                    /* Play click animation on the now-visible page’s nav item */
                    const activeNavItem = targetPage.querySelector(`.nav-item[data-nav="${navTarget}"]`);
                    if (activeNavItem) {
                        activeNavItem.classList.add('nav-selecting');
                        activeNavItem.addEventListener('animationend', function removeSelecting() {
                            activeNavItem.classList.remove('nav-selecting');
                            activeNavItem.removeEventListener('animationend', removeSelecting);
                        }, { once: true });
                    }

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            document.body.classList.remove('nav-page-switch');
                        });
                    });
                }
            }
        });
    });
    
    // Back button handlers (keeping for compatibility)
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentPage = button.closest('.content-page');
            if (currentPage) {
                // Start transition
                transitionOverlay.classList.add('active');
                
                setTimeout(() => {
                    // Hide current page
                    currentPage.classList.remove('active');
                    
                    // Show home view
                    homeView.classList.remove('hidden');
                    updateHomeBodyClass();
                    // Remove transition overlay
                    setTimeout(() => {
                        transitionOverlay.classList.remove('active');
                    }, 300);
                }, 200);
            }
        });
    });
    
    // Keyboard navigation
    let currentMenuIndex = -1;
    
    document.addEventListener('keydown', (e) => {
        // Don't handle keyboard nav if on content page
        const activePage = document.querySelector('.content-page.active');
        if (activePage) {
            if (e.key === 'Escape') {
                if (activePage.id === 'websites-page') {
                    navigateToRoute('home');
                    return;
                }
                const backBtn = activePage.querySelector('.back-button');
                if (backBtn) backBtn.click();
            }
            return;
        }
        
        if (transitionOverlay.classList.contains('active') || homeView.classList.contains('hidden')) return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentMenuIndex = (currentMenuIndex + 1) % menuItems.length;
                updateMenuSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentMenuIndex = currentMenuIndex <= 0 ? menuItems.length - 1 : currentMenuIndex - 1;
                updateMenuSelection();
                break;
            case 'Enter':
            case ' ':
                if (currentMenuIndex >= 0) {
                    e.preventDefault();
                    menuItems[currentMenuIndex].click();
                }
                break;
        }
    });
    
    function updateMenuSelection() {
        menuItems.forEach((item, index) => {
            if (index === currentMenuIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Manual gear positioning - Edit these values to position gears manually
    // Format: { x: pixels, y: pixels, width: pixels, height: pixels }
    const MANUAL_GEAR_POSITIONS = {
        gear1: { x: 20, y: 155, width: 70, height: 70 },
        gear2: { x: 17, y: 127, width: 45, height: 45 },
        gear3: { x: 8, y: 150, width: 30, height: 30 },
        gear4: { x: 292, y: 176, width: 25, height: 25 },
        gear5: { x: 273, y: 173, width: 30, height: 30 },
    };
    
    // Position gears using only manual positions (desktop hover only)
    function positionGearsManually() {
        if (window.matchMedia('(max-width: 768px)').matches) return;
        const gearFiles = ['gear 1.png', 'gear 2.png', 'gear 3.png', 'gear 4.png', 'gear 5.png'];
        const sizeScale = 1 / 1.5; // 1.5x smaller = divide by 1.5 (approximately 0.667)
        
        // Set container size (adjust as needed)
        const containers = document.querySelectorAll('.menu-gears-container');
        containers.forEach(container => {
            container.style.width = '330px';
            container.style.height = '330px';
            container.style.setProperty('--gear-scale', 1);
        });
        
        gearFiles.forEach((gearFile, gearIndex) => {
            const gearImg = new Image();
            const gearNumber = gearIndex + 1;
            const manualKey = `gear${gearNumber}`;
            const manualPos = MANUAL_GEAR_POSITIONS[manualKey];
            
            gearImg.onload = function() {
                const gearWidth = gearImg.naturalWidth;
                const gearHeight = gearImg.naturalHeight;
                
                // Position all instances of this gear
                const allGears = document.querySelectorAll(`.gear-${gearNumber}`);
                
                if (manualPos) {
                    // Use manual positioning with size scaling
                    allGears.forEach(gear => {
                        gear.style.left = `${manualPos.x}px`;
                        gear.style.top = `${manualPos.y}px`; // Use y position directly from manual positions
                        gear.style.transform = ''; // Clear any transforms
                        const scaledWidth = (manualPos.width || gearWidth) * sizeScale;
                        const scaledHeight = (manualPos.height || gearHeight) * sizeScale;
                        gear.style.width = `${scaledWidth}px`;
                        gear.style.height = `${scaledHeight}px`;
                    });
                    console.log(`Gear ${gearNumber}: Positioned at (${manualPos.x}, ${manualPos.y}) with size ${((manualPos.width || gearWidth) * sizeScale).toFixed(0)}x${((manualPos.height || gearHeight) * sizeScale).toFixed(0)}`);
                } else {
                    // Default to center if no manual position
                    allGears.forEach(gear => {
                        gear.style.left = '50%';
                        gear.style.top = '50%';
                        gear.style.transform = 'translate(-50%, -50%)';
                        gear.style.width = `${gearWidth * sizeScale}px`;
                        gear.style.height = `${gearHeight * sizeScale}px`;
                    });
                    console.log(`Gear ${gearNumber}: No manual position set, using default center`);
                }
            };
            
            gearImg.onerror = function() {
                console.error(`Failed to load ${gearFile}`);
            };
            
            gearImg.src = gearFile;
        });
    }
    
    // Function to update gear positions (call this after changing MANUAL_GEAR_POSITIONS)
    window.updateGearPositions = function() {
        console.log('Updating gear positions...');
        positionGearsManually();
    };
    
    // Initialize gear positioning when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', positionGearsManually);
    } else {
        // Wait a bit for images to be available
        setTimeout(positionGearsManually, 100);
    }
    
    // Handle subcategory clicks on content pages
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => {
        item.addEventListener('click', function() {
            const subcategory = this.dataset.subcategory;
            const contentPage = this.closest('.content-page');
            
            if (!contentPage || !subcategory) return;
            
            // Remove active class from all list items in the entire left panel
            const leftPanel = this.closest('.page-left-panel');
            if (leftPanel) {
                leftPanel.querySelectorAll('.list-item').forEach(li => {
                    li.classList.remove('active');
                    li.querySelector('.item-icon').textContent = '○';
                });
            }
            
            // Add active class to clicked item
            this.classList.add('active');
            this.querySelector('.item-icon').textContent = '●';
            
            // Hide all content sections
            const contentDisplay = contentPage.querySelector('.content-display');
            if (contentDisplay) {
                // Unload creative coding iframes in sections we're leaving (stops animations, saves performance)
                contentDisplay.querySelectorAll('.subcategory-content.active .embed-cc-iframe').forEach(iframe => {
                    if (iframe.src && !iframe.src.startsWith('about:')) {
                        iframe.src = 'about:blank';
                    }
                });
                contentDisplay.querySelectorAll('.subcategory-content').forEach(content => {
                    content.classList.remove('active');
                });
                // Show the corresponding content
                const targetContent = contentDisplay.querySelector(`[data-content="${subcategory}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    // Lazy-load creative coding iframes only when their section is opened
                    targetContent.querySelectorAll('.embed-cc-iframe[data-src]').forEach(iframe => {
                        const dataSrc = iframe.getAttribute('data-src');
                        if (dataSrc) {
                            iframe.src = dataSrc;
                        }
                    });
                }
            }
            // Show corresponding right-panel Skills & Tools for this subcategory
            const rightPanel = contentPage.querySelector('.page-right-panel');
            if (rightPanel) {
                rightPanel.querySelectorAll('.right-panel-content').forEach(block => {
                    block.classList.toggle('active', block.dataset.content === subcategory);
                });
            }
            // Update center panel header to selected list item name
            const centerPanelHeader = contentPage.querySelector('.details-panel-header');
            const itemNameEl = this.querySelector('.item-name');
            if (centerPanelHeader && itemNameEl) {
                centerPanelHeader.textContent = itemNameEl.textContent.trim();
            }
        });
    });
    // Set initial details panel header from active list item on each content page
    document.querySelectorAll('.content-page').forEach(contentPage => {
        const activeItem = contentPage.querySelector('.page-left-panel .list-item.active .item-name');
        const centerPanelHeader = contentPage.querySelector('.details-panel-header');
        if (centerPanelHeader && activeItem) {
            centerPanelHeader.textContent = activeItem.textContent.trim();
        }
    });

    // Contact form: send via Formspree (no new tab; email goes to your Gmail)
    const contactForm = document.getElementById('contact-form');
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaqdwarn';
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = contactForm.querySelector('input[name="email"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');
            const submitBtn = contactForm.querySelector('.contact-send-btn');
            const email = (emailInput && emailInput.value.trim()) || '';
            const message = (messageInput && messageInput.value.trim()) || '';
            if (!email || !message) {
                if (emailInput) emailInput.reportValidity();
                return;
            }
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
            try {
                const res = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        _subject: 'Portfolio contact',
                        _replyto: email,
                        email,
                        message
                    })
                });
                if (res.ok) {
                    submitBtn.textContent = 'Sent!';
                    contactForm.reset();
                    setTimeout(() => {
                        submitBtn.textContent = originalBtnText;
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    submitBtn.textContent = 'Try again';
                    submitBtn.disabled = false;
                }
            } catch (err) {
                submitBtn.textContent = 'Try again';
                submitBtn.disabled = false;
            }
        });
    }

    // Click-to-spawn ASCII art ripple (home page only)
    const ASCII_ART_RAW =
`                                                                                                                       
                                                           .                                                           
                                                           =                                                           
                                                           +                                                           
                                                           +.                                                          
                                                         -:-:-                                                         
                                                         :-+-:.                                                        
                                                         :-:-:                                                         
                                                          +.+                                                          
                                                         =-=-+                                                         
                                                         :=*=:                                                         
                                                        ::-+-:-                                                        
                                                        :=:::=:                                                        
                                                       -. : :  -                                                       
                                                      :::= : =:::                                                      
                                                       =+     +=                                                       
                                                .     -+.  -. .+-     .                                                
                                               ..   :+-   +++   :+-   ..                                               
                                                 .:-     := =-     -:.                                                 
                                                         +   +                                                         
                                                   :    -     -    :                                                   
                                                  :+.- :       : -.=-                                                  
                                                 ..-:             :-..                                                 
                                                 .. .             .  :                                                 
                                      :.       ..  .-:.++-   -++.:-.  ..       .:                                      
                                       ..               :=+-+=:                .                                       
                                             .:.  :=-==   :+:   ==-=:  .::                                             
                                            =.       -==  -=-  ==-.      .=                                            
                                         --.          .+.- = -.+:          .--                                         
                                  .     .-    --:     -=-: + .-=-     .--    -.     .                                  
                  ..         -=+-    .    .     -.: .=...  -. ...=. :.-     .    .    -+=-         .:                  
               :: :.   --=+=-.:      :: :+=.      .::.-.. .=. ..-.::.      .-+: ::      :.-=++--    : ::               
    ...::=+*******+-==+++.     .:-=*+=-:   +*==::     .-=--+=-=-.     ::==*+.  .-=+*=-:.     .+++===+*******+=::...    
               :: :. . --++=:.:      :: :+=.      .::.-.. .=. .:-.:-.      .=+: ::      :.:=++-- . .: ::               
                  ..         ==+-   ..    .     -.: .= ..  -. .. =. : -     .    ..   -+==.        .:                  
                                 ..     .-    --:     -=-. +..-=-     :--    -.     ..                                 
                                         --.          .+.- = -.+:           --                                         
                                            =.       -==  -=-. ==-       .=                                            
                                             ::.  :=-==   :+:   ==-=:  .::                                             
                                       ..               :-+-+-:                .                                       
                                      :        ..  .-:.++-   -++.:-.  ..       .:                                      
                                                 :  .             .  :                                                 
                                                 ..-:             :-..                                                 
                                                  :=.- :       : -.=-                                                  
                                                   :    -     -    :                                                   
                                                         +   +                                                         
                                                 .:-     := =-     -:.                                                 
                                                .   -+:   +++   :+-   ..                                               
                                                .     -=. .-. .=-     .                                                
                                                       =+     +=                                                       
                                              .       :::= : =:::                                                      
                                                       -. : :  -                                                       
                                                        :=:::=:                                                        
                                                        ::-+-:-                                                        
                                                         :=*+:                                                         
                                                         =-+-+                                                         
                                                          +.=                                                          
                                                         :-:-:                                                         
                                                         :-+-:.                                                        
                                                         -:-:-                                                         
                                                           +.                                                          
                                                           +                                                           
                                                           =                                                           
                                                           .                                                           
                                                                                                                       `;

    // Pre-render ASCII into template (one-time)
    const templateEl = document.getElementById('ascii-ripple-template');
    if (templateEl) {
        const pre = templateEl.querySelector('.ascii-ripple-pre');
        if (pre) pre.textContent = ASCII_ART_RAW.trim();
    }

    function spawnAsciiRipple(clientX, clientY) {
        const template = document.getElementById('ascii-ripple-template');
        if (!template || !template.querySelector('.ascii-ripple-pre')?.textContent) return;
        const clone = template.cloneNode(true);
        clone.id = '';
        clone.classList.remove('ascii-ripple-template');
        clone.classList.add('ascii-ripple-clone');
        const scale = 0.75 + Math.random() * 0.55;
        clone.style.setProperty('--ascii-scale', String(scale));
        clone.style.left = clientX + 'px';
        clone.style.top = clientY + 'px';
        document.body.appendChild(clone);
        clone.addEventListener('animationend', () => clone.remove(), { once: true });
    }

    if (homeView) {
        homeView.addEventListener('click', (e) => {
            if (homeView.classList.contains('hidden')) return;
            if (e.target.closest('.menu-item')) return;
            spawnAsciiRipple(e.clientX, e.clientY);
        });
    }
});
