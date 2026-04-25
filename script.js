document.addEventListener('DOMContentLoaded', function () {

    var navbar = document.getElementById('navbar');
    var lastScroll = 0;

    window.addEventListener('scroll', function () {
        var y = window.scrollY;
        if (y > 60) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        lastScroll = y;
    });

    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');

            if (href === "#") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                var offset = 100;
                var top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
                window.history.pushState(null, null, href);
            }
        });
    });

    var reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { revealObs.observe(el); });

    var catBtns = document.querySelectorAll('.menu-cat-btn');
    var menuItems = document.querySelectorAll('.menu-item');

    catBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            catBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var cat = btn.getAttribute('data-cat');

            menuItems.forEach(function (item) {
                if (cat === 'all' || item.getAttribute('data-cat') === cat) {
                    item.style.display = 'flex';
                    item.style.opacity = '0';
                    setTimeout(function () { item.style.opacity = '1'; }, 50);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxClose = document.getElementById('lightboxClose');

    document.querySelectorAll('.gallery-item').forEach(function (item) {
        item.addEventListener('click', function () {
            var src = item.getAttribute('data-src');
            if (src) {
                lightboxImg.src = src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });

    var track = document.getElementById('reviewsTrack');
    var dots = document.querySelectorAll('.reviews-dot');
    var currentSlide = 0;
    var totalSlides = dots.length;
    var autoInterval;

    function goToSlide(n) {
        currentSlide = n;
        track.style.transform = 'translateX(-' + (n * 100) + '%)';
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === n);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            goToSlide(parseInt(dot.getAttribute('data-slide')));
            resetAuto();
        });
    });

    function autoSlide() {
        autoInterval = setInterval(function () {
            goToSlide((currentSlide + 1) % totalSlides);
        }, 12000);
    }

    function resetAuto() {
        clearInterval(autoInterval);
        autoSlide();
    }

    autoSlide();

    var form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = document.getElementById('formName').value.trim();
            var email = document.getElementById('formEmail').value.trim();
            var msg = document.getElementById('formMsg').value.trim();

            if (!name || !email || !msg) {
                alert('Proszę wypełnić wszystkie wymagane pola.');
                return;
            }

            var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(email)) {
                alert('Proszę podać prawidłowy adres email.');
                return;
            }

            var submitBtn = form.querySelector('.form-submit');
            var originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Wysyłanie...';

            var formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    if (data.status === 'success') {
                        alert('Wiadomość została wysłana pomyślnie!');
                        form.reset();
                    } else {
                        alert('Błąd: ' + (data.message || 'Wystąpił nieoczekiwany błąd.'));
                    }
                })
                .catch(function (error) {
                    console.error('Error:', error);
                    alert('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.');
                })
                .finally(function () {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
        });
    }

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mail')) {
        var status = urlParams.get('mail');
        if (status === 'success') alert('Wiadomość została wysłana pomyślnie!');
        else if (status === 'error') alert('Wystąpił błąd podczas wysyłania wiadomości.');
        else if (status === 'spam') alert('Weryfikacja antyspamowa nie powiodła się.');
        else if (status === 'empty') alert('Proszę wypełnić wszystkie pola.');

        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }

    menuItems.forEach(function (item, i) {
        item.style.transitionDelay = (i * 0.05) + 's';
    });
});
