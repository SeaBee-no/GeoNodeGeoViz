from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def send_new_user_email(sender, instance, created, **kwargs):
    if created:
        try:
            # Send email to admin
            send_mail(
                'New User Created',
                f'A new user with email {instance.email} has been created. Please verify the user and approved it',
                settings.DEFAULT_FROM_EMAIL,
                [settings.EMAIL_HOST_USER,'deb@niva.no'],
                fail_silently=False,
            )
        except Exception as e:
            # Log the exception
            logger.error(f"Failed to send email for new user {instance.email}: {e}")