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
            e.preventDefault();
            const menuType = this.dataset.menu;
            
            // Add selecting animation
            this.classList.add('selecting');
            
            // Play transition animation
            setTimeout(() => {
                transitionOverlay.classList.add('active');
                
                setTimeout(() => {
                    // Hide home view
                    homeView.classList.add('hidden');
                    
                    // Show selected content page
                    const targetPage = document.getElementById(`${menuType}-page`);
                    if (targetPage) {
                        targetPage.classList.add('active');
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
                    transitionOverlay.classList.add('active');
                    setTimeout(() => {
                        currentPage.classList.remove('active');
                        homeView.classList.remove('hidden');
                        setTimeout(() => {
                            transitionOverlay.classList.remove('active');
                        }, 300);
                    }, 200);
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
                    targetPage.classList.add('active');

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
        if (document.querySelector('.content-page.active')) {
            if (e.key === 'Escape') {
                const activePage = document.querySelector('.content-page.active');
                if (activePage) {
                    const backBtn = activePage.querySelector('.back-button');
                    if (backBtn) backBtn.click();
                }
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
    
    // Position gears using only manual positions
    function positionGearsManually() {
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
                contentDisplay.querySelectorAll('.subcategory-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show the corresponding content
                const targetContent = contentDisplay.querySelector(`[data-content="${subcategory}"]`);
                if (targetContent) {
                    targetContent.classList.add('active');
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
