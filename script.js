// Animated Globe
const canvas = document.getElementById('globeCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 400;
const globeRadius = 180;
let rotation = 0;
let tilt = 0.3;
let targetTilt = 0.3;
let mouseX = 0, mouseY = 0;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function fibonacciSphere(samples, radius) {
    const points = [];
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        points.push({ x: x * radius, y: y * radius, z: z * radius });
    }

    return points;
}

function initParticles() {
    particles = fibonacciSphere(particleCount, globeRadius).map((p, i) => ({
        x: p.x,
        y: p.y,
        z: p.z,
        baseX: p.x,
        baseY: p.y,
        baseZ: p.z,
        size: Math.random() * 1.5 + 0.5,
        color: i % 5 === 0 ? 'rgba(165, 180, 252, ' : 'rgba(255, 255, 255, '
    }));
}

function rotateY(x, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - z * sin,
        z: x * sin + z * cos
    };
}

function rotateX(y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        y: y * cos - z * sin,
        z: y * sin + z * cos
    };
}

function drawGlobe() {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Atmosphere glow
    const gradient = ctx.createRadialGradient(
        centerX, centerY, globeRadius * 0.8,
        centerX, centerY, globeRadius * 1.6
    );
    gradient.addColorStop(0, 'rgba(165, 180, 252, 0.15)');
    gradient.addColorStop(0.5, 'rgba(100, 100, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, globeRadius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Smooth tilt transition
    tilt += (targetTilt - tilt) * 0.05;

    // Sort particles by depth
    const sortedParticles = particles.map(p => {
        let x = p.baseX;
        let y = p.baseY;
        let z = p.baseZ;

        const rotY = rotateY(x, z, rotation);
        x = rotY.x;
        z = rotY.z;

        const rotX = rotateX(y, z, tilt);
        y = rotX.y;
        z = rotX.z;

        return { ...p, x, y, z };
    }).sort((a, b) => a.z - b.z);

    // Draw connections
    ctx.lineWidth = 0.5;
    for (let i = 0; i < sortedParticles.length; i++) {
        const p1 = sortedParticles[i];
        if (p1.z < -50) continue;

        let connections = 0;
        for (let j = i + 1; j < sortedParticles.length && connections < 3; j++) {
            const p2 = sortedParticles[j];
            if (p2.z < -50) continue;

            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dz = p1.z - p2.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            if (dist < 50) {
                const alpha = (1 - dist / 50) * 0.15 * ((p1.z + globeRadius) / (2 * globeRadius));
                ctx.strokeStyle = `rgba(165, 180, 252, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(centerX + p1.x, centerY + p1.y);
                ctx.lineTo(centerX + p2.x, centerY + p2.y);
                ctx.stroke();
                connections++;
            }
        }
    }

    // Draw particles
    for (const p of sortedParticles) {
        const depth = (p.z + globeRadius) / (2 * globeRadius);
        const alpha = depth * 0.8 + 0.2;
        const size = p.size * (depth * 0.6 + 0.4);

        ctx.fillStyle = p.color + alpha + ')';
        ctx.beginPath();
        ctx.arc(centerX + p.x, centerY + p.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (depth > 0.7) {
            ctx.fillStyle = p.color + (alpha * 0.3) + ')';
            ctx.beginPath();
            ctx.arc(centerX + p.x, centerY + p.y, size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    rotation += 0.003;
    requestAnimationFrame(drawGlobe);
}

// Mouse interaction
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / width - 0.5) * 2;
    mouseY = (e.clientY / height - 0.5) * 2;
    targetTilt = 0.3 + mouseY * 0.2;
});

// Login functionality
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const errorMessage = document.getElementById('errorMessage');
const loginCard = document.querySelector('.login-card');

// Password toggle
togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    const eyeOpen = togglePassword.querySelector('.eye-open');
    const eyeClosed = togglePassword.querySelector('.eye-closed');

    if (type === 'text') {
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
});

// Form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === 'iwantogoin' && password === 'iaminside') {
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
        loginCard.classList.add('success-pulse');

        loginCard.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        loginCard.style.transform = 'scale(1.1) rotateY(10deg)';
        loginCard.style.opacity = '0';

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
    } else {
        errorMessage.textContent = 'Invalid username or password';
        errorMessage.classList.add('show');
        loginCard.classList.add('shake');

        setTimeout(() => {
            loginCard.classList.remove('shake');
        }, 500);
    }
});

// Input focus effects
[usernameInput, passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.querySelector('.input-icon').style.color = 'rgba(165, 180, 252, 0.8)';
    });

    input.addEventListener('blur', () => {
        input.parentElement.querySelector('.input-icon').style.color = 'rgba(255, 255, 255, 0.4)';
    });
});

// Initialize
window.addEventListener('resize', resize);
resize();
initParticles();
drawGlobe();
