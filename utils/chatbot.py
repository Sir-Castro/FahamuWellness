import random
from nlu.responses import get_response_for_intent

# Therapeutic conversation flows based on the identified intent
def get_response(intent, user_message):
    """Generate response based on the identified intent"""
    response = get_response_for_intent(intent, user_message)
    
    # Add some therapeutic follow-up questions for certain intents
    if intent == "anxiety_symptoms":
        follow_ups = [
            " How long have you been feeling this way?",
            " Would you like to try a quick grounding exercise together?",
            " On a scale of 1-10, how intense is your anxiety right now?"
        ]
        response += random.choice(follow_ups)
    
    elif intent == "coping_strategies":
        follow_ups = [
            " Have you tried any coping strategies that worked for you in the past?",
            " Would you like to explore more specific strategies for your situation?",
            " What triggers tend to make your anxiety worse?"
        ]
        response += random.choice(follow_ups)
    
    elif intent == "greeting":
        if random.random() < 0.5:  # 50% chance to add a follow-up question
            follow_ups = [
                " How has your day been today?",
                " What brings you to our conversation today?",
                " Is there something specific you'd like to work on in our session?"
            ]
            response += random.choice(follow_ups)
    
    return response

# Sample conversation starters focused on anxiety therapy
def get_conversation_starters():
    """Get therapy-focused conversation starters for UI prompts"""
    return [
        "I've been feeling anxious lately.",
        "How can I calm down during a panic attack?",
        "I'm worried all the time and can't relax.",
        "What breathing exercises can help with anxiety?",
        "I have trouble sleeping because of anxious thoughts.",
        "How can I stop catastrophizing?",
        "I get nervous in social situations."
    ]

# Function to get follow-up questions based on conversation context
def get_follow_up_question(intent, conversation_history):
    """Get contextual follow-up questions based on intent and conversation history"""
    
    # Basic follow-ups based on intent alone
    intent_based_questions = {
        "anxiety_symptoms": [
            "When do you typically notice your anxiety symptoms getting worse?",
            "What situations tend to trigger your anxiety?",
            "Have you noticed any patterns to when your anxiety occurs?"
        ],
        "coping_strategies": [
            "What coping strategies have you tried in the past?",
            "Which relaxation techniques have worked best for you?",
            "How do you currently manage your anxiety symptoms?"
        ],
        "breathing_exercise": [
            "Did that breathing exercise help? Would you like to try another?",
            "How do you feel after completing the breathing exercise?",
            "Do you practice breathing exercises regularly?"
        ],
        "mindfulness": [
            "Have you practiced mindfulness or meditation before?",
            "What aspects of mindfulness do you find most challenging?",
            "Would you like to establish a regular mindfulness practice?"
        ],
        "sleep": [
            "How many hours of sleep do you typically get?",
            "Do you have a bedtime routine that helps you relax?",
            "What thoughts tend to keep you awake at night?"
        ],
        "panic_attack": [
            "How frequently do you experience panic attacks?",
            "Are there specific triggers for your panic attacks?",
            "What has helped you during past panic attacks?"
        ]
    }
    
    if intent in intent_based_questions:
        return random.choice(intent_based_questions[intent])
    
    # Default follow-up questions
    default_questions = [
        "Could you tell me more about what you're experiencing?",
        "How has this been affecting your daily life?",
        "What would be most helpful for you right now?"
    ]
    
    return random.choice(default_questions)
