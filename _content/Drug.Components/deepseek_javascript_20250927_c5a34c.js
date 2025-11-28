// signature.js
let canvas;
let ctx;
let drawing = false;
let lastX = 0;
let lastY = 0;

function resolveCanvas(elOrId) {
    if (!elOrId) return null;
    try {
        if (typeof elOrId === 'string') return document.getElementById(elOrId);
        // In some hosting scenarios Blazor may pass an ElementReference proxy; try to obtain the underlying element
        if (elOrId instanceof HTMLElement) return elOrId;
        if (elOrId && elOrId.tagName) return elOrId;
    }
    catch (e) {
        // ignore
    }
    // fallback: find the first canvas in the document with class 'signature-pad' if present
    return document.querySelector('canvas.signature-pad') || document.querySelector('canvas');
}

function initializeSignatureCanvas(canvasElementOrId) {
    const el = resolveCanvas(canvasElementOrId);
    if (!el) {
        console.warn('initializeSignatureCanvas: canvas element not found');
        return;
    }

    canvas = el;

    // Ensure we have a real canvas element before calling getContext
    if (typeof canvas.getContext !== 'function') {
        console.warn('initializeSignatureCanvas: resolved object does not support getContext');
        return;
    }

    ctx = canvas.getContext('2d');

    // Set up canvas styling
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';

    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile devices
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function startDrawing(e) {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    lastY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
}

function draw(e) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastX = currentX;
    lastY = currentY;
}

function stopDrawing() {
    drawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    startDrawing(e);
}

function handleTouchMove(e) {
    e.preventDefault();
    draw(e);
}

function handleTouchEnd(e) {
    e.preventDefault();
    stopDrawing();
}

function clearSignatureCanvas(elOrId) {
    const el = resolveCanvas(elOrId);
    if (!el) return;
    const c = el;
    const cctx = c.getContext && c.getContext('2d');
    if (cctx) cctx.clearRect(0, 0, c.width, c.height);
}

function getSignatureData(elOrId) {
    const el = resolveCanvas(elOrId);
    if (!el) return null;
    try {
        return el.toDataURL('image/png');
    }
    catch (e) {
        console.warn('getSignatureData failed', e);
        return null;
    }
}

// Export functions for Blazor interop
window.initializeSignatureCanvas = initializeSignatureCanvas;
window.clearSignatureCanvas = clearSignatureCanvas;
window.getSignatureData = getSignatureData;