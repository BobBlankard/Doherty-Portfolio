(function () {
    /* Load hover background images after default video is ready so hover is instant */
    var defaultVideo = document.querySelector('.art-bg-default');
    var hoverBgImages = document.querySelectorAll('.art-bg-layer .art-bg-image[data-src]');
    if (defaultVideo && hoverBgImages.length) {
        function loadHoverBgImages() {
            hoverBgImages.forEach(function (img) {
                var src = img.getAttribute('data-src');
                if (src) img.src = src;
            });
            defaultVideo.removeEventListener('loadeddata', loadHoverBgImages);
            defaultVideo.removeEventListener('canplay', loadHoverBgImages);
        }
        defaultVideo.addEventListener('loadeddata', loadHoverBgImages);
        defaultVideo.addEventListener('canplay', loadHoverBgImages);
        if (defaultVideo.readyState >= 2) loadHoverBgImages();
    }

    var nav = document.querySelector('.art-nav');
    var navItems = nav ? nav.querySelectorAll('.art-nav-item') : [];
    var drawer = document.getElementById('art-drawer');
    var drawerItems = drawer ? drawer.querySelectorAll('.art-drawer-item[data-category]') : [];
    var menuBtn = document.querySelector('.art-menu-btn');
    var drawerBackdrop = drawer ? drawer.querySelector('.art-drawer-backdrop') : null;
    var paintWrap = document.getElementById('art-drawer-paint-wrap');
    var paintBtn = document.getElementById('art-drawer-paint-btn');
    var paintDropdown = document.getElementById('art-drawer-paint-dropdown');

    /* All category buttons (desktop + drawer) for aria-selected and layer control */
    function getAllCategoryItems() {
        return document.querySelectorAll('.art-nav-item, .art-drawer-item');
    }

    function getLayer(category) {
        return document.getElementById('art-bg-' + category);
    }

    function getVideoInLayer(layer) {
        return layer ? layer.querySelector('video.art-bg-video') : null;
    }

    function showCategory(category) {
        getAllCategoryItems().forEach(function (item) {
            item.setAttribute('aria-selected', item.dataset.category === category ? 'true' : 'false');
        });
        document.querySelectorAll('.art-bg-layer').forEach(function (layer) {
            var isActive = layer.id === 'art-bg-' + category;
            layer.classList.toggle('active', isActive);
            var video = getVideoInLayer(layer);
            if (video) {
                if (isActive) {
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            }
        });
    }

    function clearCategory() {
        getAllCategoryItems().forEach(function (item) {
            item.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.art-bg-layer').forEach(function (layer) {
            layer.classList.remove('active');
            var video = getVideoInLayer(layer);
            if (video) video.pause();
        });
    }

    function openDrawer() {
        if (!drawer) return;
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (paintWrap && paintBtn && paintDropdown) {
            paintWrap.classList.remove('is-open');
            paintBtn.setAttribute('aria-expanded', 'false');
            paintDropdown.hidden = true;
        }
    }

    var activeCategory = null;

    /* Desktop nav: hover + click */
    navItems.forEach(function (item) {
        var category = item.dataset.category;
        if (!category) return;

        item.addEventListener('mouseenter', function () {
            showCategory(category);
        });

        item.addEventListener('mouseleave', function () {
            if (activeCategory === null) clearCategory();
        });

        item.addEventListener('focus', function () {
            showCategory(category);
        });

        item.addEventListener('blur', function () {
            if (activeCategory === null) clearCategory();
        });

        item.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'category.html?c=' + encodeURIComponent(category);
        });
    });

    /* Applied Works link: show applied-works bg on hover (desktop + drawer) */
    var appliedWorksLayer = document.getElementById('art-bg-applied-works');
    function showAppliedWorksLayer() {
        if (appliedWorksLayer) appliedWorksLayer.classList.add('active');
        document.querySelectorAll('.art-bg-layer').forEach(function (layer) {
            if (layer !== appliedWorksLayer) layer.classList.remove('active');
        });
    }
    function hideAppliedWorksLayer() {
        if (appliedWorksLayer) appliedWorksLayer.classList.remove('active');
    }
    document.querySelectorAll('.art-nav-item-link, .art-drawer-item-link').forEach(function (link) {
        link.addEventListener('mouseenter', showAppliedWorksLayer);
        link.addEventListener('mouseleave', function () {
            if (activeCategory === null) {
                hideAppliedWorksLayer();
                clearCategory();
            }
        });
        link.addEventListener('focus', showAppliedWorksLayer);
        link.addEventListener('blur', function () {
            if (activeCategory === null) {
                hideAppliedWorksLayer();
                clearCategory();
            }
        });
    });

    /* PAINT toggle: open/close dropdown (do not change category or close drawer) */
    if (paintBtn && paintWrap && paintDropdown) {
        paintBtn.addEventListener('click', function () {
            var isOpen = paintWrap.classList.toggle('is-open');
            paintBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            paintDropdown.hidden = !isOpen;
        });
    }

    /* Drawer items: click to show category and close drawer */
    drawerItems.forEach(function (item) {
        var category = item.dataset.category;
        if (!category) return;

        item.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'category.html?c=' + encodeURIComponent(category);
        });
    });

    /* Menu button: toggle drawer */
    if (menuBtn && drawer) {
        menuBtn.addEventListener('click', function () {
            if (drawer.classList.contains('is-open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });
    }

    /* Backdrop click: close drawer */
    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', closeDrawer);
    }
})();
