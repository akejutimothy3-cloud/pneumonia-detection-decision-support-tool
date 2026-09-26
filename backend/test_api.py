from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST', 'GET'])
def predict():
    return jsonify({
        "success": True,
        "prediction": {
            "classification": "NORMAL (TEST MODE)",
            "confidence": 0.99
        }
    })

if __name__ == '__main__':
    print("Starting test server on port 5001...")
    app.run(host='0.0.0.0', port=5001)
