from django.db import models
from django.utils import timezone

from schools.models import School
from accounts.models import User
from students.models import Admission

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('urgent', 'Urgent'),
        ('event', 'Event'),
    ]

    TARGET_AUDIENCE = [
        ('all', 'All'),
        ('teachers', 'Teachers'),
        ('parents', 'Parents'),
        ('students', 'Students'),
        ('staff', 'Staff'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    title = models.CharField(max_length=200)
    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='info'
    )

    target_audience = models.CharField(
        max_length=20,
        choices=TARGET_AUDIENCE,
        default='all'
    )

    target_ids = models.JSONField(default=list, blank=True)

    sent_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_notifications'
    )

    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class SMSLog(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('delivered', 'Delivered'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='sms_logs'
    )

    phone_number = models.CharField(max_length=15)

    message = models.TextField()

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )

    gateway_response = models.JSONField(default=dict, blank=True)

    sent_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_sms_logs'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.phone_number
    
class EmailLog(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='email_logs'
    )

    to_email = models.EmailField()

    subject = models.CharField(max_length=200)

    body = models.TextField()

    html_body = models.TextField(blank=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )

    attachment = models.FileField(
        upload_to='email_attachments/',
        blank=True,
        null=True
    )

    sent_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_email_logs'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.subject
    
class Circular(models.Model):

    TARGET_AUDIENCE = [
        ('all', 'All'),
        ('teachers', 'Teachers'),
        ('parents', 'Parents'),
        ('students', 'Students'),
        ('staff', 'Staff'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='circulars'
    )

    title = models.CharField(max_length=200)

    content = models.TextField()

    target_audience = models.CharField(
        max_length=20,
        choices=TARGET_AUDIENCE
    )

    published = models.BooleanField(default=False)

    published_at = models.DateTimeField(
        null=True,
        blank=True
    )

    attachment = models.FileField(
        upload_to='circulars/',
        blank=True,
        null=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_circulars'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class EventReminder(models.Model):

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='event_reminders'
    )

    title = models.CharField(max_length=200)

    event_date = models.DateField()

    reminder_days = models.PositiveIntegerField(default=1)

    sent = models.BooleanField(default=False)

    sent_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class ParentCommunication(models.Model):

    COMMUNICATION_TYPES = [
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('both', 'Both'),
        ('app', 'App'),
    ]

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='parent_communications'
    )

    student = models.ForeignKey(
        Admission,
        on_delete=models.CASCADE,
        related_name='communications'
    )

    subject = models.CharField(max_length=200)

    message = models.TextField()

    communication_type = models.CharField(
        max_length=15,
        choices=COMMUNICATION_TYPES
    )

    sent_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='parent_communications'
    )

    sent_at = models.DateTimeField(auto_now_add=True)

    read_at = models.DateTimeField(
        null=True,
        blank=True
    )

    response = models.TextField(blank=True)

    def __str__(self):
        return self.subject