document.addEventListener('DOMContentLoaded', () => {
    let highestZIndex = 1000; // Starting z-index for content
    // 1. Custom Cursor Logic
    const cursor = document.getElementById('custom-cursor');
    const interactables = document.querySelectorAll('a, button, .draggable');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Parallax effect using CSS variables
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        document.querySelectorAll('.draggable').forEach(el => {
            if (!el.classList.contains('is-dragging')) {
                const depth = parseFloat(el.getAttribute('data-depth')) || 0.1;
                const moveX = x * depth * 30;
                const moveY = y * depth * 30;
                const rot = (x + y) * depth * 5;

                el.style.setProperty('--parallax-x', `${moveX}px`);
                el.style.setProperty('--parallax-y', `${moveY}px`);
                el.style.setProperty('--parallax-rot', `${rot}deg`);
            }
        });
    });

    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
        // Bring container to front on click/select
        el.addEventListener('mousedown', () => {
            const container = el.closest('.draggable') || (el.classList.contains('draggable') ? el : null);
            if (container) {
                highestZIndex++;
                container.style.zIndex = highestZIndex;
            }
        });
    });

    // Reset z-index when clicking on the background
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.draggable')) {
            document.querySelectorAll('.draggable').forEach(el => {
                el.style.zIndex = '';
            });
            highestZIndex = 1000;
        }
    });

    // 2. Secret Invert Theme Trigger & Ripple Effect
    let clickCount = 0;

    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        document.body.appendChild(ripple);

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        ripple.addEventListener('animationend', () => ripple.remove());

        // Second ripple level
        setTimeout(() => {
            const rippleOuter = document.createElement('div');
            rippleOuter.className = 'ripple-outer';
            document.body.appendChild(rippleOuter);
            rippleOuter.style.left = `${x}px`;
            rippleOuter.style.top = `${y}px`;
            rippleOuter.addEventListener('animationend', () => rippleOuter.remove());
        }, 150);
    }

    document.addEventListener('click', (e) => {
        createRipple(e.clientX, e.clientY);

        clickCount++;
        if (clickCount > 5) {
            document.documentElement.classList.toggle('inverted');
            clickCount = 0;
        }

        setTimeout(() => {
            if (clickCount > 0) clickCount--;
        }, 2000);
    });

    // 3. Draggable Logic
    const draggables = document.querySelectorAll('.draggable');
    let activeElement = null;
    let initialX, initialY;

    // Typewriter effect / UI sounds Simulation
    document.addEventListener('keydown', (e) => {
        // Visual feedback for keydown
        const keyFeedback = document.createElement('div');
        keyFeedback.style.position = 'fixed';
        keyFeedback.style.bottom = '40px';
        keyFeedback.style.right = '20px';
        keyFeedback.style.fontSize = '8rem';
        keyFeedback.style.opacity = '0.1';
        keyFeedback.style.color = 'var(--accent-color)';
        keyFeedback.style.pointerEvents = 'none';
        keyFeedback.style.zIndex = '99999';
        keyFeedback.textContent = e.key.toUpperCase();
        document.body.appendChild(keyFeedback);

        setTimeout(() => keyFeedback.remove(), 200);

        // Screen shake on keydown
        if (Math.random() > 0.5) {
            document.body.style.transform = `translate(${(Math.random()-0.5)*5}px, ${(Math.random()-0.5)*5}px)`;
            setTimeout(() => document.body.style.transform = '', 50);
        }
    });

    draggables.forEach(draggable => {
        draggable.addEventListener('mousedown', dragStart);

        if (!draggable.classList.contains('header-block')) {
             const randomRot = Math.random() * 10 - 5;
             draggable.style.setProperty('--base-rot', `${randomRot}deg`);
        }

        const dragRot = Math.random() > 0.5 ? 2 : -2;
        draggable.style.setProperty('--drag-rot', `${dragRot}deg`);
    });

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        if (e.target.closest('a') || e.target.closest('button') || e.target.classList.contains('expand-btn') || e.target.classList.contains('project-image')) return;

        activeElement = this;
        this.classList.add('is-dragging');

        // Store original position to return to it later
        activeElement.dataset.origLeft = activeElement.style.left;
        activeElement.dataset.origTop = activeElement.style.top;
        activeElement.dataset.origRight = activeElement.style.right;
        activeElement.dataset.origBottom = activeElement.style.bottom;

        // Use offset values for more stable drag location calculation
        const rect = activeElement.getBoundingClientRect();

        // Calculate offset relative to the page using offsetLeft/offsetTop to ignore current transforms
        initialX = e.clientX - activeElement.offsetLeft;
        initialY = e.clientY - activeElement.offsetTop;
    }

    function dragEnd() {
        if (activeElement) {
            activeElement.classList.remove('is-dragging');

            // Restore original position
            /*
            activeElement.style.left = activeElement.dataset.origLeft;
            activeElement.style.top = activeElement.dataset.origTop;
            activeElement.style.right = activeElement.dataset.origRight;
            activeElement.style.bottom = activeElement.dataset.origBottom;
            */

            // Allow smooth transition back to base state
            activeElement.style.transform = '';

            activeElement = null;
        }
    }

    function drag(e) {
        if (activeElement) {
            e.preventDefault();

            const x = e.clientX - initialX;
            const y = e.clientY - initialY;

            // Boundary constraints - relaxation to allow moving over/below banner
            const rect = activeElement.getBoundingClientRect();
            const minX = -rect.width * 0.5; // Allow half-off screen left
            const minY = 0;
            const maxX = window.innerWidth - rect.width * 0.5; // Allow half-off screen right
            const maxY = window.innerHeight; // Allow moving completely to the bottom (overlapping banner)

            const boundedX = Math.max(minX, Math.min(x, maxX));
            const boundedY = Math.max(minY, Math.min(y, maxY));

            activeElement.style.left = `${boundedX}px`;
            activeElement.style.top = `${boundedY}px`;
            activeElement.style.bottom = 'auto'; // Break the bottom alignment
            activeElement.style.right = 'auto';  // Break the right alignment

            activeElement.style.transform = `translate(var(--parallax-x), var(--parallax-y)) scale(1.05) rotate(var(--drag-rot, 2deg))`;
        }
    }

    // 4. Random glitch intervals
    setInterval(() => {
        const titles = document.querySelectorAll('.section-title');
        if (titles.length === 0) return;

        const randomTitle = titles[Math.floor(Math.random() * titles.length)];

        randomTitle.style.transform = `skewX(${Math.random() * 10 - 5}deg)`;
        randomTitle.style.color = Math.random() > 0.8 ? 'var(--accent-color)' : 'var(--text-primary)';

        setTimeout(() => {
            randomTitle.style.transform = 'skewX(0)';
            randomTitle.style.color = '';
        }, 150);
    }, 5000);

    // 5. Expandable logic
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const targetId = btn.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            const parentDraggable = btn.closest('.draggable');

            if (!targetContent) return;

            const isExpanded = targetContent.classList.toggle('expanded');
            btn.textContent = isExpanded ? '[-]' : '[+]';

            if (parentDraggable) {
                parentDraggable.classList.toggle('expanded-container', isExpanded);
            }
        });
    });

    // 6. Lightbox
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const projectImages = document.querySelectorAll('.project-image');

        projectImages.forEach(img => {
            img.style.cursor = 'none'; // Use custom cursor
            
            // Interaction hints
            img.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            img.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));

            img.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent dragging/resetting
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
            });
        });

        // Close on click anywhere in lightbox
        lightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
        
        // Prevent closing when clicking the image itself
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // 7. Ping Me Button (Copy to Clipboard)
    const pingBtn = document.getElementById('ping-btn');
    if (pingBtn) {
        pingBtn.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        pingBtn.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));

        let pingTimeout;
        pingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // prevent dragging

            const email = "ngominh234123@gmail.com";
            
            navigator.clipboard.writeText(email).then(() => {
                clearTimeout(pingTimeout);
                pingBtn.textContent = "[EMAIL_COPIED_TO_CLIPBOARD_]";
                pingBtn.style.backgroundColor = "var(--accent-color)";
                pingBtn.style.color = "var(--bg-color)";
                pingBtn.style.transform = "scale(1.05) skewX(-10deg)";
                pingBtn.style.border = "4px solid var(--text-primary)";
                
                pingTimeout = setTimeout(() => {
                    pingBtn.textContent = "SEND TRANSMISSION";
                    pingBtn.style.backgroundColor = "";
                    pingBtn.style.color = "";
                    pingBtn.style.transform = "";
                    pingBtn.style.border = "";
                }, 2000);
            }).catch(err => {
                clearTimeout(pingTimeout);
                pingBtn.textContent = "[ERROR_TRANSMISSION_FAILED_]";
                pingTimeout = setTimeout(() => {
                    pingBtn.textContent = "SEND TRANSMISSION";
                }, 2000);
            });
        });
    }
});
