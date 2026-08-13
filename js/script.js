/*=========================================================
=
= ÍCONES (LUCIDE)
=
=========================================================*/

document.addEventListener('DOMContentLoaded', () => {

    if (window.lucide) lucide.createIcons();

});


/*=========================================================
=
= MENU MOBILE
=
=========================================================*/

document.addEventListener('DOMContentLoaded', () => {

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (!navToggle || !navMenu) return;

    const openMenu = () => {

        navToggle.classList.add('active');
        navMenu.classList.add('active');
        document.body.classList.add('menu-open');
        navToggle.setAttribute('aria-expanded', 'true');

    };

    const closeMenu = () => {

        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');

    };

    navToggle.addEventListener('click', () => {

        const isOpen = navMenu.classList.contains('active');

        isOpen ? closeMenu() : openMenu();

    });

    navLinks.forEach(link => {

        link.addEventListener('click', closeMenu);

    });

    document.addEventListener('keydown', (e) => {

        if (e.key === 'Escape') closeMenu();

    });

});


/*=========================================================
=
= FAQ (ACORDEÃO — SÓ UM ABERTO POR VEZ)
=
=========================================================*/

document.addEventListener('DOMContentLoaded', () => {

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {

        item.addEventListener('toggle', () => {

            if (!item.open) return;

            faqItems.forEach(other => {

                if (other !== item) other.open = false;

            });

        });

    });

});