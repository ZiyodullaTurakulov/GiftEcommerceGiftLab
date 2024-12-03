// Asosiy o'zgaruvchilar
const ANIMATION_DURATION = 0.8;
const MOBILE_BREAKPOINT = 768;

// Swiper sliderlar inizializatsiyasi
const initializeSwiper = () => {
    // Testimonials slider
    const testimonialsSwiper = new Swiper('.testimonials-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 }
        },
        on: {
            init: function() {
                animateSlides(this.slides);
            },
            slideChange: function() {
                animateSlides(this.slides);
            }
        }
    });

    // Hero slider
    const heroSwiper = new Swiper('.hero-swiper', {
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.hero-pagination',
            clickable: true,
        }
    });
};

// GSAP animatsiyalari
const initializeAnimations = () => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero section animatsiyasi
    gsap.from(".hero-content", {
        opacity: 0,
        y: 100,
        duration: ANIMATION_DURATION,
        ease: "power3.out"
    });

    // Kategoriyalar animatsiyasi
    gsap.from(".category-card", {
        scrollTrigger: {
            trigger: ".category-card",
            start: "top bottom",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 50,
        duration: ANIMATION_DURATION,
        stagger: 0.2
    });

    // Mahsulotlar animatsiyasi
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top bottom",
                toggleActions: "play none none reverse"
            },
            opacity: 0,
            y: 50,
            duration: ANIMATION_DURATION,
            delay: index * 0.1
        });
    });
};

// Lazy loading images
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('fade-in');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

// Cart functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.updateCartUI();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.updateStorage();
        this.updateCartUI();
        this.showNotification('Mahsulot savatchaga qo\'shildi');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.updateStorage();
        this.updateCartUI();
        this.showNotification('Mahsulot savatchadan olib tashlandi');
    }

    updateStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Search functionality with debounce
const initializeSearch = () => {
    const searchInput = document.querySelector('#searchInput');
    const searchResults = document.querySelector('#searchResults');
    
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const performSearch = async (term) => {
        if (term.length < 3) {
            searchResults.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`/api/search?q=${term}`);
            const data = await response.json();
            updateSearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const updateSearchResults = (results) => {
        searchResults.innerHTML = results.map(result => `
            <div class="p-2 hover:bg-gray-100 cursor-pointer">
                <div class="flex items-center">
                    <img src="${result.image}" alt="${result.name}" class="w-12 h-12 object-cover rounded">
                    <div class="ml-3">
                        <div class="font-medium">${result.name}</div>
                        <div class="text-sm text-gray-600">${result.price}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        searchResults.classList.remove('hidden');
    };

    if (searchInput) {
        searchInput.addEventListener('input', debounce(e => performSearch(e.target.value), 300));
        document.addEventListener('click', e => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }
};

// Mobile menu
const initializeMobileMenu = () => {
    const mobileMenuButton = document.querySelector('#mobileMenuButton');
    const mobileMenu = document.querySelector('#mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('translate-x-0');
            
            mobileMenu.classList.toggle('translate-x-0');
            mobileMenu.classList.toggle('translate-x-full');
            document.body.classList.toggle('overflow-hidden');
            
            // Animatsiya
            gsap.to(mobileMenu, {
                x: isOpen ? '100%' : '0%',
                duration: 0.3,
                ease: "power2.inOut"
            });
        });
    }
};

// Kategoriyalar Swiper inizializatsiyasi
const initializeCategoriesSwiper = () => {
    const categoriesSwiper = new Swiper('.categories-swiper', {
        slidesPerView: 1.2,
        spaceBetween: 16,
        centeredSlides: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 1.2,
                spaceBetween: 16,
            },
            480: {
                slidesPerView: 2.2,
                spaceBetween: 20,
            },
            640: {
                slidesPerView: 2.5,
                spaceBetween: 24,
            }
        }
    });
};

// Responsive handling for categories
const handleCategoriesResponsive = () => {
    const width = window.innerWidth;
    const categoriesSwiper = document.querySelector('.categories-swiper');
    const categoriesGrid = document.querySelector('.categories-grid');
    
    if (width < 768) { // Mobile view
        if (categoriesSwiper) {
            categoriesSwiper.classList.remove('hidden');
        }
        if (categoriesGrid) {
            categoriesGrid.classList.add('hidden');
        }
    } else { // Desktop view
        if (categoriesSwiper) {
            categoriesSwiper.classList.add('hidden');
        }
        if (categoriesGrid) {
            categoriesGrid.classList.remove('hidden');
        }
    }
};

// Search modal functionality
function toggleSearch() {
    const searchModal = document.getElementById('searchModal');
    const searchInput = searchModal.querySelector('input');
    
    if (searchModal.classList.contains('hidden')) {
        // Open search
        searchModal.classList.remove('hidden');
        setTimeout(() => searchInput.focus(), 100);
        document.body.classList.add('overflow-hidden');
        
        // Animation
        gsap.fromTo(searchModal.querySelector('.bg-white'), {
            y: -100,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: "power3.out"
        });
    } else {
        // Close search
        gsap.to(searchModal.querySelector('.bg-white'), {
            y: -100,
            opacity: 0,
            duration: 0.3,
            ease: "power3.in",
            onComplete: () => {
                searchModal.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }
}

// Handle bottom navigation active states
function handleBottomNavigation() {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    const currentPath = window.location.pathname;

    navItems.forEach(item => {
        const link = item.getAttribute('href');
        if (currentPath === link) {
            item.classList.add('active');
        }
    });
}

// Handle scroll behavior for bottom navigation
let lastScrollTop = 0;
const bottomNav = document.querySelector('.mobile-bottom-nav');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down - hide bottom nav
        gsap.to(bottomNav, {
            y: '100%',
            duration: 0.3,
            ease: "power3.inOut"
        });
    } else {
        // Scrolling up - show bottom nav
        gsap.to(bottomNav, {
            y: '0%',
            duration: 0.3,
            ease: "power3.inOut"
        });
    }
    
    lastScrollTop = scrollTop;
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeSwiper();
    initializeAnimations();
    lazyLoadImages();
    initializeSearch();
    initializeMobileMenu();
    
    // Initialize shopping cart
    window.cart = new ShoppingCart();
    
    // Handle smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    initializeCategoriesSwiper();
    handleCategoriesResponsive();
    
    // Add resize listener for categories
    window.addEventListener('resize', debounce(() => {
        handleCategoriesResponsive();
    }, 250));
    
    handleBottomNavigation();
    
    // Add active state to bottom nav items on click
    const navItems = document.querySelectorAll('.mobile-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
});

// Handle resize events
window.addEventListener('resize', debounce(() => {
    handleResponsive();
}, 250));