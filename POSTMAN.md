
### Using Postman for Outbound Calls

1.  **Create a New Request**:
    *   Click valid "+" to create a new request tab.
    *   Set the method to **POST**.
    *   Enter the URL: `http://localhost:5000/make-call`

2.  **Set Body Parameters**:
    *   Go to the **Body** tab.
    *   Select **x-www-form-urlencoded**.
    *   Add the following keys and values:
        *   `to_number`: The phone number you want to call (e.g., `+19876543210`).
        *   `webhook_url`: Your current ngrok URL ending in `/voice` (e.g., `https://your-ngrok-url.ngrok-free.app/voice`).

3.  **Send**:
    *   Click **Send**.
    *   You should see a response like: `{"status": "Call initiated", "sid": "CA..."}`.
    *   The phone at `to_number` should ring shortly.
