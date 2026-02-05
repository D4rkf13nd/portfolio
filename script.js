/* =========================
   Helpers
========================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel, root = document) => root.querySelectorAll(sel);


/* =========================
   Year Auto Update
========================= */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* =========================
   Header hide/show on scroll
========================= */
const nav = $('nav');
let lastScrollTop = 0;

if (nav) {
    window.addEventListener('scroll', () => {
        const navLinks = $('#navLinks');
        if (navLinks?.classList.contains('active')) return;

        const scrollTop = window.scrollY;

        if (Math.abs(scrollTop - lastScrollTop) < 6) {
            return;
        }

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            nav.classList.add('nav-hidden');
        } else {
            nav.classList.remove('nav-hidden');
        }

        lastScrollTop = Math.max(scrollTop, 0);
    });
}


/* =========================
   Typing Effect (FIXED)
   prevents stacked timers
========================= */
function typeWriter(el, text, speed = 40) {
    return new Promise(resolve => {
        let i = 0;
        el.textContent = '';

        const timer = setInterval(() => {
            el.textContent += text[i++];
            if (i >= text.length) {
                clearInterval(timer);
                resolve();
            }
        }, speed);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const tag = $('#typing-tag');
    const title = $('#typing-text');
    const sub = $('#typing-subtitle');
    const cta = $('#typing-cta');

    const texts = {
        tag: '— Introduction',
        title: 'UI/UX Designer & Developer',
        sub: 'Dedicated Computer Engineering student focused on building intuitive, user-centric solutions enhanced by AI technologies.',
        cta: 'My story →'
    };

    if (!tag && !title && !sub && !cta) return;

    while (true) {
        if (tag) await typeWriter(tag, texts.tag, 60);
        if (title) await typeWriter(title, texts.title, 40);
        if (sub) await typeWriter(sub, texts.sub, 30);
        if (cta) await typeWriter(cta, texts.cta, 45);

        await new Promise(r => setTimeout(r, 2500));

        [tag, title, sub, cta].forEach(el => el && (el.textContent = ''));
    }
});


/* =========================
   Mobile Menu
========================= */
const navMenuBtn = $('#navMenuBtn');
const navLinks = $('#navLinks');

if (navMenuBtn && navLinks) {
    navMenuBtn.onclick = () => {
        navLinks.classList.toggle('active');
        if (nav) nav.classList.remove('nav-hidden');
        lastScrollTop = Math.max(window.scrollY, 0);
    };

    $$('a', navLinks).forEach(link =>
        link.onclick = () => navLinks.classList.remove('active')
    );

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') navLinks.classList.remove('active');
    });
}


/* =========================
   Chart.js CENTER TEXT FIX
   (proper plugin instead of
    overriding prototype ❌)
========================= */
let masteryChartsInitialized = false;
const masteryCharts = {};

function initMasteryCharts() {
    if (masteryChartsInitialized) return;
    if (typeof Chart === 'undefined') return;

    const css = getComputedStyle(document.documentElement);
    const getVar = (name, fallback) => (css.getPropertyValue(name).trim() || fallback);

    const palette = {
        accent: getVar('--accent', '#fcc02d'),
        text: getVar('--text', '#f3f5f7'),
        textDim: getVar('--text-dim', 'rgba(255,255,255,0.7)'),
        track: 'rgba(255, 255, 255, 0.10)',
        trackBorder: 'rgba(255, 255, 255, 0.18)'
    };

    const centerTextPlugin = {
        id: 'centerText',
        afterDraw(chart, args, opts) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const { width, height } = chartArea;

            ctx.save();
            ctx.font = '900 20px Inter';
            ctx.fillStyle = opts.valueColor || palette.accent;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(opts.percent + '%', width / 2, height / 2 - 6);

            ctx.font = '700 12px Inter';
            ctx.fillStyle = opts.labelColor || palette.textDim;
            ctx.fillText(opts.label, width / 2, height / 2 + 14);
            ctx.restore();
        }
    };

    const createChart = (id, label, value) => {
        const el = document.getElementById(id);
        if (!el) return;

        const chart = new Chart(el, {
            type: 'doughnut',
            data: {
                labels: [label, 'Remaining'],
                datasets: [
                    {
                        data: [value, 100 - value],
                        backgroundColor: [palette.accent, palette.track],
                        borderColor: [palette.accent, palette.trackBorder],
                        borderWidth: 1,
                        spacing: 2,
                        hoverOffset: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                animation: {
                    animateRotate: true,
                    animateScale: false,
                    duration: 1400,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
                        }
                    },
                    centerText: {
                        label,
                        percent: value,
                        valueColor: palette.accent,
                        labelColor: palette.textDim
                    }
                }
            },
            plugins: [centerTextPlugin]
        });

        masteryCharts[id] = chart;
    };

    createChart('hardwareChart', 'Hardware', 72);
    createChart('softwareChart', 'Software', 80);

    masteryChartsInitialized = true;
}

function animateMasteryCharts() {
    Object.values(masteryCharts).forEach((chart) => {
        if (!chart) return;
        chart.reset();
        chart.update();
    });
}

function initMasteryChartsOnScroll() {
    const hardware = document.getElementById('hardwareChart');
    const software = document.getElementById('softwareChart');
    const targets = [hardware, software].filter(Boolean);
    if (targets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        initMasteryCharts();
        animateMasteryCharts();
        return;
    }

    let wasInView = false;
    const io = new IntersectionObserver(
        (entries) => {
            const inView = entries.some((e) => e.isIntersecting);
            if (inView && !wasInView) {
                initMasteryCharts();
                animateMasteryCharts();
            }
            wasInView = inView;
        },
        { threshold: 0.35 }
    );

    targets.forEach((t) => io.observe(t));
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', initMasteryChartsOnScroll)
    : initMasteryChartsOnScroll();

function initStatsCounter() {
    const statsBar = $('.stats-bar');
    if (!statsBar) return;

    const items = Array.from($$('.stat-item', statsBar));
    if (items.length === 0) return;

    const h3s = items
        .map((item) => item.querySelector('h3'))
        .filter(Boolean);

    h3s.forEach((h3) => {
        if (h3.dataset.final) return;
        const raw = (h3.textContent || '').trim();
        const match = raw.match(/^([0-9]+(?:\.[0-9]+)?)(.*)$/);
        if (!match) return;
        h3.dataset.final = match[1];
        h3.dataset.suffix = (match[2] || '').trim();
    });

    const reset = () => {
        items.forEach((item) => item.classList.remove('is-counting'));
        h3s.forEach((h3) => {
            const suffix = h3.dataset.suffix ? h3.dataset.suffix : '';
            h3.textContent = '0' + suffix;
        });
    };

    const animate = () => {
        items.forEach((item) => item.classList.add('is-counting'));

        const duration = 1100;
        const start = performance.now();

        const finals = h3s.map((h3) => Number(h3.dataset.final || 0));
        const suffixes = h3s.map((h3) => (h3.dataset.suffix ? h3.dataset.suffix : ''));

        const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);

            h3s.forEach((h3, i) => {
                const val = Math.round(finals[i] * eased);
                h3.textContent = String(val) + suffixes[i];
            });

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                items.forEach((item) => item.classList.remove('is-counting'));
            }
        };

        requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
        reset();
        animate();
        return;
    }

    let wasInView = false;
    const io = new IntersectionObserver(
        (entries) => {
            const inView = entries.some((e) => e.isIntersecting);
            if (inView && !wasInView) {
                reset();
                animate();
            }
            wasInView = inView;
        },
        { threshold: 0.4 }
    );

    io.observe(statsBar);
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', initStatsCounter)
    : initStatsCounter();

function initContactForm() {
    const form = $('#contactForm');
    const btn = $('#contactSendBtn');
    if (!form || !btn) return;

    const EMAILJS_PUBLIC_KEY = '';
    const EMAILJS_SERVICE_ID = '';
    const EMAILJS_TEMPLATE_ID = '';

    const isConfigured =
        EMAILJS_PUBLIC_KEY &&
        EMAILJS_SERVICE_ID &&
        EMAILJS_TEMPLATE_ID &&
        typeof emailjs !== 'undefined';

    let emailjsReady = false;

    const ensureEmailjs = () => {
        if (!isConfigured) return false;
        if (emailjsReady) return true;
        emailjs.init(EMAILJS_PUBLIC_KEY);
        emailjsReady = true;
        return true;
    };

    const sendViaEmailjs = async () => {
        if (!ensureEmailjs()) {
            alert('Email service is not configured yet. Please add your EmailJS publicKey, serviceId, and templateId in script.js.');
            return;
        }

        const name = ($('#name')?.value || '').trim();
        const email = ($('#email')?.value || '').trim();
        const message = ($('#message')?.value || '').trim();

        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                from_name: name,
                reply_to: email,
                message: message,
                to_email: 'tesadojaymar042004@gmail.com'
            });

            btn.textContent = 'Sent!';
            form.reset();
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1800);
        } catch (err) {
            btn.textContent = originalText;
            btn.disabled = false;
            alert('Failed to send message. Please try again later.');
        }
    };

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        sendViaEmailjs();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendViaEmailjs();
    });
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', initContactForm)
    : initContactForm();


/* =========================
   Smooth Scroll
========================= */
$$('a[href^="#"]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    link.onclick = (e) => {
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
    };
});


/* =========================
   Cursor
========================= */
const cursor = $('.cursor');

if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}


/* =========================
   Reveal on Scroll
========================= */
function initRevealOnScroll() {
    const autoRevealEls = $$(
        '.section-header, .card, .project-card, .service-card, .resume-card, .resume-item, .cert-item, .about-card, .blog-card, .contact-card'
    );
    autoRevealEls.forEach(el => el.classList.add('reveal'));

    const revealEls = $$('.reveal');
    if (revealEls.length === 0) return;

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, { threshold: 0.15 });

        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', initRevealOnScroll)
    : initRevealOnScroll();
