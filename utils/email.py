from flask_mail import Message
from app import mail, app
import logging

def send_notification_email(recipient, subject, body):
    """
    Send notification email to a user
    
    Parameters:
    recipient (str): Email address of the recipient
    subject (str): Email subject
    body (str): Email body text
    
    Returns:
    bool: True if email was sent successfully, False otherwise
    """
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient],
            body=body
        )
        mail.send(msg)
        app.logger.info(f"Email sent to {recipient}: {subject}")
        return True
    except Exception as e:
        app.logger.error(f"Failed to send email to {recipient}: {str(e)}")
        return False

def send_welcome_email(user):
    """
    Send welcome email to newly registered users
    
    Parameters:
    user: User object with username and email attributes
    
    Returns:
    bool: True if email was sent successfully, False otherwise
    """
    subject = "Welcome to Fahamu - Your Mental Health Companion"
    body = f"""
Hello {user.username},

Welcome to Fahamu! We're excited to have you join our community.

Fahamu is here to support you on your mental health journey, providing:
- Text and voice-based anxiety therapy conversations
- Personalized coping strategies
- Progress tracking through checkpoints
- Breathing and relaxation exercises

To get started, simply log in and begin a conversation with Fahamu. You can switch between text and voice modes at any time.

Remember, this is a safe space where you can express your feelings and work on managing anxiety.

If you have any questions or feedback, please don't hesitate to contact us.

Wishing you wellness,
The Fahamu Team
    """
    return send_notification_email(user.email, subject, body)

def send_checkpoint_notification(user, checkpoint):
    """
    Send notification when user reaches a new checkpoint
    
    Parameters:
    user: User object with username and email attributes
    checkpoint: Checkpoint object with title and progress attributes
    
    Returns:
    bool: True if email was sent successfully, False otherwise
    """
    subject = f"Fahamu Checkpoint: {checkpoint.title}"
    body = f"""
Hello {user.username},

Congratulations on your progress! You've reached a new checkpoint in your anxiety management journey:

"{checkpoint.title}" - {checkpoint.progress}% complete

{checkpoint.description}

Recognizing and celebrating your progress is an important part of the journey. Keep up the great work!

Continue to practice your coping strategies and breathing exercises regularly.

Wishing you continued progress,
The Fahamu Team
    """
    return send_notification_email(user.email, subject, body)

def send_assessment_results(user, assessment):
    """
    Send anxiety assessment results to user
    
    Parameters:
    user: User object with username and email attributes
    assessment: AnxietyAssessment object with score and severity attributes
    
    Returns:
    bool: True if email was sent successfully, False otherwise
    """
    subject = "Your Fahamu Anxiety Assessment Results"
    
    # Prepare recommendations based on severity
    recommendations = {
        "Minimal Anxiety": "Continue practicing mindfulness and relaxation techniques to maintain your mental wellbeing.",
        "Mild Anxiety": "Regular mindfulness practice, light physical activity, and breathing exercises can help manage mild anxiety symptoms.",
        "Moderate Anxiety": "Consider increasing your self-care practices, maintaining a regular sleep schedule, and practicing daily relaxation techniques.",
        "Severe Anxiety": "Please consider speaking with a mental health professional for additional support alongside your Fahamu therapy sessions."
    }
    
    body = f"""
Hello {user.username},

Thank you for completing your anxiety assessment with Fahamu.

Your Results:
- Score: {assessment.score}/21
- Severity Level: {assessment.severity}

Recommendations:
{recommendations.get(assessment.severity, "Continue working with Fahamu and practice your coping strategies regularly.")}

Remember that anxiety levels can fluctuate, and having tools to manage symptoms is key. Fahamu is here to support you through all stages of your journey.

Take care,
The Fahamu Team
    """
    return send_notification_email(user.email, subject, body)
