/* ============================================
   VALENCE DERGISI — MAIN SCRIPT
   Loader, Particles, Animations, Video
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const loader  = document.getElementById('loader');
    const canvas  = document.getElementById('particleCanvas');
    const reveals = document.querySelectorAll('.reveal');
    const fadeUps = document.querySelectorAll('.fade-up');
    const bgVideo = document.getElementById('bgVideo');

    // Ensure video plays muted (some browsers need this)
    if (bgVideo) {
        bgVideo.muted = true;
        bgVideo.play().catch(() => {});
    }

    // ==========================================
    // 1. LOADER — quick & elegant, then reveal
    // ==========================================
    const LOADER_DURATION = 1800; // shorter, not forced

    setTimeout(() => {
        loader.classList.add('fade-out');
        document.body.classList.remove('loading');

        setTimeout(() => {
            loader.style.display = 'none';
            reveals.forEach(el => el.classList.add('active'));
            canvas.classList.add('visible');
        }, 900);
    }, LOADER_DURATION);


    // ==========================================
    // 2. PARTICLE SYSTEM — subtle white dots
    // ==========================================
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    const PARTICLE_COUNT = 45;
    const CONNECTION_DIST = 130;

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.x  = Math.random() * canvas.width;
            this.y  = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 1.2 + 0.3;
            this.opacity = Math.random() * 0.25 + 0.05;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;

            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    this.vx += dx * 0.0002;
                    this.vy += dy * 0.0002;
                }
            }

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0.6) {
                this.vx *= 0.97;
                this.vy *= 0.97;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.04;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();


    // ==========================================
    // 3. SCROLL ANIMATIONS
    // ==========================================
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    fadeUps.forEach(el => scrollObserver.observe(el));


    // ==========================================
    // 4. 3D UI TRACKING & GLOW PARALLAX
    // ==========================================
    const heroContent = document.querySelector('.hero-content');
    const hero        = document.getElementById('hero');
    const glows       = document.querySelectorAll('.ambient-glow');

    if (hero && heroContent) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // 3D Tilt Calculation
            const tiltX = ((mouseY - cy) / cy) * -8; // Max 8 deg
            const tiltY = ((mouseX - cx) / cx) * 8;  // Max 8 deg

            heroContent.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

            // Deep Parallax for internal elements
            const logo = document.getElementById('brandLogo');
            if (logo) {
                const ox = (mouseX - cx) / cx;
                const oy = (mouseY - cy) / cy;
                // Preserve the Z-depth from CSS but add XY parallax
                logo.style.transform = `translate3d(${ox * 15}px, ${oy * 15}px, 50px)`;
            }

            // Glow Tracking - slow, organic reaction
            glows.forEach((glow, index) => {
                const factor = (index + 1) * 20;
                const gx = ((mouseX - cx) / cx) * factor;
                const gy = ((mouseY - cy) / cy) * factor;
                glow.style.transform = `translate(${gx}px, ${gy}px)`;
            });
        });

        hero.addEventListener('mouseleave', () => {
            heroContent.style.transform = 'rotateX(0) rotateY(0)';
            heroContent.style.transition = 'transform 0.8s ease';
            const logo = document.getElementById('brandLogo');
            if (logo) {
                logo.style.transform = 'translate3d(0,0,50px)';
                logo.style.transition = 'transform 0.8s ease';
            }
            
            setTimeout(() => { 
                heroContent.style.transition = ''; 
                if(logo) logo.style.transition = '';
            }, 800);
        });
    }


    // ==========================================
    // 5. SCROLL INDICATOR CLICK
    // ==========================================
    const scrollIndicator = document.getElementById('scrollIndicator');
    const aboutSection    = document.getElementById('aboutSection');

    if (scrollIndicator && aboutSection) {
        scrollIndicator.addEventListener('click', () => {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        });
    }


    // ==========================================
    // 6. HERO PARALLAX on scroll
    // ==========================================
    // ==========================================
    // 7. MODAL LOGIC
    // ==========================================
    const ctaBtn       = document.getElementById('ctaBtn');
    const featureModal = document.getElementById('featureModal');
    const modalClose   = document.getElementById('modalClose');

    if (ctaBtn && featureModal) {
        ctaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            featureModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        });

        const closeModal = () => {
            featureModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        modalClose.addEventListener('click', closeModal);
        
        featureModal.addEventListener('click', (e) => {
            if (e.target === featureModal) closeModal();
        });

        // Close on ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && featureModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

});
