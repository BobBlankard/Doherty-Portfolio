
(function() {
    let artInitialized = false;
    let artCanvas, artCtx;
    let artRefreshInterval = null;
    let artAnimationFrameId = null;
    
    function stopArtGenerator() {
        console.log('Art generator: Stopping...');
        // Cancel animation frame
        if (artAnimationFrameId) {
            cancelAnimationFrame(artAnimationFrameId);
            artAnimationFrameId = null;
        }
        // Clear refresh interval
        if (artRefreshInterval) {
            clearInterval(artRefreshInterval);
            artRefreshInterval = null;
        }
        // Reset initialization flag so it can restart when section becomes active again
        artInitialized = false;
    }
    
    function initArtGenerator() {
        if (artInitialized) return;
        
        artCanvas = document.getElementById('artCanvas');
        if (!artCanvas) {
            console.log('Art generator: Canvas not found');
            return;
        }
        
        artCtx = artCanvas.getContext('2d');
        if (!artCtx) {
            console.log('Art generator: Could not get 2d context');
            return;
        }
        
        console.log('Art generator: Initializing...');
        artInitialized = true;
        
        let artTime = 0;
        let artPrimaryElements = [];
        let artSecondaryElements = [];
        let artPixelatedLines = [];
        let artShapeSquares = [];
        let artDitheredPatterns = [];
        let artDiagonalConnectors = [];
        let artComplexGeometrics = [];
        let artPhotoElements = [];
        let artOrganicForms = [];
        let artFocalZones = [];
        
        // Golden ratio for movement scaling
        const PHI = 1.618033988749;
        const INV_PHI = 1 / PHI;
        
        // Color palettes
        const artColorPalettes = {
            vibrant: ['#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00', '#0000ff', '#ff8000', '#8000ff'],
            neon: ['#ff0080', '#0080ff', '#80ff00', '#ff8000', '#8000ff', '#00ff80', '#ff4080', '#4080ff'],
            pastel: ['#ffb3ff', '#b3ffff', '#ffffb3', '#ffb3b3', '#b3ffb3', '#b3b3ff', '#ffcc99', '#cc99ff'],
            monochrome: ['#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#ff00ff', '#00ffff']
        };
        
        class Element {
            constructor(type, size = 'medium', isSecondary = false) {
                this.type = type;
                this.size = size;
                this.isSecondary = isSecondary;
                this.setupSize();
                this.setupPosition();
                this.color = this.getRandomColor();
                this.setupMovement();
                this.lastTeleport = Date.now();
                this.opacity = isSecondary ? 0.4 + Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
                
                if (this.type === 'animatedGrid') {
                    this.setupMovingPixel();
                }
            }
            
            setupSize() {
                const baseSize = this.type === 'grid' || this.type === 'animatedGrid' ? 
                    parseInt(document.getElementById('artGridSize').value) : 
                    this.isSecondary ? 40 : 80;
                
                if (this.isSecondary) {
                    this.width = baseSize * (0.5 + Math.random() * 1.5);
                    this.height = baseSize * (0.5 + Math.random() * 1.5);
                    this.movementFactor = PHI * 1.5;
                } else {
                    switch(this.size) {
                        case 'small':
                            this.width = baseSize * 0.5;
                            this.height = baseSize * 0.5;
                            this.movementFactor = PHI;
                            break;
                        case 'medium':
                            this.width = baseSize;
                            this.height = baseSize * (0.7 + Math.random() * 0.6);
                            this.movementFactor = 1;
                            break;
                        case 'large':
                            this.width = baseSize * 1.5;
                            this.height = baseSize * 1.2;
                            this.movementFactor = INV_PHI;
                            break;
                    }
                }
                
                if (this.type === 'grid' || this.type === 'animatedGrid') {
                    this.movementFactor = 0;
                }
            }
            
            setupPosition() {
                if ((this.type === 'grid' || this.type === 'animatedGrid') && !this.isSecondary) {
                    if (artPrimaryElements.filter(el => el.type === 'grid' || el.type === 'animatedGrid').length === 0) {
                        this.positionInCorner();
                    } else {
                        this.x = Math.random() * (artCanvas.width - this.width);
                        this.y = Math.random() * (artCanvas.height - this.height);
                    }
                } else if (this.isSecondary) {
                    const area = Math.floor(Math.random() * 6);
                    switch(area) {
                        case 0:
                            this.x = Math.random() * (artCanvas.width - this.width);
                            this.y = Math.random() * 100;
                            break;
                        case 1:
                            this.x = Math.random() * (artCanvas.width - this.width);
                            this.y = artCanvas.height - 100 + Math.random() * (100 - this.height);
                            break;
                        case 2:
                            this.x = Math.random() * 100;
                            this.y = Math.random() * (artCanvas.height - this.height);
                            break;
                        case 3:
                            this.x = artCanvas.width - 100 + Math.random() * (100 - this.width);
                            this.y = Math.random() * (artCanvas.height - this.height);
                            break;
                        case 4:
                            this.x = artCanvas.width * 0.3 + Math.random() * (artCanvas.width * 0.4 - this.width);
                            this.y = artCanvas.height * 0.3 + Math.random() * (artCanvas.height * 0.4 - this.height);
                            break;
                        case 5:
                            this.positionInCorner();
                            break;
                    }
                } else {
                    const margin = 50;
                    this.x = margin + Math.random() * (artCanvas.width - this.width - margin * 2);
                    this.y = margin + Math.random() * (artCanvas.height - this.height - margin * 2);
                }
                
                this.originalX = this.x;
                this.originalY = this.y;
            }
            
            positionInCorner() {
                const corner = Math.floor(Math.random() * 4);
                const margin = 20;
                
                switch(corner) {
                    case 0:
                        this.x = margin;
                        this.y = margin;
                        break;
                    case 1:
                        this.x = artCanvas.width - this.width - margin;
                        this.y = margin;
                        break;
                    case 2:
                        this.x = margin;
                        this.y = artCanvas.height - this.height - margin;
                        break;
                    case 3:
                        this.x = artCanvas.width - this.width - margin;
                        this.y = artCanvas.height - this.height - margin;
                        break;
                }
            }
            
            setupMovement() {
                this.phase = Math.random() * Math.PI * 2;
                this.frequency = 0.005 + Math.random() * 0.01;
                this.amplitude = this.isSecondary ? 2 + Math.random() * 8 : 5 + Math.random() * 15;
            }
            
            setupMovingPixel() {
                this.gridSpacing = 15;
                this.pixelBlockSize = 27;
                this.maxGridX = Math.floor((this.width - this.pixelBlockSize) / this.gridSpacing);
                this.maxGridY = Math.floor((this.height - this.pixelBlockSize) / this.gridSpacing);
                
                this.movingPixelX = Math.floor(Math.random() * (this.maxGridX + 1));
                this.movingPixelY = Math.floor(Math.random() * (this.maxGridY + 1));
                this.lastPixelMove = Date.now();
                this.pixelMoveDelay = 800 + Math.random() * 1200;
            }
            
            getRandomColor() {
                const mode = document.getElementById('artColorMode').value;
                const palette = artColorPalettes[mode];
                const saturation = document.getElementById('artColorSaturation').value;
                const baseColor = palette[Math.floor(Math.random() * palette.length)];
                return this.adjustColorSaturation(baseColor, saturation / 100);
            }
            
            adjustColorSaturation(hex, factor) {
                const r = parseInt(hex.substr(1, 2), 16);
                const g = parseInt(hex.substr(3, 2), 16);
                const b = parseInt(hex.substr(5, 2), 16);
                
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                
                const newR = Math.min(255, Math.max(0, Math.round(gray + factor * (r - gray))));
                const newG = Math.min(255, Math.max(0, Math.round(gray + factor * (g - gray))));
                const newB = Math.min(255, Math.max(0, Math.round(gray + factor * (b - gray))));
                
                return `rgb(${newR}, ${newG}, ${newB})`;
            }
            
            updateMovingPixel() {
                if (this.type !== 'animatedGrid') return;
                
                if (Date.now() - this.lastPixelMove > this.pixelMoveDelay) {
                    const direction = Math.floor(Math.random() * 4);
                    
                    switch(direction) {
                        case 0:
                            if (this.movingPixelY > 0) this.movingPixelY--;
                            break;
                        case 1:
                            if (this.movingPixelX < this.maxGridX) this.movingPixelX++;
                            break;
                        case 2:
                            if (this.movingPixelY < this.maxGridY) this.movingPixelY++;
                            break;
                        case 3:
                            if (this.movingPixelX > 0) this.movingPixelX--;
                            break;
                    }
                    
                    this.lastPixelMove = Date.now();
                    this.pixelMoveDelay = 600 + Math.random() * 1000;
                }
            }
            
            update() {
                const movementScale = document.getElementById('artMovementScale').value / 5;
                
                if (this.type === 'grid') {
                    const teleportTime = parseInt(document.getElementById('artGridTeleportTime').value) * 1000;
                    if (Date.now() - this.lastTeleport > teleportTime) {
                        this.teleport();
                    }
                    return;
                }
                
                if (this.type === 'animatedGrid') {
                    this.updateMovingPixel();
                    return;
                }
                
                if (this.movementFactor > 0) {
                    const movement = this.movementFactor * movementScale;
                    this.x = this.originalX + Math.sin(artTime * this.frequency + this.phase) * this.amplitude * movement;
                    this.y = this.originalY + Math.cos(artTime * this.frequency * 0.7 + this.phase) * this.amplitude * movement * 0.6;
                }
            }
            
            teleport() {
                if (this.isSecondary) {
                    this.setupPosition();
                } else {
                    const margin = 30;
                    this.x = margin + Math.random() * (artCanvas.width - this.width - margin * 2);
                    this.y = margin + Math.random() * (artCanvas.height - this.height - margin * 2);
                }
                this.originalX = this.x;
                this.originalY = this.y;
                this.lastTeleport = Date.now();
                this.color = this.getRandomColor();
            }
            
            draw() {
                artCtx.save();
                artCtx.globalAlpha = this.opacity;
                artCtx.translate(this.x, this.y);
                
                switch(this.type) {
                    case 'block': 
                        this.drawBlock(); 
                        break;
                    case 'lines': 
                        this.drawLines(); 
                        break;
                    case 'grid': 
                        this.drawGrid(); 
                        break;
                    case 'animatedGrid': 
                        this.drawAnimatedGrid(); 
                        break;
                }
                
                artCtx.restore();
            }
            
            drawBlock() {
                artCtx.fillStyle = this.color;
                artCtx.fillRect(0, 0, this.width, this.height);
                
                if (Math.random() > 0.7) {
                    artCtx.fillStyle = this.adjustColorSaturation(this.color, 1.3);
                    artCtx.fillRect(this.width * 0.1, this.height * 0.1, 
                               this.width * 0.8, this.height * 0.1);
                }
            }
            
            drawLines() {
                artCtx.strokeStyle = this.color;
                artCtx.lineWidth = 2;
                
                const lineCount = Math.floor(this.height / 8);
                for (let i = 0; i < lineCount; i++) {
                    artCtx.beginPath();
                    const y = (i / lineCount) * this.height;
                    const offset = Math.sin(artTime * 0.01 + i) * 5;
                    artCtx.moveTo(0, y + offset);
                    artCtx.lineTo(this.width, y + offset);
                    artCtx.stroke();
                }
            }
            
            drawGrid() {
                artCtx.strokeStyle = this.color;
                artCtx.lineWidth = this.isSecondary || this.width < 200 ? 1 : 1.5;
                
                const gridSpacing = this.isSecondary ? 8 : 15;
                
                for (let x = 0; x <= this.width; x += gridSpacing) {
                    artCtx.beginPath();
                    artCtx.moveTo(x, 0);
                    artCtx.lineTo(x, this.height);
                    artCtx.stroke();
                }
                
                for (let y = 0; y <= this.height; y += gridSpacing) {
                    artCtx.beginPath();
                    artCtx.moveTo(0, y);
                    artCtx.lineTo(this.width, y);
                    artCtx.stroke();
                }
            }
            
            drawAnimatedGrid() {
                artCtx.strokeStyle = this.color;
                artCtx.lineWidth = 1.5;
                
                const gridSpacing = 15;
                
                for (let x = 0; x <= this.width; x += gridSpacing) {
                    artCtx.beginPath();
                    artCtx.moveTo(x, 0);
                    artCtx.lineTo(x, this.height);
                    artCtx.stroke();
                }
                
                for (let y = 0; y <= this.height; y += gridSpacing) {
                    artCtx.beginPath();
                    artCtx.moveTo(0, y);
                    artCtx.lineTo(this.width, y);
                    artCtx.stroke();
                }
                
                const pixelX = this.movingPixelX * this.gridSpacing;
                const pixelY = this.movingPixelY * this.gridSpacing;
                
                artCtx.fillStyle = this.color;
                artCtx.fillRect(pixelX, pixelY, this.pixelBlockSize, this.pixelBlockSize);
            }
        }
        
        class PixelatedLine {
            constructor() {
                this.setupPath();
                this.color = this.getRandomColor();
                this.thickness = 20 + Math.random() * 40;
                this.pixelSize = 8;
                this.segmentLength = 40;
                this.opacity = 0.8 + Math.random() * 0.2;
            }
            
            setupPath() {
                const diag = Math.sqrt(artCanvas.width ** 2 + artCanvas.height ** 2);
                const minLength = diag * 0.5;
                let attempts = 0;
                do {
                    const startSide = Math.floor(Math.random() * 4);
                    switch(startSide) {
                        case 0:
                            this.x1 = Math.random() * artCanvas.width;
                            this.y1 = 0;
                            if (Math.random() > 0.5) {
                                this.x2 = Math.random() * artCanvas.width;
                                this.y2 = artCanvas.height;
                            } else {
                                this.x2 = Math.random() > 0.5 ? 0 : artCanvas.width;
                                this.y2 = Math.random() * artCanvas.height;
                            }
                            break;
                        case 1:
                            this.x1 = artCanvas.width;
                            this.y1 = Math.random() * artCanvas.height;
                            if (Math.random() > 0.5) {
                                this.x2 = 0;
                                this.y2 = Math.random() * artCanvas.height;
                            } else {
                                this.x2 = Math.random() * artCanvas.width;
                                this.y2 = Math.random() > 0.5 ? 0 : artCanvas.height;
                            }
                            break;
                        case 2:
                            this.x1 = Math.random() * artCanvas.width;
                            this.y1 = artCanvas.height;
                            if (Math.random() > 0.5) {
                                this.x2 = Math.random() * artCanvas.width;
                                this.y2 = 0;
                            } else {
                                this.x2 = Math.random() > 0.5 ? 0 : artCanvas.width;
                                this.y2 = Math.random() * artCanvas.height;
                            }
                            break;
                        case 3:
                            this.x1 = 0;
                            this.y1 = Math.random() * artCanvas.height;
                            if (Math.random() > 0.5) {
                                this.x2 = artCanvas.width;
                                this.y2 = Math.random() * artCanvas.height;
                            } else {
                                this.x2 = Math.random() * artCanvas.width;
                                this.y2 = Math.random() > 0.5 ? 0 : artCanvas.height;
                            }
                            break;
                    }
                    const len = Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
                    if (len >= minLength || ++attempts > 30) break;
                } while (true);
                this.generatePixelatedPath();
            }
            
            setOrthogonalPath() {
                const w = artCanvas.width;
                const h = artCanvas.height;
                const margin = Math.min(w, h) * 0.1;
                if (Math.random() > 0.5) {
                    const y = margin + Math.random() * (h - 2 * margin);
                    this.x1 = margin;
                    this.y1 = y;
                    this.x2 = w - margin;
                    this.y2 = y;
                } else {
                    const x = margin + Math.random() * (w - 2 * margin);
                    this.x1 = x;
                    this.y1 = margin;
                    this.x2 = x;
                    this.y2 = h - margin;
                }
                this.generatePixelatedPath();
            }
            
            generatePixelatedPath() {
                this.segments = [];
                const dx = this.x2 - this.x1;
                const dy = this.y2 - this.y1;
                const steps = Math.floor(Math.sqrt(dx*dx + dy*dy) / this.segmentLength);
                
                let currentX = this.x1;
                let currentY = this.y1;
                
                for (let i = 0; i < steps; i++) {
                    const progress = i / steps;
                    const targetX = this.x1 + dx * progress;
                    const targetY = this.y1 + dy * progress;
                    
                    const stepX = Math.round((targetX - currentX) / this.pixelSize) * this.pixelSize;
                    const stepY = Math.round((targetY - currentY) / this.pixelSize) * this.pixelSize;
                    
                    if (stepX !== 0 || stepY !== 0) {
                        this.segments.push({
                            x1: currentX,
                            y1: currentY,
                            x2: currentX + stepX,
                            y2: currentY + stepY
                        });
                        
                        currentX += stepX;
                        currentY += stepY;
                    }
                }
            }
            
            getRandomColor() {
                const mode = document.getElementById('artColorMode').value;
                const palette = artColorPalettes[mode];
                return palette[Math.floor(Math.random() * palette.length)];
            }
            
            draw() {
                artCtx.save();
                artCtx.globalAlpha = this.opacity;
                artCtx.strokeStyle = this.color;
                artCtx.lineWidth = this.thickness;
                artCtx.lineCap = 'square';
                
                this.segments.forEach(segment => {
                    artCtx.beginPath();
                    artCtx.moveTo(segment.x1, segment.y1);
                    artCtx.lineTo(segment.x2, segment.y2);
                    artCtx.stroke();
                });
                
                artCtx.restore();
            }
        }
        
        class DitheredPattern {
            constructor() {
                this.setupSize();
                this.setupPosition();
                this.color = this.getRandomColor();
                this.dotDensity = 0.3 + Math.random() * 0.4;
                this.dotSize = 2 + Math.random() * 4;
                this.opacity = 0.6 + Math.random() * 0.4;
                this.blendMode = Math.random() > 0.5 ? 'multiply' : 'overlay';
                this.targetDotPositions = [];
                this.currentDotPositions = [];
                this.dotLerpSpeed = 0.35;
            }
            
            setupSize() {
                this.width = 80 + Math.random() * 200;
                this.height = 80 + Math.random() * 200;
            }
            
            setupPosition() {
                this.x = Math.random() * (artCanvas.width - this.width);
                this.y = Math.random() * (artCanvas.height - this.height);
            }
            
            getRandomColor() {
                const mode = document.getElementById('artColorMode').value;
                const palette = artColorPalettes[mode];
                return palette[Math.floor(Math.random() * palette.length)];
            }
            
            computeDotPositions() {
                this.targetDotPositions.length = 0;
                for (let x = 0; x < this.width; x += this.dotSize * 2) {
                    for (let y = 0; y < this.height; y += this.dotSize * 2) {
                        const distance = Math.sqrt((x - this.width/2)**2 + (y - this.height/2)**2);
                        const maxDistance = Math.sqrt((this.width/2)**2 + (this.height/2)**2);
                        const density = this.dotDensity * (1 - distance / maxDistance);
                        if (Math.random() < density) {
                            this.targetDotPositions.push({ x: this.x + x, y: this.y + y });
                        }
                    }
                }
                if (this.currentDotPositions.length !== this.targetDotPositions.length) {
                    this.currentDotPositions = this.targetDotPositions.map(t => ({ x: t.x, y: t.y }));
                }
            }
            
            updateCurrentPositions() {
                const n = this.targetDotPositions.length;
                if (n === 0) return;
                for (let i = 0; i < n; i++) {
                    const cur = this.currentDotPositions[i];
                    const tar = this.targetDotPositions[i];
                    if (!cur) {
                        this.currentDotPositions[i] = { x: tar.x, y: tar.y };
                    } else {
                        cur.x += (tar.x - cur.x) * this.dotLerpSpeed;
                        cur.y += (tar.y - cur.y) * this.dotLerpSpeed;
                    }
                }
                if (this.currentDotPositions.length > n) {
                    this.currentDotPositions.length = n;
                }
            }
            
            draw() {
                if (artTime % 30 === 0 || this.targetDotPositions.length === 0) {
                    this.computeDotPositions();
                } else {
                    this.updateCurrentPositions();
                }
                artCtx.save();
                artCtx.globalAlpha = this.opacity;
                artCtx.globalCompositeOperation = this.blendMode;
                artCtx.fillStyle = this.color;
                const r = this.dotSize / 2;
                for (let i = 0; i < this.currentDotPositions.length; i++) {
                    const p = this.currentDotPositions[i];
                    artCtx.beginPath();
                    artCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
                    artCtx.fill();
                }
                artCtx.restore();
            }
        }
        
        class DiagonalConnector {
            constructor() {
                this.setupPath();
                this.color = this.getRandomColor();
                this.thickness = 3 + Math.random() * 8;
                this.opacity = 0.7 + Math.random() * 0.3;
                this.dashPattern = Math.random() > 0.5;
            }
            
            setupPath() {
                const w = artCanvas.width;
                const h = artCanvas.height;
                const diag = Math.sqrt(w * w + h * h);
                const minLength = diag * 0.5;
                let attempts = 0;
                do {
                    const pair = Math.floor(Math.random() * 2);
                    if (pair === 0) {
                        this.x1 = Math.random() * w * 0.2;
                        this.y1 = Math.random() * h;
                        this.x2 = w - Math.random() * w * 0.2;
                        this.y2 = Math.random() * h;
                    } else {
                        this.x1 = Math.random() * w;
                        this.y1 = Math.random() * h * 0.2;
                        this.x2 = Math.random() * w;
                        this.y2 = h - Math.random() * h * 0.2;
                    }
                    const len = Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
                    if (len >= minLength || ++attempts > 30) break;
                } while (true);
            }
            
            setOrthogonalPath() {
                const w = artCanvas.width;
                const h = artCanvas.height;
                const margin = Math.min(w, h) * 0.1;
                if (Math.random() > 0.5) {
                    const y = margin + Math.random() * (h - 2 * margin);
                    this.x1 = margin;
                    this.y1 = y;
                    this.x2 = w - margin;
                    this.y2 = y;
                } else {
                    const x = margin + Math.random() * (w - 2 * margin);
                    this.x1 = x;
                    this.y1 = margin;
                    this.x2 = x;
                    this.y2 = h - margin;
                }
            }
            
            getRandomColor() {
                const mode = document.getElementById('artColorMode').value;
                const palette = artColorPalettes[mode];
                return palette[Math.floor(Math.random() * palette.length)];
            }
            
            draw() {
                artCtx.save();
                artCtx.globalAlpha = this.opacity;
                artCtx.strokeStyle = this.color;
                artCtx.lineWidth = this.thickness;
                
                if (this.dashPattern) {
                    artCtx.setLineDash([20, 10]);
                }
                
                artCtx.beginPath();
                artCtx.moveTo(this.x1, this.y1);
                artCtx.lineTo(this.x2, this.y2);
                artCtx.stroke();
                
                artCtx.restore();
            }
        }
        
        class ComplexGeometric {
            constructor() {
                this.setupSize();
                this.setupPosition();
                this.color = this.getRandomColor();
                this.pattern = Math.floor(Math.random() * 3);
                this.opacity = 0.5 + Math.random() * 0.5;
            }
            
            setupSize() {
                this.width = 60 + Math.random() * 150;
                this.height = 60 + Math.random() * 150;
            }
            
            setupPosition() {
                this.x = Math.random() * (artCanvas.width - this.width);
                this.y = Math.random() * (artCanvas.height - this.height);
            }
            
            getRandomColor() {
                const mode = document.getElementById('artColorMode').value;
                const palette = artColorPalettes[mode];
                return palette[Math.floor(Math.random() * palette.length)];
            }
            
            draw() {
                artCtx.save();
                artCtx.globalAlpha = this.opacity;
                artCtx.translate(this.x, this.y);
                
                switch(this.pattern) {
                    case 0: this.drawChevron(); break;
                    case 1: this.drawDiagonalStripes(); break;
                    case 2: this.drawAngularPattern(); break;
                }
                
                artCtx.restore();
            }
            
            drawChevron() {
                artCtx.strokeStyle = this.color;
                artCtx.lineWidth = 2;
                
                const spacing = 15;
                for (let i = 0; i < this.width; i += spacing) {
                    artCtx.beginPath();
                    artCtx.moveTo(i, 0);
                    artCtx.lineTo(i + spacing/2, this.height/2);
                    artCtx.lineTo(i, this.height);
                    artCtx.stroke();
                }
            }
            
            drawDiagonalStripes() {
                artCtx.strokeStyle = this.color;
                artCtx.lineWidth = 3;
                
                const spacing = 12;
                for (let i = -this.height; i < this.width + this.height; i += spacing) {
                    artCtx.beginPath();
                    artCtx.moveTo(i, 0);
                    artCtx.lineTo(i + this.height, this.height);
                    artCtx.stroke();
                }
            }
            
            drawAngularPattern() {
                artCtx.fillStyle = this.color;
                
                const segments = 8;
                for (let i = 0; i < segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    const x = Math.cos(angle) * this.width/4 + this.width/2;
                    const y = Math.sin(angle) * this.height/4 + this.height/2;
                    
                    artCtx.beginPath();
                    artCtx.moveTo(this.width/2, this.height/2);
                    artCtx.lineTo(x, y);
                    artCtx.lineTo(x + 10, y + 10);
                    artCtx.closePath();
                    artCtx.fill();
                }
            }
        }
        
        class PhotoElement {
            constructor() {
                this.setupSize();
                this.setupPosition();
                this.generatePhotoTexture();
                this.opacity = 0.6 + Math.random() * 0.4;
                this.blendMode = ['multiply', 'overlay', 'screen', 'difference'][Math.floor(Math.random() * 4)];
                this.isProcessed = Math.random() > 0.5;
            }
            
            setupSize() {
                const scaleType = Math.random();
                if (scaleType < 0.3) {
                    this.width = 20 + Math.random() * 40;
                    this.height = 20 + Math.random() * 40;
                } else if (scaleType < 0.7) {
                    this.width = 60 + Math.random() * 120;
                    this.height = 60 + Math.random() * 120;
                } else {
                    this.width = 150 + Math.random() * 250;
                    this.height = 150 + Math.random() * 250;
                }
            }
            
            setupPosition() {
                this.x = Math.random() * (artCanvas.width - this.width);
                this.y = Math.random() * (artCanvas.height - this.height);
            }
            
            generatePhotoTexture() {
                this.textureType = Math.floor(Math.random() * 4);
                this.noiseScale = 2 + Math.random() * 6;
                this.contrast = 0.5 + Math.random() * 0.5;
            }
            
            draw() {
                artCtx.save();
                artCtx.globalAlpha = this.opacity;
                artCtx.globalCompositeOperation = this.blendMode;
                
                this.drawPhotoTexture();
                
                artCtx.restore();
            }
            
            drawPhotoTexture() {
                const imageData = artCtx.createImageData(this.width, this.height);
                const data = imageData.data;
                
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        const i = (y * this.width + x) * 4;
                        let value;
                        
                        switch(this.textureType) {
                            case 0:
                                value = Math.random() * (Math.sin(x * 0.1) + Math.cos(y * 0.15)) * 0.5 + 0.5;
                                break;
                            case 1:
                                value = ((x % 20 < 2) || (y % 15 < 2)) ? 0.8 : 0.3 + Math.random() * 0.2;
                                break;
                            case 2:
                                value = (Math.sin(x * 0.05) * Math.cos(y * 0.08) + 1) * 0.5;
                                break;
                            case 3:
                                value = Math.random() * Math.sin(x * y * 0.001);
                                break;
                        }
                        
                        value = Math.floor(value * this.contrast * 255);
                        if (this.isProcessed) {
                            data[i] = value;
                            data[i + 1] = value;
                            data[i + 2] = value;
                        } else {
                            data[i] = value * 0.8;
                            data[i + 1] = value * 0.9;
                            data[i + 2] = value;
                        }
                        data[i + 3] = 255;
                    }
                }
                
                artCtx.putImageData(imageData, this.x, this.y);
            }
        }
        
        class OrganicForm {
            constructor() {
                this.setupSize();
                this.setupPosition();
                this.color = this.getRandomColor();
                this.curveType = Math.floor(Math.random() * 3);
                this.opacity = 0.4 + Math.random() * 0.4;
                this.rotation = Math.random() * Math.PI * 2;
            }
            
            setupSize() {
                this.width = 80 + Math.random() * 180;
                this.height = 80 + Math.random() * 180;
            }
            
            setupPosition() {
                this.x = Math.random() * (artCanvas.width - this.width);
                this.y = Math.random() * (artCanvas.height - this.height);
            }
            
            getRandomColor() {
                const mode = document.getElementById('artColorMode').value;
                const palette = artColorPalettes[mode];
                return palette[Math.floor(Math.random() * palette.length)];
            }
            
            draw() {
                artCtx.save();
                artCtx.globalAlpha = this.opacity;
                artCtx.globalCompositeOperation = 'overlay';
                artCtx.translate(this.x + this.width/2, this.y + this.height/2);
                artCtx.rotate(this.rotation);
                artCtx.fillStyle = this.color;
                
                switch(this.curveType) {
                    case 0: this.drawSpiral(); break;
                    case 1: this.drawArc(); break;
                    case 2: this.drawBlob(); break;
                }
                
                artCtx.restore();
            }
            
            drawSpiral() {
                artCtx.beginPath();
                for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
                    const radius = angle * 3;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (angle === 0) artCtx.moveTo(x, y);
                    else artCtx.lineTo(x, y);
                }
                artCtx.lineWidth = 8;
                artCtx.strokeStyle = this.color;
                artCtx.stroke();
            }
            
            drawArc() {
                artCtx.beginPath();
                artCtx.arc(0, 0, this.width/3, 0, Math.PI * 1.5);
                artCtx.lineWidth = 12;
                artCtx.strokeStyle = this.color;
                artCtx.stroke();
            }
            
            drawBlob() {
                artCtx.beginPath();
                const points = 8;
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * Math.PI * 2;
                    const radius = (this.width/4) + Math.random() * (this.width/4);
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) artCtx.moveTo(x, y);
                    else artCtx.lineTo(x, y);
                }
                artCtx.closePath();
                artCtx.fill();
            }
        }
        
        class FocalZone {
            constructor(priority) {
                this.priority = priority;
                this.setupZone();
                this.elements = [];
                this.colorTemperature = Math.random() > 0.5 ? 'warm' : 'cool';
            }
            
            setupZone() {
                const zones = [
                    {x: artCanvas.width * 0.33, y: artCanvas.height * 0.33},
                    {x: artCanvas.width * 0.66, y: artCanvas.height * 0.33},
                    {x: artCanvas.width * 0.33, y: artCanvas.height * 0.66},
                    {x: artCanvas.width * 0.66, y: artCanvas.height * 0.66}
                ];
                
                const zone = zones[Math.floor(Math.random() * zones.length)];
                this.centerX = zone.x;
                this.centerY = zone.y;
                this.radius = 50 + (4 - this.priority) * 30;
            }
            
            addElement(element) {
                this.elements.push(element);
            }
            
            getInfluenceWeight(x, y) {
                const distance = Math.sqrt((x - this.centerX)**2 + (y - this.centerY)**2);
                return Math.max(0, 1 - distance / this.radius) * (4 - this.priority);
            }
        }

        class ShapeSquare {
            constructor() {
                this.setupSize();
                this.setupPosition();
                this.color = this.getRandomColor();
                this.isForeground = Math.random() > 0.5;
                if (this.isForeground) {
                    this.gridColor = this.getComplementaryColor(this.color);
                }
                this.opacity = 0.7 + Math.random() * 0.3;
            }
            
            setupSize() {
                this.size = 120 + Math.random() * 180;
            }
            
            setupPosition() {
                this.x = Math.random() * (artCanvas.width - this.size);
                this.y = Math.random() * (artCanvas.height - this.size);
            }
            
            getRandomColor() {
                const mode = document.getElementById('artColorMode').value;
                const palette = artColorPalettes[mode];
                return palette[Math.floor(Math.random() * palette.length)];
            }
            
            getComplementaryColor(color) {
                const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) || 
                             color.match(/#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
                
                if (!match) return '#ffffff';
                
                let r, g, b;
                if (color.startsWith('#')) {
                    r = parseInt(match[1], 16);
                    g = parseInt(match[2], 16);
                    b = parseInt(match[3], 16);
                } else {
                    r = parseInt(match[1]);
                    g = parseInt(match[2]);
                    b = parseInt(match[3]);
                }
                
                const newR = Math.floor((255 - r) * 0.6 + r * 0.4);
                const newG = Math.floor((255 - g) * 0.6 + g * 0.4);
                const newB = Math.floor((255 - b) * 0.6 + b * 0.4);
                
                return `rgb(${newR}, ${newG}, ${newB})`;
            }
            
            draw() {
                artCtx.save();
                artCtx.globalAlpha = this.opacity;
                artCtx.translate(this.x, this.y);
                
                artCtx.fillStyle = this.color;
                artCtx.fillRect(0, 0, this.size, this.size);
                
                if (this.isForeground) {
                    artCtx.strokeStyle = this.gridColor;
                    artCtx.lineWidth = 1;
                    artCtx.globalAlpha = 0.6;
                    
                    const gridSpacing = 20;
                    
                    for (let x = 0; x <= this.size; x += gridSpacing) {
                        artCtx.beginPath();
                        artCtx.moveTo(x, 0);
                        artCtx.lineTo(x, this.size);
                        artCtx.stroke();
                    }
                    
                    for (let y = 0; y <= this.size; y += gridSpacing) {
                        artCtx.beginPath();
                        artCtx.moveTo(0, y);
                        artCtx.lineTo(this.size, y);
                        artCtx.stroke();
                    }
                }
                
                artCtx.restore();
            }
        }

        // Initialize elements arrays
        function initElements() {
            artPrimaryElements = [];
            artSecondaryElements = [];
            artPixelatedLines = [];
            artShapeSquares = [];
            artDitheredPatterns = [];
            artDiagonalConnectors = [];
            artComplexGeometrics = [];
            artPhotoElements = [];
            artOrganicForms = [];
            artFocalZones = [];
            
            const density = parseInt(document.getElementById('artCompositionDensity').value);
            const lineCount = parseInt(document.getElementById('artPixelLineCount').value);
            const squareCount = parseInt(document.getElementById('artShapeSquareCount').value);
            const visualDensity = parseInt(document.getElementById('artVisualDensity').value);
            const texturalComplexity = parseInt(document.getElementById('artTexturalComplexity').value);
            const photoCount = parseInt(document.getElementById('artPhotoElements').value);
            const organicBalance = parseInt(document.getElementById('artOrganicBalance').value);
            const focalHierarchy = parseInt(document.getElementById('artFocalHierarchy').value);
            
            // FOCAL ZONES - strategic composition planning
            for (let i = 1; i <= focalHierarchy; i++) {
                artFocalZones.push(new FocalZone(i));
            }
            
            // Add exactly ONE animated grid with moving pixel
            artPrimaryElements.push(new Element('animatedGrid', 'large', false));
            
            // PRIMARY COMPOSITION - grids, blocks, and lines
            const primaryGridCount = Math.floor(density * 0.3);
            for (let i = 0; i < primaryGridCount; i++) {
                artPrimaryElements.push(new Element('grid', 'large', false));
            }
            
            const remainingPrimary = density - primaryGridCount - 1;
            const types = ['block', 'lines'];
            const sizes = ['small', 'medium', 'large'];
            
            for (let i = 0; i < remainingPrimary; i++) {
                const type = types[Math.floor(Math.random() * types.length)];
                const size = sizes[Math.floor(Math.random() * sizes.length)];
                artPrimaryElements.push(new Element(type, size, false));
            }
            
            // SECONDARY COMPOSITION - increased based on visual density
            const secondaryDensity = Math.floor(density * (1.5 + visualDensity / 100));
            for (let i = 0; i < secondaryDensity; i++) {
                const type = Math.random() < 0.4 ? 'grid' : types[Math.floor(Math.random() * types.length)];
                const size = sizes[Math.floor(Math.random() * sizes.length)];
                artSecondaryElements.push(new Element(type, size, true));
            }
            
            // PIXELATED LINES
            for (let i = 0; i < lineCount; i++) {
                artPixelatedLines.push(new PixelatedLine());
            }
            
            // SHAPE SQUARES
            for (let i = 0; i < squareCount; i++) {
                artShapeSquares.push(new ShapeSquare());
            }
            
            // DITHERED PATTERNS - based on textural complexity
            const ditheredCount = Math.floor(texturalComplexity * 1.5);
            for (let i = 0; i < ditheredCount; i++) {
                artDitheredPatterns.push(new DitheredPattern());
            }
            
            // DIAGONAL CONNECTORS - based on visual density
            const connectorCount = Math.floor(3 + visualDensity / 25);
            for (let i = 0; i < connectorCount; i++) {
                artDiagonalConnectors.push(new DiagonalConnector());
            }
            
            // Force 1–2 lines to be 90° (horizontal or vertical)
            const allLineLike = [...artPixelatedLines, ...artDiagonalConnectors];
            const orthogonalCount = Math.min(1 + Math.floor(Math.random() * 2), allLineLike.length);
            const used = new Set();
            while (used.size < orthogonalCount) {
                used.add(Math.floor(Math.random() * allLineLike.length));
            }
            used.forEach(i => allLineLike[i].setOrthogonalPath());
            
            // COMPLEX GEOMETRIC PATTERNS - based on textural complexity
            const geometricCount = Math.floor(texturalComplexity * 0.8);
            for (let i = 0; i < geometricCount; i++) {
                artComplexGeometrics.push(new ComplexGeometric());
            }
            
            // PHOTOGRAPHIC ELEMENTS - procedural photo textures
            for (let i = 0; i < photoCount; i++) {
                artPhotoElements.push(new PhotoElement());
            }
            
            // ORGANIC FORMS - based on organic balance
            const organicCount = Math.floor(organicBalance / 15);
            for (let i = 0; i < organicCount; i++) {
                artOrganicForms.push(new OrganicForm());
            }
        }
        
        function draw() {
            try {
                const bgColorEl = document.getElementById('artBgColor');
                const bgColor = bgColorEl ? bgColorEl.value : '#f3f1f1';
                artCtx.fillStyle = bgColor;
                artCtx.fillRect(0, 0, artCanvas.width, artCanvas.height);
            
            // Layer 1: Large background photographic elements
            artPhotoElements.forEach(photo => {
                if (photo.width > 150) {
                    photo.draw();
                }
            });
            
            // Layer 2: Background dithered patterns
            artDitheredPatterns.forEach(pattern => {
                pattern.draw();
            });
            
            // Layer 3: Background organic forms
            artOrganicForms.forEach(organic => {
                if (Math.random() > 0.5) {
                    organic.draw();
                }
            });
            
            // Layer 4: Background shape squares
            artShapeSquares.forEach(square => {
                if (!square.isForeground) {
                    square.draw();
                }
            });
            
            // Layer 5: Complex geometric patterns
            artComplexGeometrics.forEach(geometric => {
                geometric.draw();
            });
            
            // Layer 6: Secondary elements
            artSecondaryElements.forEach(element => {
                element.update();
                element.draw();
            });
            
            // Layer 7: Medium photographic elements
            artPhotoElements.forEach(photo => {
                if (photo.width >= 60 && photo.width <= 150) {
                    photo.draw();
                }
            });
            
            // Layer 8: Diagonal connectors
            artDiagonalConnectors.forEach(connector => {
                connector.draw();
            });
            
            // Layer 9: Pixelated lines
            artPixelatedLines.forEach(line => {
                line.draw();
            });
            
            // Layer 10: Primary elements
            artPrimaryElements.forEach(element => {
                element.update();
                element.draw();
            });
            
            // Layer 12: Foreground organic forms
            artOrganicForms.forEach(organic => {
                if (Math.random() <= 0.5) {
                    organic.draw();
                }
            });
            
            // Layer 13: Small detailed photographic elements
            artPhotoElements.forEach(photo => {
                if (photo.width < 60) {
                    photo.draw();
                }
            });
            
            // Layer 14: Foreground shape squares
            artShapeSquares.forEach(square => {
                if (square.isForeground) {
                    square.draw();
                }
            });
            
            artTime++;
            artAnimationFrameId = requestAnimationFrame(draw);
            } catch (error) {
                console.error('Art generator: Error in draw function:', error);
            }
        }
        
        function toggleArtControls() {
            const controls = document.getElementById('artControls');
            controls.classList.toggle('collapsed');
        }
        
        function regenerateArt() {
            initElements();
        }
        
        function saveArtImage() {
            const link = document.createElement('a');
            link.download = 'sainer_kolorganism_' + Date.now() + '.png';
            link.href = artCanvas.toDataURL();
            link.click();
        }
        
        // Event listeners
        document.getElementById('artCompositionDensity').addEventListener('input', regenerateArt);
        document.getElementById('artColorMode').addEventListener('change', regenerateArt);
        document.getElementById('artPixelLineCount').addEventListener('input', regenerateArt);
        document.getElementById('artShapeSquareCount').addEventListener('input', regenerateArt);
        document.getElementById('artVisualDensity').addEventListener('input', regenerateArt);
        document.getElementById('artTexturalComplexity').addEventListener('input', regenerateArt);
        document.getElementById('artPhotoElements').addEventListener('input', regenerateArt);
        document.getElementById('artOrganicBalance').addEventListener('input', regenerateArt);
        document.getElementById('artFocalHierarchy').addEventListener('input', regenerateArt);
        document.getElementById('artGridSize').addEventListener('input', () => {
            [...artPrimaryElements, ...artSecondaryElements].forEach(el => {
                if (el.type === 'grid' || el.type === 'animatedGrid') {
                    el.setupSize();
                }
            });
        });
        
        try {
            initElements();
            console.log('Art generator: Starting draw loop...');
            draw();
            
            // Auto-refresh every 6 seconds
            if (artRefreshInterval) {
                clearInterval(artRefreshInterval);
            }
            artRefreshInterval = setInterval(function() {
                if (artInitialized && artCanvas) {
                    console.log('Art generator: Auto-refreshing...');
                    regenerateArt();
                }
            }, 6000);
        } catch (error) {
            console.error('Art generator: Error during initialization:', error);
            artInitialized = false;
        }
    }
    
    // Check when section becomes active
    function checkAndInit() {
        const contentSection = document.querySelector('[data-content="creative-coding-1"]');
        if (contentSection && contentSection.classList.contains('active') && !artInitialized) {
            const canvas = document.getElementById('artCanvas');
            if (canvas) {
                // Check if canvas is actually visible
                const rect = canvas.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    console.log('Art generator: Canvas is visible, initializing...');
                    setTimeout(initArtGenerator, 100);
                } else {
                    console.log('Art generator: Canvas not visible yet, waiting...');
                    setTimeout(checkAndInit, 200);
                }
            } else {
                console.log('Art generator: Canvas element not found');
            }
        }
    }
    
    // Check immediately on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(checkAndInit, 200);
        });
    } else {
        setTimeout(checkAndInit, 200);
    }
    
    setInterval(checkAndInit, 500);
    
    document.addEventListener('click', function(e) {
        const clickedItem = e.target.closest('[data-subcategory]');
        if (clickedItem) {
            if (clickedItem.dataset.subcategory === 'creative-coding-1') {
                setTimeout(checkAndInit, 200);
            } else {
                // If clicking on a different subsection, stop the generator
                const contentSection = document.querySelector('[data-content="creative-coding-1"]');
                if (contentSection && !contentSection.classList.contains('active')) {
                    stopArtGenerator();
                }
            }
        }
    });
    
    // Also listen for when content becomes active/inactive via the existing script
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.hasAttribute('data-content') && target.getAttribute('data-content') === 'creative-coding-1') {
                    if (target.classList.contains('active')) {
                        setTimeout(checkAndInit, 100);
                    } else {
                        // Stop the generator completely when section becomes inactive
                        stopArtGenerator();
                    }
                } else if (target.hasAttribute('data-content')) {
                    // If any other content section becomes active, stop the generator
                    if (target.classList.contains('active')) {
                        const creativeCodingSection = document.querySelector('[data-content="creative-coding-1"]');
                        if (creativeCodingSection && !creativeCodingSection.classList.contains('active')) {
                            stopArtGenerator();
                        }
                    }
                }
            }
        });
    });
    
    // Observe all content sections to detect when creative-coding-1 becomes inactive
    setTimeout(function() {
        const contentDisplay = document.querySelector('.content-display');
        if (contentDisplay) {
            // Observe the parent container to catch all content section changes
            observer.observe(contentDisplay, { 
                attributes: true, 
                attributeFilter: ['class'],
                childList: false,
                subtree: true
            });
        }
        
        // Also observe the specific creative-coding-1 section
        const contentSection = document.querySelector('[data-content="creative-coding-1"]');
        if (contentSection) {
            observer.observe(contentSection, { attributes: true, attributeFilter: ['class'] });
        }
    }, 500);
})();
