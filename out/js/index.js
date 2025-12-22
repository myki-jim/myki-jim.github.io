// Glass Theme JavaScript - 1:1 replication of React functionality

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initLiquidBubbles();
    initThemeToggle();
    initNavigation();
    initGlassEffects();
    initPageTransitions();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.addListener((e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update theme toggle icons
    const darkIcon = document.querySelector('.theme-icon-dark');
    const lightIcon = document.querySelector('.theme-icon-light');

    if (darkIcon && lightIcon) {
        if (theme === 'dark') {
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
        } else {
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        }
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);

            // Add rotation animation
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
            }, 300);
        });
    }
}

// Liquid Background Animation - 1:1 from React component
function initLiquidBubbles() {
    // Liquid bubbles are already in HTML, just need to animate them
    const bubbles = document.querySelectorAll('.liquid-bubble');

    bubbles.forEach((bubble, index) => {
        animateBubble(bubble, index);
    });
}

function animateBubble(bubble, index) {
    const duration = 15000 + (index * 2000);
    const amplitude = 30 + (index * 10);
    let startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;

        const x = Math.sin(progress * Math.PI * 2) * amplitude;
        const y = Math.cos(progress * Math.PI * 2) * amplitude;
        const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;

        bubble.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

        requestAnimationFrame(animate);
    }

    animate();
}

// Glass Effects - Interactive hover like in React
function initGlassEffects() {
    const glassElements = document.querySelectorAll('.glass-surface');

    glassElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            const rotateX = deltaY * 5;
            const rotateY = deltaX * 5;

            element.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            element.style.boxShadow = `0 20px 40px rgba(34, 211, 238, 0.3)`;
        });

        element.addEventListener('mouseleave', function() {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            element.style.boxShadow = '';
        });

        element.addEventListener('mousemove', function(e) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            const rotateX = deltaY * 5;
            const rotateY = deltaX * 5;

            element.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
    });
}

// Page Transitions - Framer Motion style
function initPageTransitions() {
    const mainContent = document.querySelector('main') || document.body;

    // Add fade-in effect
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(20px)';

    setTimeout(() => {
        mainContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateY(0)';
    }, 100);

    // Add page exit animations for navigation links
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip external links and anchors
            if (this.hostname !== window.location.hostname || this.getAttribute('href').startsWith('#')) {
                return;
            }

            e.preventDefault();

            // Fade out effect
            document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            document.body.style.opacity = '0';
            document.body.style.transform = 'scale(0.98)';

            setTimeout(() => {
                window.location.href = this.getAttribute('href');
            }, 300);
        });
    });
}

// Navigation - MagicNavbar functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a[href]');

    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.textShadow = '0 4px 12px rgba(34, 211, 238, 0.3)';
        });

        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.textShadow = 'none';
        });
    });
}

// Intersection Observer for animations - like AnimatePresence
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.glass-surface').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Initialize scroll animations
initScrollAnimations();

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScroll = debounce(() => {
    // Scroll-related optimizations can go here
}, 16);

window.addEventListener('scroll', optimizedScroll);

// Theme color meta tag for mobile browsers
function updateThemeColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme === 'dark' ? '#0f1116' : '#cbd5e1';

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = color;
}

// Update theme color on theme change
const originalSetTheme = setTheme;
setTheme = function(theme) {
    originalSetTheme(theme);
    updateThemeColor();
};

// Initialize theme color
updateThemeColor();