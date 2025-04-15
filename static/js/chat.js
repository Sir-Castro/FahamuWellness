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
                    const promptText = promptEl.textContent.trim();
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
            
            // Initially add just the first 6 prompts
            const initialPrompts = prompts.slice(0, 6);
            initialPrompts.forEach(prompt => {
                const promptElement = document.createElement('div');
                promptElement.className = 'suggested-prompt';
                promptElement.innerHTML = `<i class="${prompt.icon}"></i> ${prompt.text}`;
                suggestedPrompts.appendChild(promptElement);
            });
            
            // Add the remaining prompts (will be shown when expanded)
            const additionalPrompts = prompts.slice(6);
            additionalPrompts.forEach(prompt => {
                const promptElement = document.createElement('div');
                promptElement.className = 'suggested-prompt';
                promptElement.innerHTML = `<i class="${prompt.icon}"></i> ${prompt.text}`;
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
