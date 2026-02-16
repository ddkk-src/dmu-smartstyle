document.addEventListener('DOMContentLoaded', () => {
    
    // 1. SCROLL REVEAL (Apparition fluide)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 2. PARALLAX EFFECT (Effet de profondeur)
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // Appliquer aux images avec la classe .parallax-img
        document.querySelectorAll('.parallax-img').forEach(img => {
            const speed = 0.15;
            const yPos = -(scrolled * speed);
            img.style.transform = `translateY(${yPos}px)`;
        });

        // Appliquer aux orbs du background (plus lent)
        document.querySelectorAll('.orb').forEach((orb, index) => {
            const speed = (index + 1) * 0.05;
            orb.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // 3. PAGE TRANSITION (Optionnel - simple fade in au chargement)
    document.body.style.opacity = 0;
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease';
        document.body.style.opacity = 1;
    }, 100);
});
