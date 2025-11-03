// Run the main function to build and inject the widget
main();

function main() {
    // 1. Create the HTML for the widget
    const widgetHTML = `
        <div id="smart-assist-widget-container" style="position: fixed; bottom: 30px; right: 30px; z-index: 9999; cursor: grab; user-select: none;">
            <div class="widget-panel" id="widget-panel" style="display: none; position: absolute; bottom: 80px; right: 0; width: 320px; background-color: #2c2c34; color: #f0f0f0; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); overflow: hidden; cursor: default;">
                <div class="panel-header" style="padding: 12px 16px; background-color: #3a3a44; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                    SmartAssist.AI
                    <button class="close-btn" id="close-btn" style="background: none; border: none; color: #f0f0f0; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
                </div>
                <div class="panel-body" style="padding: 16px; font-size: 14px;">
                    <p style="margin: 0 0 16px 0; border-left: 3px solid #6e41e2; padding-left: 10px; opacity: 0.8;">Select text or I'll suggest actions!</p>
                    <div class="action-buttons">
                        <button id="smartassist-btn-improve" style="background-color: #4a4a54; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-right: 8px; font-size: 13px;">Improve</button>
                        <button id="smartassist-btn-explain" style="background-color: #4a4a54; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-right: 8px; font-size: 13px;">Explain</button>
                    </div>
                </div>
            </div>
            <button class="widget-trigger-button" id="widget-trigger" style="background-color: #6e41e2; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; font-size: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.2s ease; display: flex; align-items: center; justify-content: center;">
                🧠
            </button>
        </div>
    `;

    // 2. Append the HTML to the current website's body
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // 3. Get references to all the elements we just created
    const widgetContainer = document.getElementById('smart-assist-widget-container');
    const triggerButton = document.getElementById('widget-trigger');
    const widgetPanel = document.getElementById('widget-panel');
    const closeButton = document.getElementById('close-btn');
    const improveButton = document.getElementById('smartassist-btn-improve');
    const explainButton = document.getElementById('smartassist-btn-explain');

    // 4. Add all our event listeners

    // --- Toggle Panel Visibility ---
    triggerButton.addEventListener('click', (e) => {
        e.stopPropagation();
        widgetPanel.style.display = widgetPanel.style.display === 'block' ? 'none' : 'block';
    });

    closeButton.addEventListener('click', () => {
        widgetPanel.style.display = 'none';
    });

    // --- Button Click Handlers ---
    improveButton.addEventListener('click', () => callBackend('improve'));
    explainButton.addEventListener('click', () => callBackend('explain'));

    // --- Reusable function to call the backend ---
    function callBackend(actionType) {
        // ... (callBackend function code is unchanged) ...
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

    // --- Draggable Logic (Unchanged) ---
    let isDragging = false;
    let offsetX, offsetY;
    const onMouseDown = (e) => {
        if (e.target === widgetContainer || e.target === triggerButton || triggerButton.contains(e.target)) {
            isDragging = true;
            widgetContainer.style.cursor = 'grabbing';
            offsetX = e.clientX - widgetContainer.getBoundingClientRect().left;
            offsetY = e.clientY - widgetContainer.getBoundingClientRect().top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp, { once: true });
        }
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


    // --- 5. BEHAVIOR TRACKING (RESEARCH COMPONENT) ---
    
    let hoverTimer; // Timer to track how long the user hovers
    let lastScrollTime = Date.now();
    let scrollSpeed = 0;

    // Listen for mouse movements over the whole page
    document.addEventListener('mouseover', (e) => {
        // Clear any existing timer
        clearTimeout(hoverTimer);

        const target = e.target;
        
        // Check if we are hovering over a paragraph or a code block
        if (target.tagName === 'P' || target.tagName === 'CODE' || target.tagName === 'PRE') {
            
            // Check if the element has enough text to be interesting
            if (target.textContent.length > 100) {
                // Start a timer. If the user hovers for 3 seconds, log it.
                hoverTimer = setTimeout(() => {
                    console.log('--- Proactive Signal ---');
                    console.log('User is hovering over a long piece of text.');
                    console.log('Element Type:', target.tagName);
                    console.log('Text (snippet):', target.textContent.substring(0, 50) + '...');
                    // In the future, we will send this data to the backend.
                    // For now, we'll just log it.
                }, 3000); // 3 seconds
            }
        }
    });

    // Listen for mouse moving off an element
    document.addEventListener('mouseout', () => {
        // User moved their mouse away, so cancel the timer
        clearTimeout(hoverTimer);
    });

    // Listen for scroll events to check speed
    document.addEventListener('scroll', () => {
        const now = Date.now();
        const timeDelta = now - lastScrollTime;
        
        // Calculate speed (a simple value, not pixels/sec)
        // A smaller timeDelta means faster scrolling
        scrollSpeed = timeDelta; 
        lastScrollTime = now;

        if (scrollSpeed < 100) {
            // This is "fast scrolling" (skimming)
            // console.log('Scroll Speed: FAST');
        } else {
            // This is "slow scrolling" (reading)
            // console.log('Scroll Speed: SLOW');
        }
    });
}