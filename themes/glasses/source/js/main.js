// Glasses Theme Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  initTheme();

  // Initialize components
  initThemeToggle();
  initBackToTop();
  initLiquidAnimation();
  initGlassEffects();
  initPageTransitions();

  // Initialize reading progress if enabled
  if (document.querySelector('.post-content')) {
    initReadingProgress();
  }
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    setTheme(savedTheme);
  } else if (systemDark) {
    setTheme('dark');
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);

    // Add animation
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      themeToggle.style.transform = 'rotate(0deg)';
    }, 300);
  });
}

// Back to Top Button
function initBackToTop() {
  const backToTop = document.getElementById('back-to-top');
  if (!backToTop) return;

  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Liquid Animation
function initLiquidAnimation() {
  const bubbles = document.querySelectorAll('.liquid-bubble');

  bubbles.forEach((bubble, index) => {
    // Add random movement
    animateBubble(bubble, index);
  });
}

function animateBubble(bubble, index) {
  const duration = 15000 + (index * 2000);
  let startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed % duration) / duration;

    // Create smooth floating motion
    const x = Math.sin(progress * Math.PI * 2) * 100;
    const y = Math.cos(progress * Math.PI * 2) * 100;
    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;

    bubble.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;

    requestAnimationFrame(animate);
  }

  animate();
}

// Glass Effects
function initGlassEffects() {
  // Add interactive glass effect on mouse move
  document.addEventListener('mousemove', function(e) {
    const glassElements = document.querySelectorAll('.glass-surface');
    const x = e.clientX;
    const y = e.clientY;

    glassElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementX = rect.left + rect.width / 2;
      const elementY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(x - elementX, 2) + Math.pow(y - elementY, 2)
      );

      if (distance < 200) {
        const intensity = 1 - (distance / 200);
        const glow = intensity * 0.3;

        element.style.boxShadow = `0 8px 32px rgba(34, 211, 238, ${glow})`;
      }
    });
  });
}

// Page Transitions
function initPageTransitions() {
  // Add transition class to internal links
  const links = document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      // Skip if it's external link or has special attributes
      if (link.hostname !== window.location.hostname ||
          link.getAttribute('target') === '_blank' ||
          link.getAttribute('rel') === 'noopener') {
        return;
      }

      e.preventDefault();

      // Add fade out effect
      document.body.style.opacity = '0';
      document.body.style.transform = 'scale(0.95)';

      setTimeout(() => {
        window.location.href = link.href;
      }, 300);
    });
  });

  // Add fade in effect on page load
  setTimeout(() => {
    document.body.style.opacity = '1';
    document.body.style.transform = 'scale(1)';
  }, 100);
}

// Reading Progress
function initReadingProgress() {
  const postContent = document.querySelector('.post-content');
  if (!postContent) return;

  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  progressBar.innerHTML = `
    <div class="reading-progress-bar"></div>
    <div class="reading-progress-text">0%</div>
  `;

  document.body.appendChild(progressBar);

  const progressBarInner = progressBar.querySelector('.reading-progress-bar');
  const progressText = progressBar.querySelector('.reading-progress-text');

  // Update progress on scroll
  function updateProgress() {
    const contentHeight = postContent.offsetHeight;
    const contentTop = postContent.offsetTop;
    const windowHeight = window.innerHeight;
    const windowTop = window.pageYOffset;

    const readingPosition = windowTop - contentTop + windowHeight;
    const readingProgress = Math.min(100, Math.max(0, (readingPosition / contentHeight) * 100));

    progressBarInner.style.width = readingProgress + '%';
    progressText.textContent = Math.round(readingProgress) + '%';

    // Hide/show progress bar based on position
    if (windowTop > contentTop - windowHeight) {
      progressBar.style.opacity = '1';
    } else {
      progressBar.style.opacity = '0';
    }
  }

  window.addEventListener('scroll', updateProgress);
  updateProgress();

  // Add styles for progress bar
  const style = document.createElement('style');
  style.textContent = `
    .reading-progress {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .reading-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-color), var(--secondary-color));
      transition: width 0.2s ease;
    }

    .reading-progress-text {
      position: fixed;
      top: 10px;
      right: 20px;
      color: var(--text-secondary);
      font-size: 0.8rem;
      z-index: 10000;
      background: var(--glass-surface);
      backdrop-filter: blur(10px);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--glass-border);
    }
  `;
  document.head.appendChild(style);
}

// Search functionality (if enabled)
function initSearch() {
  const searchToggle = document.getElementById('search-toggle');
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchToggle || !searchModal) return;

  // Open search modal
  searchToggle.addEventListener('click', function() {
    searchModal.style.display = 'flex';
    searchInput.focus();
  });

  // Close search modal
  searchModal.addEventListener('click', function(e) {
    if (e.target === searchModal) {
      searchModal.style.display = 'none';
    }
  });

  // Search on input
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    performSearch(query);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchModal.style.display = 'flex';
      searchInput.focus();
    }

    // Escape to close search
    if (e.key === 'Escape' && searchModal.style.display === 'flex') {
      searchModal.style.display = 'none';
    }
  });
}

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
  if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
});

// Intersection Observer for animations
function initIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements that should animate on scroll
  const animatedElements = document.querySelectorAll('.post-card, .archive-item, .glass-surface');
  animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
  });
}

// Initialize intersection observer
initIntersectionObserver();

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

// Debounce scroll events for better performance
const debouncedScroll = debounce(function() {
  // Scroll-related functionality that doesn't need to run on every pixel
}, 16); // ~60fps

window.addEventListener('scroll', debouncedScroll);

// Preload critical resources
function preloadResources() {
  const criticalResources = [
    '/css/style.css',
    '/js/main.js'
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = url.endsWith('.css') ? 'style' : 'script';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Initialize preloading
preloadResources();

// Service Worker registration for offline support (if available)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('SW registered: ', registration);
      })
      .catch(function(registrationError) {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Export functions for external use
window.GlassesTheme = {
  setTheme,
  initSearch,
  animateBubble
};