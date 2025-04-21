import json
import os
import random

def get_intent_responses():
    """Load and merge intent responses from intents.json, intents2.json, intents3.json, intents4.json"""
    response_files = ['intents.json', 'intents2.json', 'intents3.json', 'intents4.json', 'intents5.json', 'intents6.json', 'intents7.json', 'intents8.json', 'intents9.json']
    merged_responses = {}
    merged_patterns = {}

    for file_name in response_files:
        try:
            file_path = os.path.join(os.path.dirname(__file__), file_name)
            with open(file_path, 'r') as file:
                data = json.load(file)
                for intent in data.get('intents', []):
                    tag = intent['tag']
                    responses = intent.get('responses', [])
                    patterns = intent.get('patterns', [])
                    if tag in merged_responses:
                        merged_responses[tag].extend(responses)
                        merged_patterns[tag].extend(patterns)
                    else:
                        merged_responses[tag] = responses
                        merged_patterns[tag] = patterns
        except Exception as e:
            print(f"Error loading {file_name}: {e}")

    return merged_responses, merged_patterns

# Fallback responses
FALLBACK_RESPONSES = [
    "I'm not sure I understand. Could you rephrase that?",
    "I'm still learning to understand different expressions. Could you try explaining what you mean differently?",
    "I didn't quite catch that. Could you tell me more about what you're experiencing?",
    "I want to help, but I'm not sure I understand what you're asking. Could you provide more details?",
    "Let's try approaching this differently. Could you tell me more about how you're feeling right now?"
]


def get_response_for_intent(intent=None, user_message=""):
    """Determine intent from user message and provide an appropriate response."""
    responses, patterns = get_intent_responses()

    if intent and intent in responses and responses[intent]:
        return random.choice(responses[intent])

    user_message_lower = user_message.lower().strip()

    # Handle empty input with 'no-response' intent
    if not user_message_lower:
        return random.choice(responses.get("no-response", FALLBACK_RESPONSES))

    # Pattern matching fallback (skip empty patterns!)
    for tag, pattern_list in patterns.items():
        for pattern in pattern_list:
            if not pattern.strip():
                continue  # skip empty patterns like ""
            if pattern.lower() in user_message_lower:
                return random.choice(responses.get(tag, FALLBACK_RESPONSES))

 

    return random.choice(FALLBACK_RESPONSES)
