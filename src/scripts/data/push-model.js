import { getAuth } from '../composables/Auth.js';
import config from '../config';

const ENDPOINTS = {
  SUBSCRIBE: `${config.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${config.BASE_URL}/notifications/subscribe`,
  SEND_REPORT_TO_ALL_USER: () => `${config.BASE_URL}/stories`,
};

export async function subscribePushNotification(subscription) {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    console.error("Invalid subscription data:", subscription);
    return { ok: false, error: "Invalid subscription data" };
  }

  const { endpoint, keys: { p256dh, auth } = {} } = subscription;
  const { token } = getAuth();
  console.log("Token digunakan:", token);

  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  try {
    const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error("Subscription failed:", error);
    return { ok: false, error: error.message };
  }
}

export async function unsubscribePushNotification(subscription) {
  if (!subscription || !subscription.endpoint) {
    console.error("Invalid subscription data:", subscription);
    return { ok: false, error: "Invalid subscription data" };
  }

  const { endpoint } = subscription;
  const { token } = getAuth();
  console.log("Token digunakan:", token);

  try {
    const response = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Unsubscribe API error:", result);
      return {
        ok: false,
        error: result.message || "Unsubscribe failed on server.",
      };
    }

    return {
      ok: true,
      ...result,
    };
  } catch (error) {
    console.error("Unsubscription failed:", error);
    return { ok: false, error: error.message };
  }
}

// Helper function to create a sample image
async function createSampleImage() {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  
  // Get the canvas context and draw a simple image
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#3498db';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText('Test Notification', 30, 100);
  ctx.fillText(new Date().toLocaleTimeString(), 50, 130);
  
  // Convert the canvas to a Blob
  return new Promise((resolve) => {
    canvas.toBlob(blob => {
      resolve(new File([blob], 'test-notification.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.95);
  });
}

export async function sendReportToAllUserViaNotification() {
  const { token } = getAuth();
  console.log("Token digunakan:", token);

  try {
    // For the Dicoding API, we need to send a properly formatted story
    // The API expects a multipart/form-data with description and photo fields
    const formData = new FormData();
    formData.append('description', 'Test notification - ' + new Date().toLocaleString());
    
    // Create and append a sample image
    try {
      const sampleImage = await createSampleImage();
      formData.append('photo', sampleImage);
      console.log('Sample image created and added to form data');
    } catch (imageError) {
      console.error('Error creating sample image:', imageError);
      return { 
        ok: false, 
        error: true,
        message: "Failed to create sample image for notification test" 
      };
    }
    
    // Add dummy location data
    formData.append('lat', 0);
    formData.append('lon', 0);
    
    console.log('Sending notification test with form data:', formData);
    
    // Send a POST request to create a new story, which will trigger notifications
    const fetchResponse = await fetch(
      ENDPOINTS.SEND_REPORT_TO_ALL_USER(),
      {
        method: "POST",
        headers: {
          // Don't set Content-Type with FormData, browser will set it with boundary
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    
    let json;
    try {
      json = await fetchResponse.json();
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      return { 
        ok: false, 
        error: true,
        message: "Failed to parse server response" 
      };
    }

    console.log("Server response for notification test:", json);
    
    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error("Error sending test notification:", error);
    return { 
      ok: false, 
      error: true,
      message: error.message || "Unknown error sending notification" 
    };
  }
} 