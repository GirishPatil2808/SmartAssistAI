document.addEventListener('DOMContentLoaded', () => {
    const widgetContainer = document.getElementById('smart-assist-widget-container');
    const triggerButton = document.getElementById('widget-trigger');
    const widgetPanel = document.getElementById('widget-panel');
    const closeButton = document.getElementById('close-btn');

    // --- NEW: Get a reference to the action buttons ---
    const improveButton = document.querySelector('.action-buttons button'); // Targets the first button

    // --- 1. Toggle Panel Visibility ---
    triggerButton.addEventListener('click', (e) => {
        e.stopPropagation();
        widgetPanel.classList.toggle('show');
    });

    closeButton.addEventListener('click', () => {
        widgetPanel.classList.remove('show');
    });

    // --- NEW: Add click listener to the "Improve" button ---
    improveButton.addEventListener('click', () => {
        console.log('Improve button clicked. Sending data to backend...');
        
        const testData = {
            text: 'Hello from the widget!'
        };

        // Use the fetch API to send data to our backend
        fetch('http://127.0.0.1:8000/api/process-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success! Backend response:', data);
            alert(`Backend replied: "${data.reply}"`);
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to connect to the backend.');
        });
    });

    // --- 2. Make the Widget Draggable (Code is unchanged) ---
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