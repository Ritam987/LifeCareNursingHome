// ===== GLOBAL VARIABLES =====
let currentRating = 0;
let isDarkMode = false;

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupSlider();
    setupCounters();
    setupSearch();
    setupTheme();
    setupScrollToTop();
    setCurrentYear();
    setupDateInput();
    setupImagePlaceholders();
}

// ===== NAVIGATION =====
function setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.getElementById('primary-navigation');
    const navOverlay = document.getElementById('nav-overlay');
    const body = document.body;
    
    function openNavMenu() {
        navLinks.classList.add('show');
        if (navOverlay) navOverlay.classList.add('show');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden'; // Prevent body scroll when menu is open
    }
    
    function closeNavMenu() {
        navLinks.classList.remove('show');
        if (navOverlay) navOverlay.classList.remove('show');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = ''; // Restore body scroll
    }
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeNavMenu();
            } else {
                openNavMenu();
            }
        });
        
        // Close menu when clicking overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', function(e) {
                e.stopPropagation();
                closeNavMenu();
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar') && !e.target.closest('.nav-links')) {
                closeNavMenu();
            }
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeNavMenu();
            });
        });
        
        // Close menu when clicking close button
        const navClose = navLinks.querySelector('.nav-close');
        if (navClose) {
            navClose.addEventListener('click', function(e) {
                e.stopPropagation();
                closeNavMenu();
            });
        }
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('show')) {
                closeNavMenu();
            }
        });
    }
}

// ===== SLIDER =====
function setupSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    
    if (sliderTrack) {
        sliderTrack.style.backfaceVisibility = 'hidden';
        sliderTrack.style.webkitBackfaceVisibility = 'hidden';
        
        let touchStartX = 0;
        
        sliderTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            sliderTrack.style.animationPlayState = 'paused';
        }, { passive: true });
        
        sliderTrack.addEventListener('touchend', (e) => {
            setTimeout(() => {
                sliderTrack.style.animationPlayState = 'running';
            }, 100);
        }, { passive: true });
        // pause slider on hover for desktop and add subtle scale animation on items
        sliderTrack.addEventListener('mouseenter', () => {
            sliderTrack.style.animationPlayState = 'paused';
            sliderTrack.querySelectorAll('.image-card').forEach(c => c.style.transform = 'translateY(-4px)');
        });
        sliderTrack.addEventListener('mouseleave', () => {
            sliderTrack.style.animationPlayState = 'running';
            sliderTrack.querySelectorAll('.image-card').forEach(c => c.style.transform = '');
        });
    }
}

// ===== COUNTERS =====
function setupCounters() {
    const counters = document.querySelectorAll('.count');
    
    const animateCount = (el) => {
        const target = Number(el.getAttribute('data-count')) || 0;
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();
        
        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.floor(start + (target - start) * progress);
            el.textContent = value.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    
    if (counters.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        
        counters.forEach(c => observer.observe(c));
    }
}

// ===== SEARCH FUNCTIONALITY =====
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    // Search in doctors
    const doctorCards = document.querySelectorAll('.doctor-card');
    let found = false;
    
    doctorCards.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const dept = card.getAttribute('data-dept').toLowerCase();
        
        if (name.includes(query) || dept.includes(query)) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.border = '3px solid #ffd700';
            setTimeout(() => {
                card.style.border = '';
            }, 3000);
            found = true;
            return;
        }
    });
    
    if (!found) {
        alert('No results found for: ' + query);
    }
}

// ===== DOCTOR FILTERS =====
function searchDoctors() {
    const searchInput = document.getElementById('doctorSearch');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    filterDoctors();
}

function filterDoctors() {
    const deptFilter = document.getElementById('deptFilter');
    const genderFilter = document.getElementById('genderFilter');
    const searchInput = document.getElementById('doctorSearch');
    
    const selectedDept = deptFilter ? deptFilter.value : 'all';
    const selectedGender = genderFilter ? genderFilter.value : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    
    const doctorCards = document.querySelectorAll('.doctor-card');
    
    doctorCards.forEach(card => {
        const dept = card.getAttribute('data-dept');
        const gender = card.getAttribute('data-gender');
        const name = card.getAttribute('data-name').toLowerCase();
        
        const deptMatch = selectedDept === 'all' || dept === selectedDept;
        const genderMatch = selectedGender === 'all' || gender === selectedGender;
        const searchMatch = !searchQuery || name.includes(searchQuery);
        
        if (deptMatch && genderMatch && searchMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterDoctorsByDept(department) {
    const deptFilter = document.getElementById('deptFilter');
    if (deptFilter) {
        deptFilter.value = department;
        filterDoctors();
        document.getElementById('doctors').scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== APPOINTMENTS =====
function bookAppointment(doctorName) {
    const appointmentDoctor = document.getElementById('appointmentDoctor');
    if (appointmentDoctor) {
        const options = appointmentDoctor.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].text.includes(doctorName)) {
                appointmentDoctor.selectedIndex = i;
                break;
            }
        }
    }
    document.getElementById('appointments').scrollIntoView({ behavior: 'smooth' });
}

function submitAppointment(event) {
    event.preventDefault();
    
    const name = document.getElementById('patientName').value;
    const phone = document.getElementById('patientPhone').value;
    const doctor = document.getElementById('appointmentDoctor').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    
    alert(`Appointment Request Submitted!\n\nPatient: ${name}\nDoctor: ${doctor}\nDate: ${date}\nTime: ${time}\n\nWe will call you at ${phone} to confirm.`);
    
    event.target.reset();
}

function emergencyConsultation() {
    if (confirm('Do you want to call our emergency number now?')) {
        window.location.href = 'tel:9002058828';
    }
}

function viewDoctorProfile(doctorName) {
    alert(`Viewing profile for ${doctorName}\n\nDetailed doctor profiles coming soon!`);
}

// ===== GALLERY =====
function showGalleryTab(tab) {
    const photosGallery = document.getElementById('photosGallery');
    const videosGallery = document.getElementById('videosGallery');
    const tabs = document.querySelectorAll('.gallery-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'photos') {
        photosGallery.style.display = 'grid';
        videosGallery.style.display = 'none';
    } else {
        photosGallery.style.display = 'none';
        videosGallery.style.display = 'block';
    }
}

function openLightbox(index) {
    alert('Lightbox feature coming soon!\nImage index: ' + index);
}

// ===== LOGIN MODAL =====
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showLoginTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.login-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function handleLogin(event) {
    event.preventDefault();
    alert('Login functionality will be implemented with backend integration.');
    closeLoginModal();
}

function handleRegister(event) {
    event.preventDefault();
    alert('Registration successful! Admin will review your account for approval.');
    closeLoginModal();
}

function googleLogin() {
    alert('Google Sign-In will be integrated with Google OAuth.');
}

// ===== REVIEW MODAL =====
function openReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentRating = 0;
        updateStarRating();
    }
}

function setRating(rating) {
    currentRating = rating;
    updateStarRating();
}

function updateStarRating() {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
        if (index < currentRating) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

function submitReview(event) {
    event.preventDefault();
    
    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }
    
    alert(`Thank you for your ${currentRating}-star review!\nYour feedback will be reviewed by our admin before publishing.`);
    closeReviewModal();
}

// ===== THEME TOGGLE =====
function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        isDarkMode = true;
        updateThemeIcon();
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}



// ===== SCROLL REVEAL =====
function setupScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    if (!revealEls.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => obs.observe(el));
}

// Hook scroll reveal after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // small timeout so CSS is parsed
    setTimeout(setupScrollReveal, 120);
});

// ===== SCROLL TO TOP =====
function setupScrollToTop() {
    const btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;

    // Show/hide after 200px
    function checkScroll() {
        if (window.pageYOffset > 200) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    // Smooth scroll to top
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            // Fallback for very old browsers
            window.scrollTo(0, 0);
        }
    });

    // Passive scroll listener
    window.addEventListener('scroll', checkScroll, { passive: true });

    // Initial check in case page is already scrolled
    checkScroll();
}



// ===== UTILITY FUNCTIONS =====
function setCurrentYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

function setupDateInput() {
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

// ===== HANDLE MISSING IMAGES =====
function setupImagePlaceholders() {
    // Handle doctor images
    const doctorImages = document.querySelectorAll('.doctor-image img');
    doctorImages.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = this.parentElement;
            if (!placeholder.querySelector('.image-placeholder-text')) {
                const text = document.createElement('div');
                text.className = 'image-placeholder-text';
                text.textContent = 'Add Doctor Photo';
                text.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-light); font-size: 13px; opacity: 0.5; pointer-events: none; z-index: 1;';
                placeholder.appendChild(text);
            }
        });
    });
    
    // Handle gallery images
    const galleryImages = document.querySelectorAll('.gallery-item img');
    galleryImages.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = this.parentElement;
            if (!placeholder.querySelector('.image-placeholder-text')) {
                const text = document.createElement('div');
                text.className = 'image-placeholder-text';
                text.textContent = 'Add Gallery Image';
                text.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-light); font-size: 13px; opacity: 0.5; pointer-events: none; z-index: 1;';
                placeholder.appendChild(text);
            }
        });
    });
    
    // Handle blog images
    const blogImages = document.querySelectorAll('.blog-image img');
    blogImages.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const placeholder = this.parentElement;
            if (!placeholder.querySelector('.image-placeholder-text')) {
                const text = document.createElement('div');
                text.className = 'image-placeholder-text';
                text.textContent = 'Add Blog Image';
                text.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-light); font-size: 13px; opacity: 0.5; pointer-events: none; z-index: 1;';
                placeholder.appendChild(text);
            }
        });
    });
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});
