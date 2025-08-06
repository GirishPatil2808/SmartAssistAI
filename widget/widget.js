document.addEventListener('DOMContentLoaded', () => {
    const widgetContainer = document.getElementById('smart-assist-widget-container');
    const triggerButton = document.getElementById('widget-trigger');
    const widgetPanel = document.getElementById('widget-panel');
    const closeButton = document.getElementById('close-btn');

    // --- 1. Toggle Panel Visibility ---
    triggerButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling to document
        widgetPanel.classList.toggle('show');
    });

    closeButton.addEventListener('click', () => {
        widgetPanel.classList.remove('show');
    });

    // --- 2. Make the Widget Draggable ---
    let isDragging = false;
    let offsetX, offsetY;

    const onMouseDown = (e) => {
        isDragging = true;
        widgetContainer.style.cursor = 'grabbing';
        offsetX = e.clientX - widgetContainer.getBoundingClientRect().left;
        offsetY = e.clientY - widgetContainer.getBoundingClientRect().top;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;

        widgetContainer.style.left = `${newX}px`;
        widgetContainer.style.top = `${newY}px`;
        widgetContainer.style.bottom = 'auto';
        widgetContainer.style.right = 'auto';
    };

    const onMouseUp = () => {
        isDragging = false;
        widgetContainer.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMouseMove);
    };

    widgetContainer.addEventListener('mousedown', onMouseDown);
});