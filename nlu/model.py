import json
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, LSTM
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import nltk
import re
import string
import random
from nltk.stem import WordNetLemmatizer

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('wordnet')

class NLUModel:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.intents = json.loads(open(os.path.join(os.path.dirname(__file__), 'intents.json')).read())
        self.words = []
        self.classes = []
        self.documents = []
        self.ignore_letters = ['?', '!', '.', ',']
        self.model = None
        self.init_data()
        self.tokenizer = None
        self.max_sequence_length = 20
        
    def init_data(self):
        # Extract words and classes from intents
        for intent in self.intents['intents']:
            for pattern in intent['patterns']:
                # Tokenize each word in the pattern
                word_list = nltk.word_tokenize(pattern)
                # Add to words list
                self.words.extend(word_list)
                # Add to documents with associated tag
                self.documents.append((word_list, intent['tag']))
                # Add to classes list
                if intent['tag'] not in self.classes:
                    self.classes.append(intent['tag'])
        
        # Lemmatize and clean words
        self.words = [self.lemmatizer.lemmatize(word.lower()) for word in self.words if word not in self.ignore_letters]
        self.words = sorted(list(set(self.words)))
        self.classes = sorted(list(set(self.classes)))
    
    def create_training_data(self):
        # Create training data
        training_sentences = []
        for document in self.documents:
            pattern_words = document[0]
            training_sentences.append(' '.join(pattern_words))
        
        # Create tokenizer and fit on texts
        self.tokenizer = Tokenizer()
        self.tokenizer.fit_on_texts(training_sentences)
        
        # Convert text to sequences and pad
        training_sequences = self.tokenizer.texts_to_sequences(training_sentences)
        training_padded = pad_sequences(training_sequences, maxlen=self.max_sequence_length, padding='post')
        
        # Create output data (one-hot encoded classes)
        training_outputs = []
        for document in self.documents:
            output = [0] * len(self.classes)
            output[self.classes.index(document[1])] = 1
            training_outputs.append(output)
        
        return np.array(training_padded), np.array(training_outputs)
    
    def build_model(self):
        # Build LSTM model
        X_train, y_train = self.create_training_data()
        
        model = Sequential()
        model.add(LSTM(128, input_shape=(self.max_sequence_length, 1), return_sequences=True))
        model.add(Dropout(0.2))
        model.add(LSTM(64))
        model.add(Dropout(0.2))
        model.add(Dense(32, activation='relu'))
        model.add(Dense(len(self.classes), activation='softmax'))
        
        # Reshape input for LSTM (samples, time steps, features)
        X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
        
        # Compile model
        model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
        
        # Train model
        model.fit(X_train, y_train, epochs=200, batch_size=5, verbose=1)
        
        self.model = model
    
    def preprocess_input(self, sentence):
        # Clean and lemmatize input sentence
        sentence_words = nltk.word_tokenize(sentence)
        sentence_words = [self.lemmatizer.lemmatize(word.lower()) for word in sentence_words]
        
        # Convert to sequence and pad
        sequences = self.tokenizer.texts_to_sequences([' '.join(sentence_words)])
        padded = pad_sequences(sequences, maxlen=self.max_sequence_length, padding='post')
        
        # Reshape for LSTM input
        return padded.reshape(padded.shape[0], padded.shape[1], 1)
    
    def predict(self, sentence):
        # Preprocess input
        input_data = self.preprocess_input(sentence)
        
        # Predict intent
        results = self.model.predict(input_data)[0]
        
        # Get intent with highest probability
        results_index = np.argmax(results)
        tag = self.classes[results_index]
        
        # Return intent if confidence is high enough
        if results[results_index] > 0.75:
            return tag
        else:
            return "unclear"

# For faster response in a web application, we'll use a simpler rule-based approach
# In a production environment, you'd want to use the trained model above
def predict_intent(user_input):
    """Simple rule-based intent prediction (placeholder for the ML model)"""
    user_input = user_input.lower()
    
    # Simple keyword matching for intents
    if any(word in user_input for word in ['hi', 'hello', 'hey', 'greetings']):
        return 'greeting'
    elif any(word in user_input for word in ['bye', 'goodbye', 'see you', 'later']):
        return 'goodbye'
    elif any(word in user_input for word in ['thanks', 'thank you', 'appreciate']):
        return 'thanks'
    elif any(word in user_input for word in ['anxious', 'anxiety', 'worried', 'worry', 'nervous', 'panic']):
        if 'attack' in user_input or "can't breathe" in user_input or 'dying' in user_input:
            return 'panic_attack'
        elif 'sleep' in user_input or 'insomnia' in user_input or 'awake' in user_input:
            return 'sleep'
        else:
            return 'anxiety_symptoms'
    elif any(word in user_input for word in ['relax', 'calm', 'calm down', 'destress']):
        return 'relaxation'
    elif any(word in user_input for word in ['cope', 'coping', 'strategies', 'handle', 'deal with']):
        return 'coping_strategies'
    elif any(word in user_input for word in ['breathe', 'breathing', 'breath']):
        return 'breathing_exercise'
    elif any(word in user_input for word in ['mindful', 'mindfulness', 'present']):
        return 'mindfulness'
    elif any(word in user_input for word in ['what can you do', 'help me', 'how does this work']):
        return 'help'
    else:
        return 'unclear'

# Function to get a sample trained model
def get_sample_model():
    model = NLUModel()
    try:
        model.build_model()
        return model
    except Exception as e:
        print(f"Error building model: {e}")
        return None
