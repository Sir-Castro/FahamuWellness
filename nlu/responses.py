import json
import os
import random

def get_intent_responses():
    """Load intent responses from intents.json"""
    try:
        with open(os.path.join(os.path.dirname(__file__), 'intents.json'), 'r') as file:
            data = json.load(file)
            return {intent['tag']: intent['responses'] for intent in data['intents']}
    except Exception as e:
        print(f"Error loading intent responses: {e}")
        return {}

# Fallback responses for when the intent is unclear
FALLBACK_RESPONSES = [
    "I'm not sure I understand. Could you rephrase that?",
    "I'm still learning to understand different expressions. Could you try explaining what you mean differently?",
    "I didn't quite catch that. Could you tell me more about what you're experiencing?",
    "I want to help, but I'm not sure I understand what you're asking. Could you provide more details?",
    "Let's try approaching this differently. Could you tell me more about how you're feeling right now?"
]

# Additional therapeutic responses for common anxiety situations
THERAPEUTIC_RESPONSES = {
    "overwhelmed": [
        "When you're feeling overwhelmed, try breaking things down into smaller, manageable tasks. What's one small step you could take right now?",
        "It's natural to feel overwhelmed sometimes. Let's focus on taking one breath at a time. Can you try taking a deep breath with me?",
        "Feeling overwhelmed can be paralyzing. Try the 3-3-3 rule: Name 3 things you see, 3 things you hear, and move 3 parts of your body."
    ],
    "social_anxiety": [
        "Social situations can be challenging. Remember that most people are focused on themselves, not judging you.",
        "Before social events, it can help to prepare a few conversation starters. What's an event you're nervous about?",
        "When experiencing social anxiety, focus on making one genuine connection rather than impressing everyone."
    ],
    "health_anxiety": [
        "Health anxiety can be very distressing. Remember that our minds often jump to worst-case scenarios, but these rarely happen.",
        "With health concerns, it can help to ask: What's the evidence for and against my worry? Is there a more balanced perspective?",
        "When health anxiety strikes, focus on the present moment and notice if you're actually okay right now."
    ],
    "perfectionism": [
        "Perfectionism often fuels anxiety. Remember that 'done' is better than 'perfect'.",
        "Try setting time limits for tasks to avoid perfectionist tendencies. How does that sound?",
        "Consider what you'd say to a friend with the same perfectionist concerns. Can you offer yourself the same compassion?"
    ]
}

def get_response_for_intent(intent, user_message=""):
    """Get a response based on the intent and potentially the user message content"""
    responses = get_intent_responses()
    
    if intent in responses and responses[intent]:
        return random.choice(responses[intent])
    
    # Check for specific anxiety subtypes in the message
    user_message_lower = user_message.lower()
    
    if "overwhelm" in user_message_lower:
        return random.choice(THERAPEUTIC_RESPONSES["overwhelmed"])
    elif any(word in user_message_lower for word in ["social", "people", "party", "meeting", "presentation"]):
        return random.choice(THERAPEUTIC_RESPONSES["social_anxiety"])
    elif any(word in user_message_lower for word in ["health", "sick", "disease", "doctor", "symptom", "pain"]):
        return random.choice(THERAPEUTIC_RESPONSES["health_anxiety"])
    elif any(word in user_message_lower for word in ["perfect", "mistake", "fail", "right", "wrong"]):
        return random.choice(THERAPEUTIC_RESPONSES["perfectionism"])
    
    # Fallback response if intent is unclear
    return random.choice(FALLBACK_RESPONSES)
