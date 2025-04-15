/**
 * Fahamu - Mental Health and Wellness Chatbot
 * Chat Interface JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatBody = document.querySelector('.chat-body');
    const chatForm = document.querySelector('.chat-form');
    const chatInput = document.querySelector('.chat-input');
    const voiceToggle = document.querySelector('.chat-voice-toggle');
    const introMessage = document.querySelector('#intro-message');
    const suggestedPrompts = document.querySelector('.suggested-prompts');
    const messageStatus = document.querySelector('.message-status');
    
    // Voice related variables
    let isListening = false;
    let recognition = null;
    let synthesis = window.speechSynthesis;
    let speechConfig = {
        voice: null,
        pitch: parseFloat(document.querySelector('#voice-pitch-value').textContent) || 1,
        rate: parseFloat(document.querySelector('#voice-speed-value').textContent) || 1,
        voiceType: document.querySelector('#voice-preference').value || 'female'
    };
    
    // Initialize the chat interface
    function initChat() {
        // Setup SpeechRecognition if supported
        setupSpeechRecognition();
        
        // Setup speech synthesis
        setupSpeechSynthesis();
        
        // Add event listeners
        setupEventListeners();
        
        // Display suggested prompts
        displaySuggestedPrompts();
        
        // Add welcome message
        if (introMessage && introMessage.textContent) {
            addBotMessage(introMessage.textContent);
        } else {
            addBotMessage("Hello! I'm Fahamu, your anxiety therapy assistant. How are you feeling today?");
        }
    }
    
    // Setup Web Speech API for speech recognition
    function setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            recognition.onstart = function() {
                isListening = true;
                voiceToggle.classList.add('chat-voice-active');
                updateMessageStatus('Listening...');
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                chatInput.value = transcript;
                updateMessageStatus('Processing...');
                
                // Simulate form submission
                setTimeout(() => {
                    chatForm.dispatchEvent(new Event('submit'));
                }, 500);
            };
            
            recognition.onend = function() {
                isListening = false;
                voiceToggle.classList.remove('chat-voice-active');
                updateMessageStatus('');
            };
            
            recognition.onerror = function(event) {
                console.error('Speech recognition error:', event.error);
                isListening = false;
                voiceToggle.classList.remove('chat-voice-active');
                updateMessageStatus('Speech recognition error. Please try again.');
                
                setTimeout(() => {
                    updateMessageStatus('');
                }, 3000);
            };
        } else {
            console.warn('Speech Recognition API not supported in this browser');
            voiceToggle.style.display = 'none';
        }
    }
    
    // Setup Web Speech API for speech synthesis
    function setupSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            // Get available voices
            let voices = [];
            
            function setVoices() {
                voices = synthesis.getVoices();
                
                // Set default voice based on preference
                if (voices.length > 0) {
                    speechConfig.voice = findVoice(speechConfig.voiceType);
                }
            }
            
            // Chrome loads voices asynchronously
            if (synthesis.onvoiceschanged !== undefined) {
                synthesis.onvoiceschanged = setVoices;
            }
            
            // Set initial voices
            setVoices();
            
            // Update voice settings if controls exist
            const voiceGenderSelect = document.querySelector('#voice-gender');
            const voicePitchRange = document.querySelector('#voice-pitch');
            const voiceSpeedRange = document.querySelector('#voice-speed');
            
            if (voiceGenderSelect) {
                voiceGenderSelect.addEventListener('change', function() {
                    speechConfig.voiceType = this.value;
                    speechConfig.voice = findVoice(speechConfig.voiceType);
                });
            }
            
            if (voicePitchRange) {
                voicePitchRange.addEventListener('input', function() {
                    speechConfig.pitch = parseFloat(this.value);
                    document.querySelector('#voice-pitch-value').textContent = this.value;
                });
            }
            
            if (voiceSpeedRange) {
                voiceSpeedRange.addEventListener('input', function() {
                    speechConfig.rate = parseFloat(this.value);
                    document.querySelector('#voice-speed-value').textContent = this.value;
                });
            }
        } else {
            console.warn('Speech Synthesis API not supported in this browser');
        }
    }
    
    // Find appropriate voice based on gender preference
    function findVoice(voiceType) {
        const voices = synthesis.getVoices();
        
        // Try to find a matching voice
        let preferredVoice = voices.find(voice => {
            const voiceName = voice.name.toLowerCase();
            if (voiceType === 'male') {
                return voiceName.includes('male') || 
                       (voiceName.includes('david') || 
                        voiceName.includes('james') || 
                        voiceName.includes('daniel'));
            } else {
                return voiceName.includes('female') || 
                       (voiceName.includes('lisa') || 
                        voiceName.includes('sarah') || 
                        voiceName.includes('karen'));
            }
        });
        
        // If no matching voice found, use the first available
        if (!preferredVoice && voices.length > 0) {
            preferredVoice = voices[0];
        }
        
        return preferredVoice;
    }
    
    // Speak text using speech synthesis
    function speakText(text) {
        if ('speechSynthesis' in window) {
            // Stop any current speech
            if (synthesis.speaking) {
                synthesis.cancel();
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set speech properties
            utterance.voice = speechConfig.voice;
            utterance.pitch = speechConfig.pitch;
            utterance.rate = speechConfig.rate;
            
            // Speak the text
            synthesis.speak(utterance);
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Handle chat form submission
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const message = chatInput.value.trim();
            
            if (message) {
                // Add user message to chat
                addUserMessage(message);
                
                // Clear input
                chatInput.value = '';
                
                // Show typing indicator
                showTypingIndicator();
                
                // Send message to server
                sendMessage(message);
            }
        });
        
        // Toggle voice recognition
        voiceToggle.addEventListener('click', function() {
            if (recognition) {
                if (isListening) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            }
        });
        
        // Suggested prompts click
        if (suggestedPrompts) {
            suggestedPrompts.addEventListener('click', function(e) {
                if (e.target.classList.contains('suggested-prompt')) {
                    chatInput.value = e.target.textContent;
                    chatForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }
    
    // Display suggested prompts
    function displaySuggestedPrompts() {
        if (suggestedPrompts) {
            const prompts = [
                "I've been feeling anxious lately",
                "What breathing exercises help with anxiety?",
                "I'm having trouble sleeping",
                "How can I calm my racing thoughts?",
                "Tell me about mindfulness",
                "What to do during a panic attack"
            ];
            
            prompts.forEach(prompt => {
                const promptElement = document.createElement('button');
                promptElement.className = 'suggested-prompt';
                promptElement.textContent = prompt;
                suggestedPrompts.appendChild(promptElement);
            });
        }
    }
    
    // Send message to server
    function sendMessage(message) {
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
            hideTypingIndicator();
            
            // Add bot response to chat
            addBotMessage(data.response);
            
            // Speak the response if needed
            if (document.querySelector('#auto-speak') && 
                document.querySelector('#auto-speak').checked) {
                speakText(data.response);
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            addBotMessage("I'm sorry, there was an error processing your message. Please try again.");
        });
    }
    
    // Add user message to chat
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-user';
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
    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-bot';
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
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message-typing';
        typingElement.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        typingElement.id = 'typing-indicator';
        chatBody.appendChild(typingElement);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }
    
    // Update message status
    function updateMessageStatus(status) {
        if (messageStatus) {
            messageStatus.textContent = status;
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
