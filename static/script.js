const outputContainer = document.getElementById('output-container');

function setButtonsState(disabled) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = disabled);
}

// New function to copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy: ", err);
    });
}

async function runCommand(command) {
    setButtonsState(true);
    outputContainer.innerHTML = `
        <div class="loader-container">
            <div class="spinner"></div>
            <p>Executing: ${command}...</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/run-command?cmd=${encodeURIComponent(command)}`);
        const result = await response.json();

        if (result.success) {
            // Escape the output safely for HTML display
            const safeOutput = result.output.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const safeCommand = command.replace(/</g, "&lt;");
            
            // Store text safely for the copy button
            const textForCopy = encodeURIComponent(result.output);

            outputContainer.innerHTML = `
                <div class="command-block">
                    <div class="command-title">
                        <span>&gt; ${safeCommand}</span>
                        <button class="copy-btn" onclick="copyToClipboard(decodeURIComponent('${textForCopy}'))">COPY</button>
                    </div>
                    <pre class="output-text">${safeOutput}</pre>
                </div>
            `;
        } else {
            outputContainer.innerHTML = `<div class="error-msg">Error: ${result.error}</div>`;
        }
    } catch (error) {
        outputContainer.innerHTML = `<div class="error-msg">Network Error: ${error.message}</div>`;
    } finally {
        setButtonsState(false);
    }
}

async function runAllCommands() {
    setButtonsState(true);
    outputContainer.innerHTML = `
        <div class="loader-container">
            <div class="spinner"></div>
            <p>Connecting to router and pulling all configurations...</p>
        </div>
    `;

    try {
        const response = await fetch('/api/run-all');
        const result = await response.json();

        if (result.success) {
            let finalHTML = '';
            
            for (const [cmd, output] of Object.entries(result.data)) {
                const safeOutput = output.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                const safeCommand = cmd.replace(/</g, "&lt;");
                const textForCopy = encodeURIComponent(output);

                finalHTML += `
                    <div class="command-block">
                        <div class="command-title">
                            <span>&gt; ${safeCommand}</span>
                            <button class="copy-btn" onclick="copyToClipboard(decodeURIComponent('${textForCopy}'))">COPY</button>
                        </div>
                        <pre class="output-text">${safeOutput}</pre>
                    </div>
                `;
            }
            outputContainer.innerHTML = finalHTML;
        } else {
            outputContainer.innerHTML = `<div class="error-msg">Error: ${result.error}</div>`;
        }
    } catch (error) {
        outputContainer.innerHTML = `<div class="error-msg">Network Error: ${error.message}</div>`;
    } finally {
        setButtonsState(false);
    }
}