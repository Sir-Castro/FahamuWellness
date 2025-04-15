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
        
        // Voice settings
        this.voiceSettings = {
            voice: null,
            pitch: 1.0,
            rate: 1.0,
            voiceType: 'female'
        };
        
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
                const transcript = event.results[lastResultIndex][0].transcript;
                const isFinal = event.results[lastResultIndex].isFinal;
                
                this.triggerEvent('recognitionResult', { transcript, isFinal });
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.triggerEvent('recognitionEnd');
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
            // Load available voices
            const loadVoices = () => {
                this.voices = this.synthesis.getVoices();
                this.voiceSettings.voice = this.findVoice(this.voiceSettings.voiceType);
                this.triggerEvent('voicesLoaded', this.voices);
            };
            
            // Chrome handles voice loading differently
            if (this.synthesis.onvoiceschanged !== undefined) {
                this.synthesis.onvoiceschanged = loadVoices;
            }
            
            // Initial load attempt
            loadVoices();
        } else {
            console.warn('Speech Synthesis API not supported in this browser');
            this.triggerEvent('apiNotSupported', 'synthesis');
        }
    }
    
    // Start speech recognition
    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
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
            utterance.voice = this.voiceSettings.voice;
            utterance.pitch = this.voiceSettings.pitch;
            utterance.rate = this.voiceSettings.rate;
            
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
        this.voiceSettings = {
            ...this.voiceSettings,
            ...settings
        };
        
        // Update voice based on type if needed
        if (settings.voiceType) {
            this.voiceSettings.voice = this.findVoice(settings.voiceType);
        }
        
        this.triggerEvent('voiceSettingsUpdated', this.voiceSettings);
    }
    
    // Find voice based on specified type (male/female)
    findVoice(voiceType) {
        // Ensure voices are loaded
        if (!this.voices || this.voices.length === 0) {
            this.voices = this.synthesis.getVoices();
        }
        
        // Try to find a matching voice
        let preferredVoice = this.voices.find(voice => {
            const voiceName = voice.name.toLowerCase();
            if (voiceType === 'male') {
                return voiceName.includes('male') || 
                       voiceName.includes('david') || 
                       voiceName.includes('james') || 
                       voiceName.includes('daniel');
            } else {
                return voiceName.includes('female') || 
                       voiceName.includes('lisa') || 
                       voiceName.includes('sarah') || 
                       voiceName.includes('karen');
            }
        });
        
        // If no matching voice found, use the first available
        if (!preferredVoice && this.voices.length > 0) {
            preferredVoice = this.voices[0];
        }
        
        return preferredVoice;
    }
    
    // Get all available voices
    getVoices() {
        return this.voices;
    }
    
    // Create and dispatch custom events
    triggerEvent(eventName, data = null) {
        const event = new CustomEvent(`voice:${eventName}`, { 
            detail: data,
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }
    
    // Check if speech recognition is supported
    isRecognitionSupported() {
        return !!window.SpeechRecognition || !!window.webkitSpeechRecognition;
    }
    
    // Check if speech synthesis is supported
    isSynthesisSupported() {
        return 'speechSynthesis' in window;
    }
}

// Initialize the voice processor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create global voice processor instance
    window.voiceProcessor = new VoiceProcessor();
    
    // Voice toggle button functionality
    const voiceToggleBtn = document.querySelector('.chat-voice-toggle');
    if (voiceToggleBtn) {
        voiceToggleBtn.addEventListener('click', () => {
            window.voiceProcessor.toggleListening();
        });
    }
    
    // Voice settings controls
    const voiceGenderSelect = document.querySelector('#voice-gender');
    const voicePitchRange = document.querySelector('#voice-pitch');
    const voiceSpeedRange = document.querySelector('#voice-speed');
    
    if (voiceGenderSelect) {
        voiceGenderSelect.addEventListener('change', function() {
            window.voiceProcessor.updateVoiceSettings({
                voiceType: this.value
            });
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
            const rate = parseFloat(this.value);
            window.voiceProcessor.updateVoiceSettings({
                rate: rate
            });
            
            // Update display value
            const displayEl = document.querySelector('#voice-speed-value');
            if (displayEl) {
                displayEl.textContent = rate.toFixed(1);
            }
        });
    }
    
    // Event listeners for voice events
    document.addEventListener('voice:recognitionStart', () => {
        if (voiceToggleBtn) {
            voiceToggleBtn.classList.add('chat-voice-active');
        }
        
        const statusEl = document.querySelector('.message-status');
        if (statusEl) {
            statusEl.textContent = 'Listening...';
        }
    });
    
    document.addEventListener('voice:recognitionEnd', () => {
        if (voiceToggleBtn) {
            voiceToggleBtn.classList.remove('chat-voice-active');
        }
        
        const statusEl = document.querySelector('.message-status');
        if (statusEl) {
            statusEl.textContent = '';
        }
    });
    
    document.addEventListener('voice:recognitionResult', (event) => {
        const transcript = event.detail.transcript;
        const isFinal = event.detail.isFinal;
        
        if (isFinal) {
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
        }
    });
    
    document.addEventListener('voice:speakStart', () => {
        const speakIndicator = document.querySelector('.speak-indicator');
        if (speakIndicator) {
            speakIndicator.classList.add('active');
        }
    });
    
    document.addEventListener('voice:speakEnd', () => {
        const speakIndicator = document.querySelector('.speak-indicator');
        if (speakIndicator) {
            speakIndicator.classList.remove('active');
        }
    });
});
