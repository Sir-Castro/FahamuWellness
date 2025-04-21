/**
 * Fahamu - Mental Health and Wellness Chatbot
 * Chat Interface JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Text Chat Interface
    const textChatContainer = document.querySelector('.text-chat-container');
    const textChatBody = textChatContainer?.querySelector('.chat-body');
    const chatForm = document.querySelector('.chat-form');
    const chatInput = document.querySelector('.chat-input');
    const introMessage = document.querySelector('#intro-message');
    const suggestedPrompts = document.querySelector('.suggested-prompts');
    const suggestedPromptsToggle = document.querySelector('.suggested-prompts-toggle');
    
    // DOM Elements - Voice Chat Interface
    const voiceChatContainer = document.querySelector('.voice-chat-container');
    const voiceChatBody = voiceChatContainer?.querySelector('.chat-body');
    
    // Chat mode switcher
    const chatModeOptions = document.querySelectorAll('.chat-mode-option');
    
    // Initialize the chat interface
    function initChat() {
        // Setup event listeners
        setupEventListeners();
        
        // Display suggested prompts
        displaySuggestedPrompts();
        
        // Deal with network permission for speech recognition
        // Speech recognition often fails in Replit's environment due to network permission issues
        // This is a workaround to simulate voice functionality without relying on actual speech recognition
        // Remove the simulateVoiceInput function entirely
        // And modify the error handling in the recognition section as follows:

        if (window.voiceProcessor && window.voiceProcessor.recognition) {
            // Add event listener for network errors
            window.voiceProcessor.recognition.onerror = function(event) {
                console.error("Speech recognition error:", event.error);
                
                // If it's a network error, use simulated voice input instead (remove this block)
                if (event.error === 'network') {
                    // Show friendly message to user
                    const statusEls = document.querySelectorAll('.message-status');
                    statusEls.forEach(el => {
                        el.textContent = 'Voice recognition unavailable in this environment.';
                    });
                    
                    // Do not simulate voice input anymore
                    
                    // Remove the status message after a delay
                    setTimeout(() => {
                        statusEls.forEach(el => {
                            el.textContent = '';
                        });
                    }, 3000);
                }
            };
        }

        
        // Add welcome message to both chat interfaces
        if (introMessage && introMessage.textContent) {
            // Add to text chat
            if (textChatBody) {
                addBotMessage(textChatBody, introMessage.textContent);
            }
            
            // Add to voice chat
            if (voiceChatBody) {
                addBotMessage(voiceChatBody, introMessage.textContent);
            }
        } else {
            const defaultGreeting = "Hello! I'm Fahamu, your mental wellness companion. How are you feeling today?";
            
            // Add to text chat
            if (textChatBody) {
                addBotMessage(textChatBody, defaultGreeting);
            }
            
            // Add to voice chat
            if (voiceChatBody) {
                addBotMessage(voiceChatBody, defaultGreeting);
            }
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Handle chat form submission in text chat
        if (chatForm) {
            chatForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const message = chatInput.value.trim();
                
                if (message) {
                    // Add user message to chat
                    addUserMessage(textChatBody, message);
                    
                    // Clear input
                    chatInput.value = '';
                    
                    // Show typing indicator
                    showTypingIndicator(textChatBody);
                    
                    // Send message to server
                    sendMessage(textChatBody, message);
                }
            });
        }
        
        // Suggested prompts click
        if (suggestedPrompts) {
            suggestedPrompts.addEventListener('click', function(e) {
                const promptEl = e.target.closest('.suggested-prompt');
                if (promptEl) {
                    // Get the text content from the prompt
                    // When in collapsed mode, we need to use the title attribute
                    let promptText = '';
                    if (suggestedPrompts.classList.contains('expanded')) {
                        promptText = promptEl.textContent.trim();
                    } else {
                        promptText = promptEl.getAttribute('title') || promptEl.textContent.trim();
                    }
                    
                    chatInput.value = promptText;
                    chatForm.dispatchEvent(new Event('submit'));
                    
                    // Hide expanded suggestions if open
                    if (suggestedPrompts.classList.contains('expanded')) {
                        suggestedPrompts.classList.remove('expanded');
                        if (suggestedPromptsToggle && suggestedPromptsToggle.querySelector('i')) {
                            suggestedPromptsToggle.querySelector('i').className = 'fas fa-lightbulb';
                            suggestedPromptsToggle.title = 'Show more suggestions';
                        }
                    }
                }
            });
        }
    }
    
    // Function to simulate voice input for demo purposes when speech recognition fails
    function simulateVoiceInput() {
        // Sample voice inputs that would represent what a user might say
        const sampleInputs = [
            "I've been feeling anxious about my upcoming presentation",
            "How can I deal with stress at work?",
            "I've been having trouble sleeping lately",
            "What are some breathing exercises for anxiety?",
            "I feel overwhelmed with everything going on in my life",
            "Can you suggest some mindfulness techniques?",
            "I'm worried about my future"
        ];
        
        // Select a random input
        const randomInput = sampleInputs[Math.floor(Math.random() * sampleInputs.length)];
        
        // Update the listening indicator if in voice mode
        const listeningIndicator = document.querySelector('#listening-indicator');
        if (listeningIndicator) {
            listeningIndicator.textContent = `"${randomInput}"`;
            listeningIndicator.parentElement.classList.add('active');
        }
        
        // Simulate the voice recognition finishing
        setTimeout(() => {
            // Use the active chat body based on which mode is selected
            const activeChatBody = voiceChatContainer.classList.contains('active') ? 
                                    voiceChatBody : textChatBody;
            
            // Add the message to the chat
            addUserMessage(activeChatBody, randomInput);
            
            // If in text mode, update the input field
            if (textChatContainer.classList.contains('active')) {
                chatInput.value = randomInput;
            }
            
            // Show typing indicator 
            showTypingIndicator(activeChatBody);
            
            // Send the message
            sendMessage(activeChatBody, randomInput);
            
            // Reset listening indicator
            if (listeningIndicator) {
                setTimeout(() => {
                    listeningIndicator.textContent = 'Click microphone to start speaking';
                    listeningIndicator.parentElement.classList.remove('active');
                }, 1000);
            }
        }, 2000);
    }
    
    // Display suggested prompts with icons and categories
    function displaySuggestedPrompts() {
        if (suggestedPrompts) {
            // Clear existing prompts except for the toggle button
            const toggle = suggestedPrompts.querySelector('.suggested-prompts-toggle');
            suggestedPrompts.innerHTML = '';
            if (toggle) {
                suggestedPrompts.appendChild(toggle);
            }
            
            const prompts = [
                { text: "I've been feeling anxious lately", icon: "fas fa-heart", category: "feelings" },
                { text: "What breathing exercises help with anxiety?", icon: "fas fa-wind", category: "techniques" },
                { text: "I'm having trouble sleeping", icon: "fas fa-moon", category: "symptoms" },
                { text: "How can I calm my racing thoughts?", icon: "fas fa-brain", category: "symptoms" },
                { text: "Tell me about mindfulness", icon: "fas fa-leaf", category: "techniques" },
                { text: "What to do during a panic attack", icon: "fas fa-exclamation-circle", category: "emergency" },
                { text: "I feel overwhelmed at work", icon: "fas fa-briefcase", category: "situations" },
                { text: "Techniques for social anxiety", icon: "fas fa-users", category: "techniques" },
                { text: "How to handle uncertainty", icon: "fas fa-question-circle", category: "coping" },
                { text: "I'm worried about the future", icon: "fas fa-clock", category: "feelings" },
                { text: "Ways to improve my mood", icon: "fas fa-smile", category: "techniques" },
                { text: "How to start meditation", icon: "fas fa-om", category: "techniques" }
            ];
            // Map each prompt to a corresponding response
            const predefinedResponses = {
                "I've been feeling anxious lately": "I'm sorry you're feeling anxious. Deep breathing, grounding exercises, and speaking to someone you trust can help ease anxiety. Want me to guide you through a breathing exercise?",
                "What breathing exercises help with anxiety?": "A great place to start is the 4-7-8 technique: Inhale for 4 seconds, hold your breath for 7, and exhale slowly for 8. Want me to walk you through it?",
                "I'm having trouble sleeping": "Sleep troubles can be exhausting. Have you tried a relaxing bedtime routine, like dimming lights, limiting screens, and breathing exercises before bed?",
                "How can I calm my racing thoughts?": "Racing thoughts can be overwhelming. Mindfulness, journaling, and focusing on your senses are helpful techniques. Would you like me to guide you through one?",
                "Tell me about mindfulness": "Mindfulness is about focusing on the present moment without judgment. It can help ease stress and anxiety. Want a short exercise to try right now?",
                "What to do during a panic attack": "During a panic attack, remind yourself it will pass. Try breathing slowly, grounding with the 5-4-3-2-1 method, and finding a quiet place. Want me to guide you through one?",
                "I feel overwhelmed at work": "I'm sorry you're feeling overwhelmed. Prioritizing tasks, taking short breaks, and self-compassion can really help. Want me to suggest some stress relief techniques?",
                "Techniques for social anxiety": "Social anxiety can be tough. Practicing small interactions, breathing techniques, and preparing phrases ahead can help. Would you like some specific exercises?",
                "How to handle uncertainty": "Uncertainty is hard to live with, but focusing on what you can control and practicing mindfulness can help you find stability. Want me to show you an example?",
                "I'm worried about the future": "It's okay to feel uncertain about the future. Talking it out, planning small steps, and focusing on today can ease the load. Want help with setting short-term goals?",
                "Ways to improve my mood": "Boosting your mood can start small: go for a walk, listen to music, or chat with a friend. Want me to suggest a mood-boosting exercise?",
                "How to start meditation": "Starting meditation is simple: find a quiet spot, sit comfortably, and focus on your breath. Even 2 minutes can help. Want me to guide you through a beginner session?"
            };

            
            // Initially add just the first 6 prompts
            const initialPrompts = prompts.slice(0, 6);
            initialPrompts.forEach(prompt => {
                const promptElement = document.createElement('div');
                promptElement.className = 'suggested-prompt';
                promptElement.title = prompt.text; // Add title for collapsed view tooltip
                promptElement.innerHTML = `<i class="${prompt.icon}"></i><span>${prompt.text}</span>`;
                suggestedPrompts.appendChild(promptElement);
            });
            
            // Add the remaining prompts (will be shown when expanded)
            const additionalPrompts = prompts.slice(6);
            additionalPrompts.forEach(prompt => {
                const promptElement = document.createElement('div');
                promptElement.className = 'suggested-prompt';
                promptElement.title = prompt.text; // Add title for collapsed view tooltip
                promptElement.innerHTML = `<i class="${prompt.icon}"></i><span>${prompt.text}</span>`;
                suggestedPrompts.appendChild(promptElement);
            });
        }
    }
    
    // Send message to server
    function sendMessage(chatBody, message) {
        
        fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            // Hide typing indicator
            hideTypingIndicator(chatBody);
            
            // Add bot response to chat
            addBotMessage(chatBody, data.response);
            
            // Speak the response if auto-speak is enabled
            const autoSpeak = document.querySelector('#auto-speak');
            if (autoSpeak && autoSpeak.checked && window.voiceProcessor) {
                window.voiceProcessor.speak(data.response);
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            hideTypingIndicator(chatBody);
            addBotMessage(chatBody, "I'm sorry, there was an error processing your message. Please try again.");
        });
    }
    
    // Add user message to chat
    function addUserMessage(chatBody, message) {
        if (!chatBody) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-user animate__animated animate__fadeIn';
        messageElement.textContent = message;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = getCurrentTime();
        
        messageElement.appendChild(timestamp);
        chatBody.appendChild(messageElement);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // Add bot message to chat
    function addBotMessage(chatBody, message) {
        if (!chatBody) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-bot animate__animated animate__fadeIn';
        messageElement.textContent = message;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = getCurrentTime();
        
        messageElement.appendChild(timestamp);
        chatBody.appendChild(messageElement);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator(chatBody) {
        if (!chatBody) return;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message-typing';
        typingElement.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        typingElement.id = 'typing-indicator-' + (chatBody === textChatBody ? 'text' : 'voice');
        chatBody.appendChild(typingElement);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator(chatBody) {
        if (!chatBody) return;
        
        const indicatorId = 'typing-indicator-' + (chatBody === textChatBody ? 'text' : 'voice');
        const typingElement = document.getElementById(indicatorId);
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    // Get current time formatted as HH:MM
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutes}`;
    }
    
    // Initialize chat
    initChat();
});
