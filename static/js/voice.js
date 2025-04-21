/**
 * Fahamu - Voice Processing Module
 * Handles speech recognition and synthesis
 */

/**
 * Fahamu - Voice Processing Module
 * Handles speech recognition and synthesis
 */

class VoiceProcessor {
    constructor(options = {}) {
        // Default options
        this.options = {
            language: 'en-US',
            continuous: false,
            interimResults: false,
            ...options
        };

        // State variables
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.continuousMode = false;

        // Voice settings
        this.settings = {
            voice: null,
            pitch: options.pitch || 1.0,
            speed: options.speed || 1.0,
            voiceType: options.voiceType || 'male'
        };
        this.voiceChatEnabled = options.voiceChatEnabled || false;

        // Initialize the voice processor
        this.init();

    }

    // Initialize voice functionality
    init() {
        this.setupSpeechRecognition();
        this.setupSpeechSynthesis();
    }

    // Setup speech recognition
    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = this.options.continuous;
            this.recognition.interimResults = this.options.interimResults;
            this.recognition.lang = this.options.language;

            // Setup event handlers
            this.recognition.onstart = () => {
                this.isListening = true;
                this.triggerEvent('recognitionStart');
            };

            this.recognition.onresult = (event) => {
                const lastResultIndex = event.results.length - 1;
                const transcript = event.results[lastResultIndex][0].transcript.trim();
                const isFinal = event.results[lastResultIndex].isFinal;

                if (isFinal && transcript.length > 0) {
                    this.triggerEvent('recognitionResult', {
                        transcript,
                        isFinal,
                        confidence: event.results[lastResultIndex][0].confidence
                    });
                } else {
                    console.log('Ignored empty or non-final transcript:', transcript);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.triggerEvent('recognitionEnd');
            
                if (this.continuousMode) {
                    setTimeout(() => {
                        if (!this.isListening) {
                            this.startListening();
                        }
                    }, 500);
                }
            };
            

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.triggerEvent('recognitionError', event.error);
            };
        } else {
            console.warn('Speech Recognition API not supported in this browser');
            this.triggerEvent('apiNotSupported', 'recognition');
        }
    }

    // Setup speech synthesis
    setupSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                this.voices = this.synthesis.getVoices();
                this.settings.voice = this.findVoice(this.settings.voiceType);
                this.triggerEvent('voicesLoaded', this.voices);
    
                // Safe to initiate voice chat after voices are ready
                if (this.voiceChatEnabled && !this.isListening) {
                    this.initiateVoiceChat();
                }
            };
            if (!VoiceProcessor._voicesChangedSet) {
                this.synthesis.onvoiceschanged = loadVoices;
                VoiceProcessor._voicesChangedSet = true;
            }
            loadVoices();
        } else {
            console.warn('Speech Synthesis API not supported in this browser');
            this.triggerEvent('apiNotSupported', 'synthesis');
        }
    }
    initiateVoiceChat() {
        const greeting = "Hello! Voice chat is now enabled.";
        this.speak(greeting);
    }
    

    // Enable or disable continuous listening mode
    setContinuousMode(enabled) {
        this.continuousMode = enabled;

        if (this.recognition) {
            this.recognition.continuous = enabled;
        }

        if (enabled && !this.isListening) {
            this.startListening();
        }

        this.triggerEvent('continuousModeChanged', enabled);
    }

    // Start speech recognition with a customizable wait time
    startListening(prepTime = 1500) {  // Default to 1.5 seconds
        if (this.recognition && !this.isListening) {
            try {
                this.triggerEvent('preparingToListen');  // Notify UI to show "Get Ready" signal
                setTimeout(() => {
                    this.recognition.start();
                }, prepTime);
            } catch (error) {
                console.error('Speech recognition start error:', error);
                this.triggerEvent('recognitionError', 'Failed to start recognition');
            }
        }
    }

    // Stop speech recognition
    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                // Ensure continuous mode is disabled
                this.continuousMode = false;
                this.triggerEvent('continuousModeChanged', false);
            } catch (error) {
                console.error('Speech recognition stop error:', error);
            }
        }
    }

    // Toggle speech recognition
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    // Speak text
    speak(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            this.stopSpeaking();

            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);

            // Set voice properties
            utterance.voice = this.settings.voice;
            utterance.pitch = this.settings.pitch;
            utterance.rate = this.settings.speed;

            // Set event handlers
            utterance.onstart = () => {
                this.triggerEvent('speakStart');
            };

            utterance.onend = () => {
                this.triggerEvent('speakEnd');
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                this.triggerEvent('speakError', event.error);
            };

            // Speak the text
            this.synthesis.speak(utterance);

            return true;
        }

        return false;
    }

    // Stop speaking
    stopSpeaking() {
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.cancel();
        }
    }

    // Update voice settings
    updateVoiceSettings(settings) {
        this.settings = {
            ...this.settings,
            ...settings
        };

        // Update voice based on type if needed
        if (settings.voiceType) {
            this.settings.voice = this.findVoice(settings.voiceType);
        }

        this.triggerEvent('voiceSettingsUpdated', this.settings);
    }

    // Find voice based on specified type (male/female)
    findVoice(voiceType) {
        // Ensure voices are loaded
        if (!this.voices || this.voices.length === 0) {
            this.voices = this.synthesis.getVoices();
        }

        // Define language pattern to match English voices
        const languagePattern = /^en(-[A-Z]{2})?$/;

        // Define comprehensive lists of name patterns that typically indicate gender
        const femalePatterns = [
            'female', 'woman', 'girl', 'lisa', 'sarah', 'karen', 'moira', 'samantha',
            'victoria', 'fiona', 'tessa', 'monica', 'kathy', 'susan', 'amy', 'emma',
            'joanna', 'salli', 'kimberly', 'nicole', 'ivy', 'ava'
        ];

        const malePatterns = [
            'male', 'man', 'guy', 'boy', 'david', 'james', 'john', 'mark', 'paul',
            'daniel', 'thomas', 'matthew', 'robert', 'michael', 'brian', 'kevin',
            'george', 'william', 'joseph', 'richard', 'charles', 'alex'
        ];

        // Select pattern list based on voice type
        const patterns = voiceType === 'male' ? malePatterns : femalePatterns;

        // Try to find a matching voice
        let preferredVoice = this.voices.find(voice => {
            // First ensure it's an English voice
            const isEnglish = languagePattern.test(voice.lang);
            if (!isEnglish) return false;

            // Then check the name against patterns
            const voiceName = voice.name.toLowerCase();
            return patterns.some(pattern => voiceName.includes(pattern));
        });

        // Log voice selection for debugging
        console.log(`Voice selection for ${voiceType}:`, preferredVoice?.name || 'No matching voice found');

        // If no matching voice found, use any English voice
        if (!preferredVoice) {
            // Filter to just English voices
            const englishVoices = this.voices.filter(voice => languagePattern.test(voice.lang));

            if (englishVoices.length > 0) {
                console.log(`Using fallback English voice: ${englishVoices[0].name}`);
                preferredVoice = englishVoices[0];
            } else if (this.voices.length > 0) {
                // Last resort - use any available voice
                console.log(`Using fallback to any voice: ${this.voices[0].name}`);
                preferredVoice = this.voices[0];
            }
        }

        return preferredVoice || null;
    }

    // Handle events
    triggerEvent(eventName, data) {
        // Trigger custom event
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    // Initiate the voice chat by speaking "Hello there"
    initiateVoiceChat() {
        // Speak the greeting message first
        this.speak("Hello there");

        // After a brief pause, start listening
        setTimeout(() => {
            this.startListening();
        }, 1500);  // Pause for 1.5 seconds before listening
    }
}


// Initialize the voice processor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create global voice processor instance with initial settings from the page
    const pitch = parseFloat(document.querySelector('#voice-pitch')?.value || 1);
    const speed = parseFloat(document.querySelector('#voice-speed')?.value || 1);
    const voiceType = document.querySelector('#voice-preference')?.value || 'male';
    
    
    window.voiceProcessor = new VoiceProcessor({
        pitch: pitch,
        speed: speed,
        voiceType: voiceType,
        interimResults: true
    });
        // Voice gender switch buttons
    const maleVoiceBtn = document.querySelector('#male-voice-btn');
    const femaleVoiceBtn = document.querySelector('#female-voice-btn');
    // Ensure voices are loaded
    const loadVoices = () => {
        this.voices = this.synthesis.getVoices();
        this.settings.voice = this.findVoice(this.settings.voiceType);
        this.triggerEvent('voicesLoaded', this.voices);
    };

    
    if (maleVoiceBtn) {
        maleVoiceBtn.addEventListener('click', () => {
            window.voiceProcessor.setMaleVoice();
        });
    }

    if (femaleVoiceBtn) {
        femaleVoiceBtn.addEventListener('click', () => {
            window.voiceProcessor.setFemaleVoice();
        });
    }
    document.addEventListener('DOMContentLoaded', () => {
        const micButton = document.getElementById('voice-toggle-btn');
        const listeningIndicator = document.getElementById('listening-indicator');
    
        micButton.addEventListener('click', () => {
            voiceProcessor.toggleListening();
        });
    
        voiceProcessor.triggerEvent = function(eventType, data) {
            switch(eventType) {
                case 'recognitionStart':
                    listeningIndicator.textContent = 'Listening...';
                    micButton.classList.add('active');  // You can add a CSS glow or color change
                    break;
                case 'recognitionResult':
                    console.log('User said:', data.transcript);
                    listeningIndicator.textContent = `You said: "${data.transcript}"`;
                    // Optionally send `data.transcript` to your server here
                    break;
                case 'recognitionEnd':
                    listeningIndicator.textContent = 'Click microphone to start speaking';
                    micButton.classList.remove('active');
                    break;
                case 'recognitionError':
                    listeningIndicator.textContent = 'Error. Try again.';
                    break;
                case 'apiNotSupported':
                    listeningIndicator.textContent = 'Speech API not supported in this browser';
                    break;
                default:
                    console.log(`Unhandled event: ${eventType}`, data);
            }
        };
    });
    
    
    // Chat mode switcher
    const chatModeOptions = document.querySelectorAll('.chat-mode-option');
    const textChatContainer = document.querySelector('.text-chat-container');
    const voiceChatContainer = document.querySelector('.voice-chat-container');
    
    if (chatModeOptions.length) {
        chatModeOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Update active class
                chatModeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide appropriate container
                const mode = this.dataset.mode;
                if (mode === 'text') {
                    textChatContainer.classList.add('active');
                    voiceChatContainer.classList.remove('active');
                    // Stop listening if active
                    window.voiceProcessor.stopListening();
                } else if (mode === 'voice') {
                    textChatContainer.classList.remove('active');
                    voiceChatContainer.classList.add('active');
                }
            });
        });
    }
    
    // Voice toggle buttons
    const voiceToggleBtns = document.querySelectorAll('.chat-voice-toggle');
    voiceToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.voiceProcessor.toggleListening();
        });
    });
    
    // Continuous mode toggle
    const continuousModeToggle = document.querySelector('#continuous-mode');
    if (continuousModeToggle) {
        continuousModeToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const isActive = this.classList.contains('active');
            window.voiceProcessor.setContinuousMode(isActive);
        });
    }
    
    // Suggested prompts toggle
    const suggestedPromptsToggle = document.querySelector('.suggested-prompts-toggle');
    const suggestedPrompts = document.querySelector('.suggested-prompts');
    if (suggestedPromptsToggle && suggestedPrompts) {
        suggestedPromptsToggle.addEventListener('click', function() {
            suggestedPrompts.classList.toggle('expanded');
            // Update icon based on state
            const icon = this.querySelector('i');
            if (suggestedPrompts.classList.contains('expanded')) {
                icon.className = 'fas fa-times';
                this.title = 'Hide suggestions';
            } else {
                icon.className = 'fas fa-lightbulb';
                this.title = 'Show more suggestions';
            }
        });
    }
    
    // Voice settings controls
    const voiceGenderSelect = document.querySelector('#voice-gender');
    const voicePitchRange = document.querySelector('#voice-pitch');
    const voiceSpeedRange = document.querySelector('#voice-speed');
    
    if (voiceGenderSelect) {
        voiceGenderSelect.addEventListener('change', function() {
            const gender = voiceGenderSelect.value;
            if (gender === 'male') {
                window.voiceProcessor.setMaleVoice();
            } else if (gender === 'female') {
                window.voiceProcessor.setFemaleVoice();
            }
        });
    }
    
    if (voicePitchRange) {
        voicePitchRange.addEventListener('input', function() {
            const pitch = parseFloat(this.value);
            window.voiceProcessor.updateVoiceSettings({
                pitch: pitch
            });
            
            // Update display value
            const displayEl = document.querySelector('#voice-pitch-value');
            if (displayEl) {
                displayEl.textContent = pitch.toFixed(1);
            }
        });
    }
    
    if (voiceSpeedRange) {
        voiceSpeedRange.addEventListener('input', function() {
            const speed = parseFloat(this.value);
            window.voiceProcessor.updateVoiceSettings({
                speed: speed
            });
            
            // Update display value
            const displayEl = document.querySelector('#voice-speed-value');
            if (displayEl) {
                displayEl.textContent = speed.toFixed(1);
            }
        });
    }
    function speakText(text) {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(text);
    
        // Get values from the UI
        const gender = document.getElementById('voice-gender').value;
        const pitch = parseFloat(document.getElementById('voice-pitch').value);
        const rate = parseFloat(document.getElementById('voice-speed').value);
    
        // Set pitch and rate
        utterThis.pitch = pitch;
        utterThis.rate = rate;
    
        // Select voice based on gender
        const voices = synth.getVoices();
        const selectedVoice = voices.find(voice => 
            (gender === "female" && voice.name.toLowerCase().includes("female")) ||
            (gender === "male" && voice.name.toLowerCase().includes("male"))
        ) || voices[0]; // fallback
    
        utterThis.voice = selectedVoice;
    
        synth.speak(utterThis);
    }
    
    // Example usage:
    // speakText("Hello! How are you today?");
    
    function getSelectedVoice(gender) {
        const voices = window.speechSynthesis.getVoices();
    
        if (gender === 'female') {
            // Try to pick a common female voice
            return voices.find(voice => voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('google us english'));
        } else if (gender === 'male') {
            // Try to pick a common male voice
            return voices.find(voice => voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('david') || voice.name.toLowerCase().includes('google uk english'));
        }
        return voices[0]; // fallback
    }
    
    function speak(text) {
        const gender = document.getElementById('voice-gender').value;
        const utterance = new SpeechSynthesisUtterance(text);
    
        const selectedVoice = getSelectedVoice(gender);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    
        window.speechSynthesis.speak(utterance);
    }
    
    // On page load to ensure voices are loaded properly
    window.speechSynthesis.onvoiceschanged = () => {
        console.log("Available voices updated!");
    };
    
    // Handle voice animation SVG
    const voiceAnimation = document.querySelector('#voice-animation');
    if (voiceAnimation) {
        voiceAnimation.addEventListener('load', function() {
            const svgDoc = voiceAnimation.contentDocument;
            const waves = svgDoc.querySelectorAll('.wave');
            
            // Function to update wave colors
            window.updateVoiceWaveColors = (isUser) => {
                waves.forEach(wave => {
                    if (isUser) {
                        wave.classList.remove('bot');
                        wave.classList.add('user');
                    } else {
                        wave.classList.remove('user');
                        wave.classList.add('bot');
                    }
                });
            };
            
            // Set initial color
            window.updateVoiceWaveColors(false);
        });
    }
    
    // Event listeners for voice events
    document.addEventListener('voice:recognitionStart', () => {
        // Update UI for all voice toggle buttons
        voiceToggleBtns.forEach(btn => {
            btn.classList.add('chat-voice-active');
            if (btn.querySelector('i')) {
                btn.querySelector('i').className = 'fas fa-stop';
            }
        });
        
        // Update status messages
        const statusEls = document.querySelectorAll('.message-status');
        statusEls.forEach(el => {
            el.textContent = 'Listening...';
        });
        
        // Update listening indicator
        const listeningIndicator = document.querySelector('#listening-indicator');
        if (listeningIndicator) {
            listeningIndicator.textContent = 'Listening... Speak now';
            listeningIndicator.parentElement.classList.add('active');
        }
        
        // Update voice visualization
        if (window.updateVoiceWaveColors) {
            window.updateVoiceWaveColors(true);
        }
    });
    
    document.addEventListener('voice:recognitionEnd', () => {
        // Update UI for all voice toggle buttons
        voiceToggleBtns.forEach(btn => {
            btn.classList.remove('chat-voice-active');
            if (btn.querySelector('i')) {
                btn.querySelector('i').className = 'fas fa-microphone';
            }
        });
        
        // Update status messages
        const statusEls = document.querySelectorAll('.message-status');
        statusEls.forEach(el => {
            el.textContent = '';
        });
        
        // Update listening indicator
        const listeningIndicator = document.querySelector('#listening-indicator');
        if (listeningIndicator) {
            listeningIndicator.textContent = 'Click microphone to start speaking';
            listeningIndicator.parentElement.classList.remove('active');
        }
        
        // Update voice visualization
        if (window.updateVoiceWaveColors) {
            window.updateVoiceWaveColors(false);
        }
    });
    
    document.addEventListener('voice:recognitionResult', (event) => {
        const transcript = event.detail.transcript;
        const isFinal = event.detail.isFinal;
        
        // Always update the listening indicator with current transcript
        const listeningIndicator = document.querySelector('#listening-indicator');
        if (listeningIndicator && transcript) {
            listeningIndicator.textContent = `"${transcript}"`;
        }
        
        if (isFinal) {
            // Update text input in text chat mode
            const chatInput = document.querySelector('.chat-input');
            if (chatInput) {
                chatInput.value = transcript;
                
                // Auto submit if enabled
                const autoSubmit = document.querySelector('#auto-submit');
                if (autoSubmit && autoSubmit.checked) {
                    const chatForm = document.querySelector('.chat-form');
                    if (chatForm) {
                        chatForm.dispatchEvent(new Event('submit'));
                    }
                }
            }
            
            // Send message in voice chat mode (automatically)
            if (voiceChatContainer && voiceChatContainer.classList.contains('active')) {
                // Find the active chat body
                const chatBody = voiceChatContainer.querySelector('.chat-body');
                if (chatBody) {
                    // Create user message element
                    const messageElement = document.createElement('div');
                    messageElement.className = 'message message-user';
                    messageElement.textContent = transcript;
                    
                    // Add timestamp
                    const timestamp = document.createElement('div');
                    timestamp.className = 'message-timestamp';
                    const now = new Date();
                    timestamp.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    
                    messageElement.appendChild(timestamp);
                    chatBody.appendChild(messageElement);
                    
                    // Scroll to bottom
                    chatBody.scrollTop = chatBody.scrollHeight;
                    
                    // Send to server (reuse the same endpoint as text chat)
                    fetch('/send_message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message: transcript })
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Create bot message element
                        const botMessageElement = document.createElement('div');
                        botMessageElement.className = 'message message-bot';
                        botMessageElement.textContent = data.response;
                        
                        // Add timestamp
                        const botTimestamp = document.createElement('div');
                        botTimestamp.className = 'message-timestamp';
                        const botTime = new Date();
                        botTimestamp.textContent = `${botTime.getHours().toString().padStart(2, '0')}:${botTime.getMinutes().toString().padStart(2, '0')}`;
                        
                        botMessageElement.appendChild(botTimestamp);
                        chatBody.appendChild(botMessageElement);
                        
                        // Scroll to bottom
                        chatBody.scrollTop = chatBody.scrollHeight;
                        
                        // Speak response
                        const autoSpeak = document.querySelector('#auto-speak');
                        if (autoSpeak && autoSpeak.checked) {
                            window.voiceProcessor.speak(data.response);
                        }
                    })
                    .catch(error => {
                        console.error('Error sending message:', error);
                        
                        // Create error message
                        const errorMessageElement = document.createElement('div');
                        errorMessageElement.className = 'message message-bot';
                        errorMessageElement.textContent = "I'm sorry, there was an error processing your message. Please try again.";
                        
                        // Add timestamp
                        const errorTimestamp = document.createElement('div');
                        errorTimestamp.className = 'message-timestamp';
                        const errorTime = new Date();
                        errorTimestamp.textContent = `${errorTime.getHours().toString().padStart(2, '0')}:${errorTime.getMinutes().toString().padStart(2, '0')}`;
                        
                        errorMessageElement.appendChild(errorTimestamp);
                        chatBody.appendChild(errorMessageElement);
                        
                        // Scroll to bottom
                        chatBody.scrollTop = chatBody.scrollHeight;
                    });
                }
            }
        }
    });
    
    document.addEventListener('voice:speakStart', () => {
        // Show speaking indicators
        const speakIndicators = document.querySelectorAll('.speak-indicator');
        speakIndicators.forEach(indicator => {
            indicator.classList.add('active');
        });
        
        // Update voice visualization if in voice chat mode
        if (window.updateVoiceWaveColors) {
            window.updateVoiceWaveColors(false); // Bot voice
        }
        
        // Update listening indicator in voice mode
        const listeningIndicator = document.querySelector('#listening-indicator');
        if (listeningIndicator) {
            listeningIndicator.textContent = 'Fahamu is speaking...';
        }
    });
    
    document.addEventListener('voice:speakEnd', () => {
        // Hide speaking indicators
        const speakIndicators = document.querySelectorAll('.speak-indicator');
        speakIndicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // Update listening indicator in voice mode
        const listeningIndicator = document.querySelector('#listening-indicator');
        if (listeningIndicator) {
            listeningIndicator.textContent = 'Click microphone to start speaking';
        }
        
        // Restart listening in continuous mode
        if (continuousModeToggle && continuousModeToggle.classList.contains('active')) {
            window.voiceProcessor.startListening();
        }
    });
    
    document.addEventListener('voice:continuousModeChanged', (event) => {
        const isEnabled = event.detail;
        
        // Update UI
        if (continuousModeToggle) {
            if (isEnabled) {
                continuousModeToggle.classList.add('active');
            } else {
                continuousModeToggle.classList.remove('active');
            }
        }
        
        // Update status message
        const listeningIndicator = document.querySelector('#listening-indicator');
        if (listeningIndicator) {
            if (isEnabled) {
                listeningIndicator.textContent = 'Continuous listening mode active';
            } else {
                listeningIndicator.textContent = 'Click microphone to start speaking';
            }
        }
    });
});
