(function() {
    'use strict';

    window.__app = window.__app || {};

    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    function initBurgerMenu() {
        if (__app.burgerInited) return;
        __app.burgerInited = true;

        var toggle = document.querySelector('.navbar-toggler');
        var collapse = document.querySelector('.navbar-collapse');
        var nav = document.querySelector('.navbar');
        var navLinks = document.querySelectorAll('.nav-link');
        var body = document.body;

        if (!toggle || !collapse) return;

        collapse.style.height = '0';
        collapse.style.overflow = 'hidden';
        collapse.style.transition = 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

        function closeMenu() {
            collapse.style.height = '0';
            toggle.setAttribute('aria-expanded', 'false');
            collapse.classList.remove('show');
            body.classList.remove('u-no-scroll');
        }

        function openMenu() {
            collapse.style.height = 'calc(100vh - var(--header-h))';
            toggle.setAttribute('aria-expanded', 'true');
            collapse.classList.add('show');
            body.classList.add('u-no-scroll');
        }

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            var isOpen = toggle.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });

        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && toggle.getAttribute('aria-expanded') === 'true') {
                closeMenu();
            }
        });

        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', function() {
                closeMenu();
            });
        }

        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth >= 992) {
                closeMenu();
            }
        }, 250));
    }

    function initScrollEffects() {
        if (__app.scrollEffectsInited) return;
        __app.scrollEffectsInited = true;

        var animatedElements = document.querySelectorAll('.card, .c-card, img, .hero-section, .l-section');
        
        if ('IntersectionObserver' in window) {
            var observerOptions = {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.1
            };

            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            animatedElements.forEach(function(el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                observer.observe(el);
            });
        }
    }

    function initMicroInteractions() {
        if (__app.microInteractionsInited) return;
        __app.microInteractionsInited = true;

        var interactiveElements = document.querySelectorAll('.btn, .c-button, .nav-link, .card, .c-card, a:not(.nav-link)');

        interactiveElements.forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });

            el.addEventListener('click', function(e) {
                var ripple = document.createElement('span');
                var rect = this.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                var x = e.clientX - rect.left - size / 2;
                var y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.5);width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;';

                if (!document.getElementById('ripple-style')) {
                    var style = document.createElement('style');
                    style.id = 'ripple-style';
                    style.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0;}}';
                    document.head.appendChild(style);
                }

                var parent = this;
                var originalPosition = parent.style.position;
                if (getComputedStyle(parent).position === 'static') {
                    parent.style.position = 'relative';
                }
                parent.style.overflow = 'hidden';

                parent.appendChild(ripple);
                setTimeout(function() {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                    if (originalPosition === '') {
                        parent.style.position = '';
                    }
                }, 600);
            });
        });
    }

    function initSmoothScroll() {
        if (__app.smoothScrollInited) return;
        __app.smoothScrollInited = true;

        var header = document.querySelector('.l-header');
        
        function getHeaderHeight() {
            return header ? header.offsetHeight : 80;
        }

        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) return;

            var href = link.getAttribute('href');
            if (href === '#' || href === '#!') return;

            var targetId = href.replace('#', '');
            var target = document.getElementById(targetId);

            if (target) {
                e.preventDefault();
                var headerHeight = getHeaderHeight();
                var targetPosition = target.offsetTop - headerHeight;

                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        });
    }

    function initScrollSpy() {
        if (__app.scrollSpyInited) return;
        __app.scrollSpyInited = true;

        var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        var sections = [];

        navLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && href !== '#' && href !== '#!') {
                var targetId = href.replace('#', '');
                var section = document.getElementById(targetId);
                if (section) {
                    sections.push({ link: link, section: section });
                }
            }
        });

        if (sections.length === 0) return;

        var header = document.querySelector('.l-header');
        var headerHeight = header ? header.offsetHeight : 80;

        function updateActiveLink() {
            var scrollPosition = window.scrollY + headerHeight + 100;

            sections.forEach(function(item) {
                var sectionTop = item.section.offsetTop;
                var sectionBottom = sectionTop + item.section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    navLinks.forEach(function(l) {
                        l.classList.remove('active');
                        l.removeAttribute('aria-current');
                    });
                    item.link.classList.add('active');
                    item.link.setAttribute('aria-current', 'page');
                }
            });
        }

        window.addEventListener('scroll', throttle(updateActiveLink, 100));
        updateActiveLink();
    }

    function initFormValidation() {
        if (__app.formValidationInited) return;
        __app.formValidationInited = true;

        var forms = document.querySelectorAll('form.c-form, form.needs-validation');

        var patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\d\s\+\-\(\)]{10,20}$/,
            name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
            message: /^.{10,}$/
        };

        var errorMessages = {
            firstName: 'Bitte geben Sie einen gültigen Vornamen ein (2-50 Zeichen).',
            lastName: 'Bitte geben Sie einen gültigen Nachnamen ein (2-50 Zeichen).',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            phone: 'Bitte geben Sie eine gültige Telefonnummer ein.',
            message: 'Die Nachricht muss mindestens 10 Zeichen lang sein.',
            privacy: 'Sie müssen die Datenschutzbestimmungen akzeptieren.',
            required: 'Dieses Feld ist erforderlich.'
        };

        function escapeHtml(text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }

        function showError(field, message) {
            field.classList.add('is-invalid');
            var feedback = field.parentNode.querySelector('.invalid-feedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                field.parentNode.appendChild(feedback);
            }
            feedback.textContent = message;
            feedback.style.display = 'block';
        }

        function clearError(field) {
            field.classList.remove('is-invalid');
            var feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.style.display = 'none';
            }
        }

        function validateField(field) {
            var value = field.value.trim();
            var fieldName = field.name || field.id;
            var isValid = true;

            clearError(field);

            if (field.hasAttribute('required') && !value) {
                showError(field, errorMessages.required);
                return false;
            }

            if (value) {
                if (fieldName === 'firstName' || fieldName === 'lastName') {
                    if (!patterns.name.test(value)) {
                        showError(field, errorMessages[fieldName]);
                        isValid = false;
                    }
                } else if (fieldName === 'email') {
                    if (!patterns.email.test(value)) {
                        showError(field, errorMessages.email);
                        isValid = false;
                    }
                } else if (fieldName === 'phone') {
                    if (!patterns.phone.test(value)) {
                        showError(field, errorMessages.phone);
                        isValid = false;
                    }
                } else if (fieldName === 'message') {
                    if (!patterns.message.test(value)) {
                        showError(field, errorMessages.message);
                        isValid = false;
                    }
                }
            }

            if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                showError(field, errorMessages[fieldName] || errorMessages.required);
                isValid = false;
            }

            return isValid;
        }

        forms.forEach(function(form) {
            var fields = form.querySelectorAll('input, textarea, select');
            
            fields.forEach(function(field) {
                field.addEventListener('blur', function() {
                    validateField(this);
                });

                field.addEventListener('input', debounce(function() {
                    if (this.classList.contains('is-invalid')) {
                        validateField(this);
                    }
                }, 300));
            });

            form.addEventListener('submit', function(e) {
                e.preventDefault();

                var isFormValid = true;
                fields.forEach(function(field) {
                    if (!validateField(field)) {
                        isFormValid = false;
                    }
                });

                if (!isFormValid) {
                    var firstInvalid = form.querySelector('.is-invalid');
                    if (firstInvalid) {
                        firstInvalid.focus();
                    }
                    return;
                }

                var submitBtn = form.querySelector('[type="submit"]');
                var originalText = submitBtn ? submitBtn.innerHTML : '';
                
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
                }

                setTimeout(function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }

                    if (typeof window.showNotification === 'function') {
                        window.showNotification('Nachricht erfolgreich gesendet!', 'success');
                    } else {
                        alert('Nachricht erfolgreich gesendet!');
                    }

                    form.reset();
                    fields.forEach(function(field) {
                        clearError(field);
                    });

                    window.location.href = 'thank_you.html';
                }, 1500);
            });
        });
    }

    function initScrollToTop() {
        if (__app.scrollToTopInited) return;
        __app.scrollToTopInited = true;

        var btn = document.createElement('button');
        btn.innerHTML = '↑';
        btn.className = 'scroll-to-top';
        btn.setAttribute('aria-label', 'Nach oben scrollen');
        btn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:var(--color-primary);color:#fff;border:none;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease-in-out;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,0.15);';

        document.body.appendChild(btn);

        window.addEventListener('scroll', throttle(function() {
            if (window.scrollY > 300) {
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
            } else {
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
            }
        }, 100));

        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) translateY(-3px)';
            this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
    }

    function initCountUp() {
        if (__app.countUpInited) return;
        __app.countUpInited = true;

        var counters = document.querySelectorAll('[data-count]');
        
        if (counters.length === 0) return;

        function animateCount(element) {
            var target = parseInt(element.getAttribute('data-count'), 10);
            var duration = 2000;
            var start = 0;
            var startTime = null;

            function step(currentTime) {
                if (!startTime) startTime = currentTime;
                var progress = Math.min((currentTime - startTime) / duration, 1);
                var value = Math.floor(progress * target);
                element.textContent = value.toLocaleString('de-DE');
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    element.textContent = target.toLocaleString('de-DE');
                }
            }

            requestAnimationFrame(step);
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                        entry.target.classList.add('counted');
                        animateCount(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(function(counter) {
                observer.observe(counter);
            });
        }
    }

    function initPrivacyModal() {
        if (__app.privacyModalInited) return;
        __app.privacyModalInited = true;

        var privacyLinks = document.querySelectorAll('a[href*="privacy"]');
        
        privacyLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#privacy' || this.getAttribute('href') === 'privacy.html') {
                    e.preventDefault();
                    
                    var modal = document.createElement('div');
                    modal.className = 'privacy-modal';
                    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;animation:fadeIn 0.3s ease-out;';

                    var modalContent = document.createElement('div');
                    modalContent.style.cssText = 'background:#fff;padding:32px;border-radius:16px;max-width:600px;max-height:80vh;overflow-y:auto;position:relative;animation:slideUp 0.3s ease-out;';
                    modalContent.innerHTML = '<h3>Datenschutzbestimmungen</h3><p>Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.</p><button class="btn btn-primary" style="margin-top:20px;">Schließen</button>';

                    modal.appendChild(modalContent);
                    document.body.appendChild(modal);

                    if (!document.getElementById('modal-animations')) {
                        var style = document.createElement('style');
                        style.id = 'modal-animations';
                        style.textContent = '@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}@keyframes slideUp{from{transform:translateY(30px);opacity:0;}to{transform:translateY(0);opacity:1;}}';
                        document.head.appendChild(style);
                    }

                    var closeBtn = modalContent.querySelector('button');
                    closeBtn.addEventListener('click', function() {
                        modal.style.animation = 'fadeOut 0.3s ease-out';
                        setTimeout(function() {
                            if (modal.parentNode) {
                                document.body.removeChild(modal);
                            }
                        }, 300);
                    });

                    modal.addEventListener('click', function(e) {
                        if (e.target === modal) {
                            closeBtn.click();
                        }
                    });
                }
            });
        });
    }

    function initNotificationSystem() {
        if (__app.notificationInited) return;
        __app.notificationInited = true;

        var container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;';
        document.body.appendChild(container);

        window.showNotification = function(message, type) {
            type = type || 'info';
            var colorMap = {
                success: '#34C759',
                error: '#FF3B30',
                warning: '#FF9500',
                info: '#5AC8FA'
            };

            var notification = document.createElement('div');
            notification.style.cssText = 'background:' + (colorMap[type] || colorMap.info) + ';color:#fff;padding:16px 20px;border-radius:12px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideInRight 0.3s ease-out;cursor:pointer;';
            notification.textContent = message;

            if (!document.getElementById('notification-animations')) {
                var style = document.createElement('style');
                style.id = 'notification-animations';
                style.textContent = '@keyframes slideInRight{from{transform:translateX(400px);opacity:0;}to{transform:translateX(0);opacity:1;}}@keyframes slideOutRight{to{transform:translateX(400px);opacity:0;}}';
                document.head.appendChild(style);
            }

            container.appendChild(notification);

            setTimeout(function() {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(function() {
                    if (notification.parentNode) {
                        container.removeChild(notification);
                    }
                }, 300);
            }, 5000);

            notification.addEventListener('click', function() {
                this.style.animation = 'slideOutRight 0.3s ease-out';
                var self = this;
                setTimeout(function() {
                    if (self.parentNode) {
                        container.removeChild(self);
                    }
                }, 300);
            });
        };
    }

    function initImages() {
        if (__app.imagesInited) return;
        __app.imagesInited = true;

        var images = document.querySelectorAll('img');

        images.forEach(function(img) {
            if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img')) {
                img.setAttribute('loading', 'lazy');
            }

            img.addEventListener('error', function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPkJpbGQgbmljaHQgdmVyZsO8Z2JhcjwvdGV4dD48L3N2Zz4=';
            });
        });
    }

    __app.init = function() {
        if (__app.initialized) return;
        __app.initialized = true;

        initBurgerMenu();
        initScrollEffects();
        initMicroInteractions();
        initSmoothScroll();
        initScrollSpy();
        initFormValidation();
        initScrollToTop();
        initCountUp();
        initPrivacyModal();
        initNotificationSystem();
        initImages();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', __app.init);
    } else {
        __app.init();
    }

})();
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.scroll-to-top {
  animation: fadeIn 0.3s ease-out;
}

.scroll-to-top:hover {
  animation: pulse 1s ease-in-out infinite;
}

.btn:active,
.c-button:active {
  transform: scale(0.95);
}

.navbar-collapse {
  position: fixed;
  top: var(--header-h);
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
  z-index: calc(var(--z-nav) - 1);
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: text-bottom;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 0.15em;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
