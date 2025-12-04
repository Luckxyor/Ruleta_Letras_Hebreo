// Alfabeto hebreo completo (22 letras)
const hebrewAlphabetComplete = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו',
    'ז', 'ח', 'ט', 'י', 'כ', 'ל',
    'מ', 'נ', 'ס', 'ע', 'פ', 'צ',
    'ק', 'ר', 'ש', 'ת'
];

// Letras que van en la ruleta (primeras 16)
const hebrewAlphabet = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו',
    'ז', 'ח', 'ט', 'י', 'כ', 'ל',
    'מ', 'נ', 'ס', 'ע'
];

// Letras que ya están colocadas desde el inicio (últimas 6)
const prefilledLetters = ['פ', 'צ', 'ק', 'ר', 'ש', 'ת'];

// Colores vibrantes para cada letra (uno por cada letra del alfabeto)
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#FF8FA3', '#A8DADC',
    '#FFB6C1', '#87CEEB', '#DDA0DD', '#F0E68C',
    '#FA8072', '#AFEEEE', '#D8BFD8', '#FFE4B5',
    '#B0E0E6', '#FFDAB9'
];

// Estado del juego
let activeSegments = [...Array(hebrewAlphabet.length).keys()]; // [0, 1, 2, ..., 15]
let collectedLetters = new Array(hebrewAlphabetComplete.length).fill(null);
let isSpinning = false;
let rotation = 0;

// Elementos del DOM
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const letterDisplay = document.getElementById('letterDisplay');
const bigLetter = document.getElementById('bigLetter');
const lettersGrid = document.getElementById('lettersGrid');

// Inicializar el juego
function init() {
    createLettersGrid();
    drawWheel();
    addPointer();
    spinButton.addEventListener('click', spinWheel);
}

// Crear el indicador de la ruleta
function addPointer() {
    const pointer = document.createElement('div');
    pointer.className = 'wheel-pointer';
    document.querySelector('.wheel-container').appendChild(pointer);
}

// Crear el grid de letras vacías
function createLettersGrid() {
    lettersGrid.innerHTML = '';
    hebrewAlphabetComplete.forEach((letter, index) => {
        const box = document.createElement('div');
        box.className = 'letter-box';
        box.id = `box-${index}`;
        
        // Si es una letra pre-rellenada, mostrarla
        if (prefilledLetters.includes(letter)) {
            box.textContent = letter;
            box.classList.add('filled');
            collectedLetters[index] = letter;
        } else {
            box.textContent = '?';
        }
        
        lettersGrid.appendChild(box);
    });
}

// Dibujar la ruleta
function drawWheel() {
    const numSegments = activeSegments.length;
    if (numSegments === 0) {
        // Ruleta vacía - mostrar mensaje de victoria
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4ECDC4';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 240, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¡COMPLETADO! 🎉', centerX, centerY);
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation - Math.PI / 2); // Ajustar para que el primer segmento esté arriba

    // Dibujar cada segmento activo
    activeSegments.forEach((segmentIndex, i) => {
        const startAngle = i * anglePerSegment;
        const endAngle = startAngle + anglePerSegment;

        // Dibujar segmento
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[segmentIndex];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Dibujar letra
        ctx.save();
        ctx.rotate(startAngle + anglePerSegment / 2);
        
        // Calcular tamaño de letra dinámico basado en número de segmentos
        const baseFontSize = 30;
        const maxFontSize = 70;
        const fontSize = baseFontSize + ((maxFontSize - baseFontSize) * (16 - numSegments) / 15);
        
        // Posición: empezar cerca del borde, acercarse al centro cuando quedan pocos
        const baseDistance = 0.7;
        const minDistance = 0.5;
        const distanceMultiplier = baseDistance - ((baseDistance - minDistance) * (16 - numSegments) / 15);
        const distanceFromCenter = radius * distanceMultiplier;
        
        // Rotar 90 grados para que las letras estén verticales (apuntando hacia arriba)
        ctx.rotate(Math.PI / 2);
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(hebrewAlphabet[segmentIndex], 0, -distanceFromCenter);
        ctx.shadowBlur = 0;
        
        ctx.restore();
    });

    ctx.restore();

    // Dibujar círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#764ba2';
    ctx.lineWidth = 5;
    ctx.stroke();
}

// Girar la ruleta
function spinWheel() {
    if (isSpinning || activeSegments.length === 0) return;

    isSpinning = true;
    spinButton.disabled = true;
    spinButton.textContent = '🔄';
    canvas.style.cursor = 'wait';

    const numSegments = activeSegments.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;
    
    // Rotación total: múltiples vueltas + ángulo aleatorio
    const spins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 2 * Math.PI;
    const totalRotation = spins * 2 * Math.PI + randomAngle;
    
    const duration = 4000; // 4 segundos
    const startTime = Date.now();
    const startRotation = rotation;

    function animate() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Función de suavizado (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        rotation = startRotation + totalRotation * easeOut;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Calcular el segmento ganador
            // La flecha apunta hacia arriba
            let normalizedRotation = (rotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            
            // Como la ruleta gira en sentido horario pero queremos el índice en sentido antihorario
            // invertimos el cálculo
            let winningIndex = numSegments - 1 - Math.floor(normalizedRotation / anglePerSegment);
            if (winningIndex < 0) winningIndex = numSegments - 1;
            winningIndex = winningIndex % numSegments;
            
            const winningSegment = activeSegments[winningIndex];
            const selectedLetter = hebrewAlphabet[winningSegment];
            
            setTimeout(() => {
                showLetter(selectedLetter, winningSegment);
                isSpinning = false;
                canvas.style.cursor = 'pointer';
            }, 500);
        }
    }

    animate();
}

// Mostrar la letra grande
function showLetter(letter, segmentIndex) {
    bigLetter.textContent = letter;
    letterDisplay.classList.remove('hidden');
    
    // Después de 5 segundos, ocultar y procesar
    setTimeout(() => {
        hideLetter();
        placeLetter(letter, segmentIndex);
        removeSegment(segmentIndex);
        
        spinButton.disabled = false;
        
        if (activeSegments.length > 0) {
            spinButton.textContent = '🔄';
        } else {
            spinButton.textContent = '🎉 ¡Completado!';
            spinButton.style.background = '#52B788';
        }
        
        drawWheel();
    }, 5000);
}

// Ocultar la letra grande
function hideLetter() {
    letterDisplay.classList.add('hidden');
}

// Colocar la letra en su cuadradito
function placeLetter(letter, segmentIndex) {
    // Encontrar el índice en el alfabeto completo
    const fullAlphabetIndex = hebrewAlphabetComplete.indexOf(letter);
    if (fullAlphabetIndex !== -1) {
        collectedLetters[fullAlphabetIndex] = letter;
        const box = document.getElementById(`box-${fullAlphabetIndex}`);
        box.textContent = letter;
        box.classList.add('filled');
    }
}

// Eliminar segmento de la ruleta
function removeSegment(segmentIndex) {
    const indexInActive = activeSegments.indexOf(segmentIndex);
    if (indexInActive !== -1) {
        activeSegments.splice(indexInActive, 1);
    }
}

// Iniciar el juego cuando cargue la página
window.addEventListener('load', init);
