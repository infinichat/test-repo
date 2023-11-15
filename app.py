import time
from flask import Flask, make_response, request, render_template, jsonify
import os
import requests
from dotenv import load_dotenv


from flask import Flask, render_template

app = Flask(__name__, template_folder="src", static_folder="src")


app.config['TEMPLATES_AUTO_RELOAD'] = True


load_dotenv()

#Starting a thread Step 0
def start_thread_openai():
    token = os.getenv("api_key")
    api_url = "https://api.openai.com/v1/threads"
    response = requests.post(
        api_url,
        headers={
            "OpenAI-Beta": "assistants=v1",
            "User-Agent": "PostmanRuntime/7.34.0",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        },
        json={},
    )

    if response.status_code == 200:
        data = response.json()
        thread_openai_id = data.get("id")
        print("Thread started successfully! Thread id:", thread_openai_id)

        return thread_openai_id
    else:
        print("Error starting OpenAI thread:", response.status_code, response.text)
        return None

#Sending a message to a thread. Step 1
def send_message_user(thread_openai_id, json_payload):
    token = os.getenv("api_key")

    try:
        if thread_openai_id and json_payload:
            api_url = f"https://api.openai.com/v1/threads/{thread_openai_id}/messages"
            api_headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
                "OpenAI-Beta": "assistants=v1",
                "User-Agent": "PostmanRuntime/7.34.0"
            }
            api_json_payload = {
                "role": "user",
                "content": json_payload.get("question", "")
            }

            api_response = requests.post(api_url, headers=api_headers, json=api_json_payload)
            api_response.raise_for_status()

            if api_response.status_code == 200:
                api_data = api_response.json()
                print("Message sent successfully!", api_data)
                
                # Create a run after sending a message
                create_run(thread_openai_id)
                
                return api_data
            else:
                print("Error sending message:", api_response.status_code, api_response.text)
                return None

    except requests.exceptions.RequestException as e:
        print(f"API Request Error: {e}")
        return None
    
# Create a run Step2
def check_run_status(thread_openai_id, run_id):
    token = os.getenv("api_key")
    api_url = f"https://api.openai.com/v1/threads/{thread_openai_id}/runs/{run_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "OpenAI-Beta": "assistants=v1",
        "User-Agent": "PostmanRuntime/7.34.0"
    }

    while True:
        response = requests.get(api_url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            status = data.get("status")

            if status == "completed":
                print("Run status is completed. Retrieving AI response.")
                break  # Exit the loop if the run is completed
            else:
                print(f"Run status is {status}. Waiting for completion.")
                time.sleep(5)  # Wait for 5 seconds before checking again
        else:
            print(f"Error checking run status: {response.status_code}, {response.text}")
            break  # Exit the loop if there's an error

def create_run(thread_openai_id):
    token = os.getenv("api_key")
    api_url = f"https://api.openai.com/v1/threads/{thread_openai_id}/runs"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "OpenAI-Beta": "assistants=v1",
        "User-Agent": "PostmanRuntime/7.34.0"
    }
    assistant_id = os.getenv("assistant_id")
    json_payload = {
        "assistant_id": assistant_id
    }

    response = requests.post(api_url, headers=headers, json=json_payload)
    response.raise_for_status()

    if response.status_code == 200:
        data = response.json()
        run_id = data.get('id')
        print("Run created successfully!", run_id)
        check_run_status(thread_openai_id, run_id)
    

def retrieve_ai_response(thread_openai_id):
    token = os.getenv("api_key")
    api_url = f"https://api.openai.com/v1/threads/{thread_openai_id}/messages"

    try:
        response = requests.get(
            api_url,
            headers={
                "Authorization": f"Bearer {token}",
                "OpenAI-Beta": "assistants=v1",
                "User-Agent": "PostmanRuntime/7.34.0",
                "Accept": "*/*"
            },
        )
        response.raise_for_status()

        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', 'application/json')
            
            if 'application/json' in content_type:
                data = response.json()
                print("API Response:", data)  # Add this line to print the entire response
                if 'data' in data and data['data']:
                    ai_response = data['data'][0]['content'][0]['text']['value']
                    print("Retrieved response successfully!", ai_response)
                    return ai_response
                else:
                    print("No messages found in the response.")
                    return None
            else:
                print("Invalid Content-Type. Expected application/json, got:", content_type)
                return None
        else:
            print("Error retrieving AI response:", response.status_code, response.text)
            return None

    except requests.exceptions.RequestException as e:
        print(f"API Request Error: {e}")
        return None


def execute_flow(payload):
    try:
        question = payload.get("question")
        if not question:
            raise ValueError("Invalid payload: 'question' is required.")

        thread_openai_id = start_thread_openai()
        send_message_user(thread_openai_id, json_payload={"question": question})
        ai_response = retrieve_ai_response(thread_openai_id)

        return jsonify({"response": ai_response})
    
    except Exception as e:
        print(f"Error executing flow: {e}")
        return jsonify({"error": f"Internal Server Error: {e}"}), 500

@app.route('/', methods=['POST', 'GET'])
def home():
    if request.method == 'POST':
        try:
            data = request.get_json()
            response = execute_flow(data)
            
            return response
        except Exception as e:
            print(f"Error executing flow: {e}")
            response = jsonify({"error": "Internal Server Error"})
            response.status_code = 500


    response = make_response(render_template('widget.html'))
    return response

if __name__ == "__main__":
    app.run(debug=True)