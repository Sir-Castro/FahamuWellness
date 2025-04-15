from flask import render_template, url_for, flash, redirect, request, jsonify, session
from flask_login import login_user, current_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import json
from datetime import datetime

from app import app, db, mail
from models import User, Chat, Message, Checkpoint, AnxietyAssessment
from forms import RegistrationForm, LoginForm, VoicePreferenceForm, AnxietyAssessmentForm, CheckpointForm
from utils.chatbot import get_response
from utils.email import send_notification_email
from nlu.model import predict_intent

@app.route('/')
@app.route('/home')
def home():
    return render_template('index.html', title='Fahamu - Mental Health Chatbot')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('chat'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = generate_password_hash(form.password.data)
        user = User(
            username=form.username.data,
            email=form.email.data,
            password_hash=hashed_password
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Create initial checkpoint for user
        welcome_checkpoint = Checkpoint(
            user_id=user.id,
            title="Started Anxiety Therapy Journey",
            description="Congratulations on taking the first step towards managing your anxiety!",
            progress=10
        )
        db.session.add(welcome_checkpoint)
        db.session.commit()
        
        # Send welcome email
        try:
            send_notification_email(
                user.email,
                "Welcome to Fahamu",
                f"Dear {user.username},\n\nWelcome to Fahamu! We're here to support you on your mental health journey.\n\nBest regards,\nThe Fahamu Team"
            )
        except Exception as e:
            app.logger.error(f"Failed to send welcome email: {e}")
        
        flash(f'Account created for {form.username.data}! You can now log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html', title='Register', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('chat'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            
            # Admin redirect
            if user.is_admin:
                flash('Admin logged in successfully!', 'success')
                return redirect(next_page) if next_page else redirect(url_for('admin_dashboard'))
            
            flash('Login successful!', 'success')
            return redirect(next_page) if next_page else redirect(url_for('chat'))
        else:
            flash('Login unsuccessful. Please check email and password.', 'danger')
    
    return render_template('login.html', title='Login', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/chat')
def chat():
    # Create a new session ID if not exists
    if 'chat_session_id' not in session:
        session['chat_session_id'] = str(uuid.uuid4())
    
    # Check if user is logged in or use guest mode
    if current_user.is_authenticated:
        user_id = current_user.id
        # Check if chat record exists for this session
        chat = Chat.query.filter_by(user_id=user_id, session_id=session['chat_session_id']).first()
        if not chat:
            chat = Chat(user_id=user_id, session_id=session['chat_session_id'])
            db.session.add(chat)
            db.session.commit()
        
        return render_template('chat.html', title='Chat with Fahamu', 
                              voice_preference=current_user.voice_preference,
                              voice_pitch=current_user.voice_pitch, 
                              voice_speed=current_user.voice_speed)
    else:
        # Guest mode
        chat = Chat.query.filter_by(user_id=None, session_id=session['chat_session_id']).first()
        if not chat:
            chat = Chat(user_id=None, session_id=session['chat_session_id'])
            db.session.add(chat)
            db.session.commit()
        
        return render_template('chat.html', title='Guest Chat with Fahamu',
                              voice_preference="female", voice_pitch=1.0, voice_speed=1.0)

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    user_message = data.get('message', '')
    chat_session_id = session.get('chat_session_id', str(uuid.uuid4()))
    
    # Find chat or create new one
    chat = Chat.query.filter_by(session_id=chat_session_id).first()
    if not chat:
        user_id = current_user.id if current_user.is_authenticated else None
        chat = Chat(user_id=user_id, session_id=chat_session_id)
        db.session.add(chat)
        db.session.commit()
    
    # Save user message
    user_msg = Message(chat_id=chat.id, content=user_message, is_bot=False)
    db.session.add(user_msg)
    db.session.commit()
    
    # Get bot response
    intent = predict_intent(user_message)
    response_text = get_response(intent, user_message)
    
    # Save bot response
    bot_msg = Message(chat_id=chat.id, content=response_text, is_bot=True)
    db.session.add(bot_msg)
    db.session.commit()
    
    return jsonify({
        'response': response_text,
        'intent': intent
    })

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    voice_form = VoicePreferenceForm()
    assessment_form = AnxietyAssessmentForm()
    checkpoint_form = CheckpointForm()
    
    if voice_form.submit.data and voice_form.validate_on_submit():
        current_user.voice_preference = voice_form.voice_gender.data
        current_user.voice_pitch = voice_form.voice_pitch.data
        current_user.voice_speed = voice_form.voice_speed.data
        db.session.commit()
        flash('Voice preferences updated!', 'success')
        return redirect(url_for('profile'))
    
    if assessment_form.submit.data and assessment_form.validate_on_submit():
        # Calculate GAD-7 score
        score = (assessment_form.q1.data + assessment_form.q2.data + assessment_form.q3.data + 
                 assessment_form.q4.data + assessment_form.q5.data + assessment_form.q6.data + 
                 assessment_form.q7.data)
        
        assessment = AnxietyAssessment(user_id=current_user.id, score=score)
        db.session.add(assessment)
        db.session.commit()
        
        flash(f'Assessment completed. Your anxiety level: {assessment.severity}', 'info')
        return redirect(url_for('profile'))
    
    if checkpoint_form.submit.data and checkpoint_form.validate_on_submit():
        checkpoint = Checkpoint(
            user_id=current_user.id,
            title=checkpoint_form.title.data,
            description=checkpoint_form.description.data,
            progress=int(checkpoint_form.progress.data)
        )
        db.session.add(checkpoint)
        db.session.commit()
        
        flash('New checkpoint added!', 'success')
        return redirect(url_for('profile'))
    
    # Pre-fill voice form with current user preferences
    voice_form.voice_gender.data = current_user.voice_preference
    voice_form.voice_pitch.data = current_user.voice_pitch
    voice_form.voice_speed.data = current_user.voice_speed
    
    # Get user's checkpoints and assessments
    checkpoints = Checkpoint.query.filter_by(user_id=current_user.id).order_by(Checkpoint.timestamp.desc()).all()
    assessments = AnxietyAssessment.query.filter_by(user_id=current_user.id).order_by(AnxietyAssessment.timestamp.desc()).all()
    
    return render_template('profile.html', title='Profile', 
                          voice_form=voice_form, 
                          assessment_form=assessment_form,
                          checkpoint_form=checkpoint_form,
                          checkpoints=checkpoints,
                          assessments=assessments)

# Admin routes
@app.route('/admin')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        flash('Access denied: Admin privileges required', 'danger')
        return redirect(url_for('home'))
    
    # Get stats for dashboard
    user_count = User.query.count()
    chat_count = Chat.query.count()
    message_count = Message.query.count()
    guest_chat_count = Chat.query.filter_by(user_id=None).count()
    
    # Get recent users
    recent_users = User.query.order_by(User.date_joined.desc()).limit(5).all()
    
    # Get recent chats
    recent_chats = db.session.query(Chat, User.username).outerjoin(User, Chat.user_id == User.id).order_by(Chat.timestamp.desc()).limit(10).all()
    
    return render_template('admin/dashboard.html', title='Admin Dashboard',
                          user_count=user_count,
                          chat_count=chat_count,
                          message_count=message_count,
                          guest_chat_count=guest_chat_count,
                          recent_users=recent_users,
                          recent_chats=recent_chats)

@app.route('/admin/users')
@login_required
def admin_users():
    if not current_user.is_admin:
        flash('Access denied: Admin privileges required', 'danger')
        return redirect(url_for('home'))
    
    users = User.query.all()
    return render_template('admin/users.html', title='Manage Users', users=users)

@app.route('/admin/analytics')
@login_required
def admin_analytics():
    if not current_user.is_admin:
        flash('Access denied: Admin privileges required', 'danger')
        return redirect(url_for('home'))
    
    # Get anxiety assessment stats
    assessment_counts = db.session.query(
        AnxietyAssessment.severity, 
        db.func.count(AnxietyAssessment.id)
    ).group_by(AnxietyAssessment.severity).all()
    
    # Format for chart.js
    severity_labels = [level for level, _ in assessment_counts]
    severity_data = [count for _, count in assessment_counts]
    
    # Get user activity over time (registered users per month)
    user_monthly_counts = db.session.query(
        db.func.strftime('%Y-%m', User.date_joined).label('month'),
        db.func.count(User.id)
    ).group_by('month').all()
    
    months = [month for month, _ in user_monthly_counts]
    user_counts = [count for _, count in user_monthly_counts]
    
    return render_template('admin/analytics.html', title='Analytics',
                          severity_labels=json.dumps(severity_labels),
                          severity_data=json.dumps(severity_data),
                          months=json.dumps(months),
                          user_counts=json.dumps(user_counts))

@app.route('/admin/send_notification', methods=['POST'])
@login_required
def admin_send_notification():
    if not current_user.is_admin:
        return jsonify({'success': False, 'error': 'Admin privileges required'}), 403
    
    data = request.json
    user_id = data.get('user_id')
    subject = data.get('subject')
    message = data.get('message')
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    try:
        send_notification_email(user.email, subject, message)
        return jsonify({'success': True})
    except Exception as e:
        app.logger.error(f"Failed to send notification: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
