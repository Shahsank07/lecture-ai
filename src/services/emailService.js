/**
 * Email service to handle frontend email requests
 * These requests are proxied to the backend server where the Resend API key is kept secure.
 */

export async function sendWelcomeEmail(userEmail, userName) {
  try {
    const response = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail, name: userName }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send welcome email: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return { error: error.message };
  }
}

export async function sendClassNotification(classTitle, subjectId, recipientEmails = []) {
  try {
    const response = await fetch('/api/email/class-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ classTitle, subjectId, recipientEmails }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send class notification email: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('sendClassNotification error:', error);
    return { error: error.message };
  }
}
