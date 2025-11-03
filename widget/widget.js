// Wait for the page to be fully loaded
window.addEventListener('load', main);

// Use an async function so we can 'await' our HTML
async function main() {
    
    // 1. Fetch and Inject the Widget's HTML
    try {
        const widgetURL = chrome.runtime.getURL('widget.html');
        const response = await fetch(widgetURL);
        const widgetHTML = await response.text();
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    } catch (error) {
        console.error("SmartAssist: Failed to load widget HTML.", error);
        return;
    }

    // 2. Get references to all the elements
    const widgetContainer = document.getElementById('smart-assist-widget-container');
    const triggerButton = document.getElementById('widget-trigger');
    const widgetPanel = document.getElementById('widget-panel');
    const closeButton = document.getElementById('close-btn');
    const improveButton = document.getElementById('smartassist-btn-improve');
    const explainButton = document.getElementById('smartassist-btn-explain');

    // 3. Add Event Listeners
    
    // --- Draggable vs. Click Logic ---
    let hasDragged = false;
    let isDragging = false;
    let offsetX, offsetY;

    const onMouseDown = (e) => {
        // Check if the click is on a draggable part
        if (e.target === triggerButton || triggerButton.contains(e.target)) {
            isDragging = true;
            hasDragged = false; // Reset on every mousedown
            widgetContainer.style.cursor = 'grabbing';
            offsetX = e.clientX - widgetContainer.getBoundingClientRect().left;
            offsetY = e.clientY - widgetContainer.getBoundingClientRect().top;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp, { once: true });
        }
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        hasDragged = true; // Mark that a drag has occurred
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

    // Add the mousedown listener to the button
    triggerButton.addEventListener('mousedown', onMouseDown);

    // --- Panel Toggle ---
    triggerButton.addEventListener('click', (e) => {
        // This is the fix: Only toggle the panel if the user did NOT drag
        if (hasDragged) {
            e.stopPropagation();
            return;
        }
        widgetPanel.classList.toggle('show'); // Toggles the CSS class
    });

    closeButton.addEventListener('click', () => {
        widgetPanel.classList.remove('show');
    });

    // --- Reactive AI Button Handlers ---
    improveButton.addEventListener('click', () => callBackend('improve'));
    explainButton.addEventListener('click', () => callBackend('explain'));


    // --- 4. Reusable function to call the REACTIVE backend ---
    function callBackend(actionType) {
        const selectedText = window.getSelection().toString().trim();
        if (!selectedText) {
            alert("Please select some text on the page first!");
            return;
        }

        console.log(`Sending action: "${actionType}" with text: "${selectedText}"`);
        alert("Asking the AI... please wait a moment.");

        fetch('http://127.0.0.1:8000/api/process-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: selectedText,
                action: actionType 
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                alert(`AI Response:\n\n${data.reply}`);
            }
        })
        .catch((error) => {
            console.error('Error connecting to backend:', error);
            alert('Failed to connect to the backend.');
        });
    }

    // --- 5. BEHAVIOR TRACKING (RESEARCH COMPONENT) ---
    let hoverTimer; 
    let lastScrollTime = Date.now();
    let lastHoveredElement = null;
    
    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (target === lastHoveredElement || !target.textContent) return;
        
        lastHoveredElement = target;
        clearTimeout(hoverTimer);

        const tagName = target.tagName;
        const textLength = target.textContent.length;
        
        const isInterestingTag = (tagName === 'P' || tagName === 'CODE' || tagName === 'PRE' || tagName === 'DIV' || tagName === 'SPAN' || tagName === 'A');
        const isLongEnough = textLength > 150;

        if (isInterestingTag && isLongEnough) {
            const hoverTime = (tagName === 'CODE' || tagName === 'PRE') ? 3000 : 5000;
            hoverTimer = setTimeout(() => {
                const scrollSpeed = Date.now() - lastScrollTime;
                const behaviorData = {
                    elementType: tagName,
                    hoverTime: hoverTime / 1000,
                    scrollSpeed: scrollSpeed
                };
                callProactiveBackend(behaviorData);
            }, hoverTime);
        }
    });

    document.addEventListener('mouseout', () => {
        clearTimeout(hoverTimer);
        lastHoveredElement = null;
    });

    document.addEventListener('scroll', () => {
        lastScrollTime = Date.now();
    });

    // --- 6. Function to call the PROACTIVE backend ---
    function callProactiveBackend(behaviorData) {
        console.log("Sending behavior data:", behaviorData);

        fetch('http://127.0.0.1:8000/api/proactive-suggestion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(behaviorData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.suggestion && data.suggestion !== "none") {
                console.log("Received suggestion:", data.message);
                alert(`SmartAssist AI Suggests:\n\n${data.message}`);
            }
        })
        .catch((error) => {
            console.error('Error with proactive suggestion:', error);
        });
    }
}