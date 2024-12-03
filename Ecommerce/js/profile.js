// Profile page functionality
class ProfileManager {
    constructor() {
        this.initializeNavigation();
        this.initializeImageUpload();
        this.initializeFormHandling();
        this.initializeAddressManagement();
        this.initializeNotifications();
    }

    // Tab navigation
    initializeNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        const sections = document.querySelectorAll('main section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').slice(1);

                // Update navigation states
                navLinks.forEach(l => {
                    l.classList.remove('border-blue-600', 'text-blue-600');
                    l.classList.add('border-transparent', 'text-gray-500');
                });
                link.classList.add('border-blue-600', 'text-blue-600');
                link.classList.remove('border-transparent', 'text-gray-500');

                // Show/hide sections
                sections.forEach(section => {
                    section.classList.add('hidden');
                    if (section.id === targetId) {
                        section.classList.remove('hidden');
                        // Animate section entry
                        gsap.from(section, {
                            opacity: 0,
                            y: 20,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    }
                });

                // Update URL without page reload
                history.pushState(null, '', `#${targetId}`);
            });
        });

        // Handle initial load and browser back/forward
        this.handleInitialLoad();
        window.addEventListener('popstate', () => this.handleInitialLoad());
    }

    // Profile image upload
    initializeImageUpload() {
        const uploadButton = document.querySelector('.profile-image-upload');
        const profileImage = document.querySelector('.profile-image');

        if (uploadButton && profileImage) {
            uploadButton.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        try {
                            // Show loading state
                            uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                            
                            // Simulate upload delay
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // Update image preview
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                profileImage.src = e.target.result;
                                // Show success notification
                                this.showNotification('Profil rasmi muvaffaqiyatli yangilandi', 'success');
                            };
                            reader.readAsDataURL(file);
                        } catch (error) {
                            this.showNotification('Rasm yuklashda xatolik yuz berdi', 'error');
                        } finally {
                            uploadButton.innerHTML = '<i class="fas fa-camera"></i>';
                        }
                    }
                };
                
                input.click();
            });
        }
    }

    // Form handling
    initializeFormHandling() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const submitButton = form.querySelector('button[type="submit"]');
                
                try {
                    // Show loading state
                    submitButton.disabled = true;
                    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saqlanmoqda...';
                    
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Show success message
                    this.showNotification('Ma\'lumotlar muvaffaqiyatli saqlandi', 'success');
                } catch (error) {
                    this.showNotification('Xatolik yuz berdi', 'error');
                } finally {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Saqlash';
                }
            });
        });
    }

    // Address management
    initializeAddressManagement() {
        const addAddressButton = document.querySelector('.add-address-button');
        const addressContainer = document.querySelector('.addresses-container');

        if (addAddressButton && addressContainer) {
            addAddressButton.addEventListener('click', () => {
                this.showAddressModal();
            });

            // Delete address
            addressContainer.addEventListener('click', (e) => {
                if (e.target.closest('.delete-address')) {
                    const addressCard = e.target.closest('.address-card');
                    if (addressCard) {
                        this.showConfirmDialog(
                            'Manzilni o\'chirish',
                            'Haqiqatan ham bu manzilni o\'chirmoqchimisiz?',
                            () => {
                                gsap.to(addressCard, {
                                    opacity: 0,
                                    height: 0,
                                    marginBottom: 0,
                                    duration: 0.3,
                                    onComplete: () => {
                                        addressCard.remove();
                                        this.showNotification('Manzil o\'chirildi', 'success');
                                    }
                                });
                            }
                        );
                    }
                }
            });
        }
    }

    // Notifications settings
    initializeNotifications() {
        const toggles = document.querySelectorAll('.notification-toggle');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('change', async (e) => {
                const type = toggle.dataset.type;
                const enabled = e.target.checked;
                
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    this.showNotification(
                        `Bildirishnomalar ${enabled ? 'yoqildi' : 'o\'chirildi'}`,
                        'success'
                    );
                } catch (error) {
                    // Revert toggle state on error
                    e.target.checked = !enabled;
                    this.showNotification('Xatolik yuz berdi', 'error');
                }
            });
        });
    }

    // Utility functions
    handleInitialLoad() {
        const hash = window.location.hash || '#orders';
        const targetLink = document.querySelector(`nav a[href="${hash}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        gsap.from(notification, {
            x: 100,
            opacity: 0,
            duration: 0.3
        });
        
        setTimeout(() => {
            gsap.to(notification, {
                x: 100,
                opacity: 0,
                duration: 0.3,
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    showConfirmDialog(title, message, onConfirm) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        dialog.innerHTML = `
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div class="relative bg-white rounded-2xl p-6 max-w-sm w-full">
                <h3 class="text-xl font-semibold mb-2">${title}</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex justify-end space-x-4">
                    <button class="cancel-button px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Bekor qilish
                    </button>
                    <button class="confirm-button px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        O'chirish
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
        
        gsap.from(dialog.querySelector('.bg-white'), {
            scale: 0.9,
            opacity: 0,
            duration: 0.3
        });

        dialog.querySelector('.cancel-button').addEventListener('click', () => {
            gsap.to(dialog, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => dialog.remove()
            });
        });

        dialog.querySelector('.confirm-button').addEventListener('click', () => {
            onConfirm();
            dialog.remove();
        });
    }
}

// Profile Stats Animation
class ProfileStatsAnimation {
    constructor() {
        this.stats = document.querySelectorAll('.stats-number');
        this.initializeCountUp();
    }

    initializeCountUp() {
        this.stats.forEach(stat => {
            const targetValue = parseInt(stat.textContent);
            let currentValue = 0;
            const duration = 2000; // 2 seconds
            const increment = targetValue / (duration / 16); // 60fps

            const animate = () => {
                currentValue = Math.min(currentValue + increment, targetValue);
                stat.textContent = Math.round(currentValue).toLocaleString();

                if (currentValue < targetValue) {
                    requestAnimationFrame(animate);
                }
            };

            // Start animation when element is in viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animate();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(stat);
        });
    }
}

// Payment Methods Manager
class PaymentMethodsManager {
    constructor() {
        this.initializePaymentMethods();
    }

    initializePaymentMethods() {
        const addCardButton = document.querySelector('.add-card-button');
        if (addCardButton) {
            addCardButton.addEventListener('click', () => this.showAddCardModal());
        }

        // Delete card handlers
        document.querySelectorAll('.delete-card-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.card-item');
                if (card) {
                    this.showDeleteCardConfirmation(card);
                }
            });
        });
    }

    showAddCardModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div class="relative bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 class="text-xl font-semibold mb-6">Yangi karta qo'shish</h3>
                <form id="addCardForm" class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-600 mb-2">Karta raqami</label>
                        <input type="text" 
                               class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-600"
                               placeholder="0000 0000 0000 0000"
                               maxlength="19"
                               id="cardNumber">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm text-gray-600 mb-2">Muddati</label>
                            <input type="text" 
                                   class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-600"
                                   placeholder="MM/YY"
                                   maxlength="5"
                                   id="expiryDate">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-600 mb-2">CVV</label>
                            <input type="password" 
                                   class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-600"
                                   placeholder="***"
                                   maxlength="3"
                                   id="cvv">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" 
                                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                onclick="this.closest('.fixed').remove()">
                            Bekor qilish
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Qo'shish
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize card input formatting
        this.initializeCardInputs();
    }

    initializeCardInputs() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        
        // Format card number
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });

        // Format expiry date
        expiryDate.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });

        // Handle form submission
        const form = document.getElementById('addCardForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCardSubmission(form);
        });
    }

    async handleCardSubmission(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Qo\'shilmoqda...';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Show success message
            this.showNotification('Karta muvaffaqiyatli qo\'shildi', 'success');
            form.closest('.fixed').remove();

            // Refresh payment methods list
            this.refreshPaymentMethods();
        } catch (error) {
            this.showNotification('Xatolik yuz berdi', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    showDeleteCardConfirmation(card) {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        dialog.innerHTML = `
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div class="relative bg-white rounded-2xl p-6 max-w-sm w-full">
                <h3 class="text-xl font-semibold mb-2">Kartani o'chirish</h3>
                <p class="text-gray-600 mb-6">Haqiqatan ham bu kartani o'chirmoqchimisiz?</p>
                <div class="flex justify-end space-x-4">
                    <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onclick="this.closest('.fixed').remove()">
                        Bekor qilish
                    </button>
                    <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            id="confirmDelete">
                        O'chirish
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        document.getElementById('confirmDelete').addEventListener('click', async () => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                gsap.to(card, {
                    height: 0,
                    opacity: 0,
                    marginBottom: 0,
                    duration: 0.3,
                    onComplete: () => {
                        card.remove();
                        this.showNotification('Karta muvaffaqiyatli o\'chirildi', 'success');
                    }
                });

                dialog.remove();
            } catch (error) {
                this.showNotification('Xatolik yuz berdi', 'error');
            }
        });
    }

    refreshPaymentMethods() {
        // This would typically fetch updated data from the server
        // For now, we'll just simulate a refresh
        console.log('Payment methods refreshed');
    }

    showNotification(message, type) {
        // Reuse the notification system from the main ProfileManager class
        if (window.profileManager) {
            window.profileManager.showNotification(message, type);
        }
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.initializeTheme();
    }

    initializeTheme() {
        const themeButtons = document.querySelectorAll('[data-theme]');
        const savedTheme = localStorage.getItem('theme');

        // Set initial theme
        if (savedTheme) {
            this.setTheme(savedTheme);
        }

        // Theme button handlers
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                this.setTheme(theme);
                localStorage.setItem('theme', theme);
            });
        });
    }

    setTheme(theme) {
        const root = document.documentElement;
        const isDark = theme === 'dark' || 
                      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Update active state of theme buttons
        document.querySelectorAll('[data-theme]').forEach(button => {
            button.classList.toggle('ring-2', button.dataset.theme === theme);
        });
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
    new ProfileStatsAnimation();
    new PaymentMethodsManager();
    new ThemeManager();
}); 