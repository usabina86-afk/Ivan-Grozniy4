// ===== SMOOTH SCROLL =====
function smoothScroll(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== UPDATE ACTIVE NAV LINK =====
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => link.classList.remove('active'));

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const activeLink = document.querySelector(`.nav-link[href="${currentPage}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-fade-in, .animate-card, .fact-card').forEach(el => {
    observer.observe(el);
});

// ===== COUNTING ANIMATION FOR FACTS =====
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
            const target = parseInt(entry.target.dataset.target);
            countUp(entry.target, target);
            entry.target.dataset.counted = true;
        }
    });
}, observerOptions);

document.querySelectorAll('.fact-number').forEach(el => {
    counterObserver.observe(el);
});

function countUp(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// ===== QUIZ FUNCTIONALITY =====
let selectedLeft = null;
let selectedRight = null;
let connections = [];

function setupQuiz() {
    const leftItems = document.querySelectorAll('.left-column .quiz-item');
    const rightItems = document.querySelectorAll('.right-column .quiz-item');

    leftItems.forEach(item => {
        item.addEventListener('click', () => {
            leftItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedLeft = item;
        });
    });

    rightItems.forEach(item => {
        item.addEventListener('click', () => {
            if (selectedLeft) {
                rightItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                selectedRight = item;
                
                drawConnection(selectedLeft, item);
                selectedLeft.classList.remove('selected');
                selectedRight.classList.remove('selected');
                selectedLeft = null;
                selectedRight = null;
            }
        });
    });
}

function drawConnection(leftItem, rightItem) {
    const svg = document.getElementById('connectorsSvg');
    const leftRect = leftItem.getBoundingClientRect();
    const rightRect = rightItem.getBoundingClientRect();
    const quizContainer = document.querySelector('.quiz-container');
    const containerRect = quizContainer.getBoundingClientRect();

    const x1 = leftRect.right - containerRect.left;
    const y1 = leftRect.top - containerRect.top + leftRect.height / 2;
    const x2 = rightRect.left - containerRect.left;
    const y2 = rightRect.top - containerRect.top + rightRect.height / 2;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#C9A84C');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');

    svg.appendChild(line);

    connections.push({
        line: line,
        leftPair: leftItem.dataset.pair,
        rightAnswer: rightItem.dataset.answer
    });

    // Animation
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    line.setAttribute('stroke-dasharray', `${length} ${length}`);
    line.setAttribute('stroke-dashoffset', length);
    line.style.animation = `dashAnimation 0.5s ease forwards`;
}

function checkAnswers() {
    let correct = 0;

    connections.forEach(conn => {
        if (conn.leftPair === conn.rightAnswer) {
            conn.line.setAttribute('stroke', '#00CC00');
            correct++;
        } else {
            conn.line.setAttribute('stroke', '#FF0000');
        }
        conn.line.removeAttribute('stroke-dasharray');
        conn.line.removeAttribute('stroke-dashoffset');
    });

    const resultDiv = document.getElementById('quizResult');
    if (correct === 10) {
        resultDiv.textContent = `✨ Отлично! Ты настоящий историк! ${correct}/10 ✨`;
        resultDiv.style.color = '#00CC00';
    } else if (correct >= 7) {
        resultDiv.textContent = `Хорошо! ${correct}/10 правильных ответов`;
        resultDiv.style.color = '#C9A84C';
    } else {
        resultDiv.textContent = `Попробуй ещё раз! ${correct}/10 правильных ответов`;
        resultDiv.style.color = '#FF0000';
    }
}

function resetQuiz() {
    const svg = document.getElementById('connectorsSvg');
    svg.innerHTML = '';
    connections = [];
    document.querySelectorAll('.quiz-item').forEach(item => item.classList.remove('selected'));
    document.getElementById('quizResult').textContent = '';
}

// ===== RESIZE SVG CONTAINER ON WINDOW RESIZE =====
function resizeSvg() {
    const svg = document.getElementById('connectorsSvg');
    if (svg && svg.parentElement) {
        const quizContainer = svg.parentElement;
        svg.setAttribute('width', quizContainer.offsetWidth);
        svg.setAttribute('height', quizContainer.offsetHeight);
    }
}

window.addEventListener('resize', () => {
    resizeSvg();
});

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    setupQuiz();
    resizeSvg();
    
    // Set correct width for SVG
    const svg = document.getElementById('connectorsSvg');
    if (svg) {
        setTimeout(() => {
            const quizContainer = svg.parentElement;
            svg.setAttribute('width', quizContainer.offsetWidth);
            svg.setAttribute('height', quizContainer.offsetHeight);
        }, 100);
    }
});

// CSS Animation for SVG
const style = document.createElement('style');
style.textContent = `
    @keyframes dashAnimation {
        from {
            stroke-dashoffset: var(--dash-length);
        }
        to {
            stroke-dashoffset: 0;
        }
    }
`;
document.head.appendChild(style);
