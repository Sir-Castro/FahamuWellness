from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, SelectField, FloatField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from models import User

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=2, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('That username is taken. Please choose a different one.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('That email is already registered. Please choose a different one.')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')

class VoicePreferenceForm(FlaskForm):
    voice_gender = SelectField('Voice Gender', choices=[('male', 'Male'), ('female', 'Female')], validators=[DataRequired()])
    voice_pitch = FloatField('Voice Pitch', validators=[DataRequired()], default=1.0)
    voice_speed = FloatField('Voice Speed', validators=[DataRequired()], default=1.0)
    submit = SubmitField('Save Preferences')

class AnxietyAssessmentForm(FlaskForm):
    q1 = SelectField('Feeling nervous, anxious, or on edge', choices=[(0, 'Not at all'), (1, 'Several days'), (2, 'More than half the days'), (3, 'Nearly every day')], coerce=int)
    q2 = SelectField('Not being able to stop or control worrying', choices=[(0, 'Not at all'), (1, 'Several days'), (2, 'More than half the days'), (3, 'Nearly every day')], coerce=int)
    q3 = SelectField('Worrying too much about different things', choices=[(0, 'Not at all'), (1, 'Several days'), (2, 'More than half the days'), (3, 'Nearly every day')], coerce=int)
    q4 = SelectField('Trouble relaxing', choices=[(0, 'Not at all'), (1, 'Several days'), (2, 'More than half the days'), (3, 'Nearly every day')], coerce=int)
    q5 = SelectField('Being so restless that it\'s hard to sit still', choices=[(0, 'Not at all'), (1, 'Several days'), (2, 'More than half the days'), (3, 'Nearly every day')], coerce=int)
    q6 = SelectField('Becoming easily annoyed or irritable', choices=[(0, 'Not at all'), (1, 'Several days'), (2, 'More than half the days'), (3, 'Nearly every day')], coerce=int)
    q7 = SelectField('Feeling afraid as if something awful might happen', choices=[(0, 'Not at all'), (1, 'Several days'), (2, 'More than half the days'), (3, 'Nearly every day')], coerce=int)
    submit = SubmitField('Submit Assessment')

class CheckpointForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired(), Length(max=128)])
    description = TextAreaField('Description')
    progress = SelectField('Progress', choices=[(str(i), f"{i}%") for i in range(0, 101, 5)], validators=[DataRequired()])
    submit = SubmitField('Save Checkpoint')
