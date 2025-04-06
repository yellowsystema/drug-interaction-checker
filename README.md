# Medi-Dine 💊
# Hackathon Project: Smart Grocery Guide for Patient Safety

## Project Overview 🤔
Our project aims to enhance patient safety and improve health outcomes by helping individuals make informed dietary choices. We developed a full-stack web application that analyzes a patient's current illness, medications, and food allergies to generate a personalized list of foods they should avoid. The app also provides brief explanations for why certain foods should be excluded based on the provided inputs.

## Problem Statement
Patients managing chronic illnesses, taking multiple medications, or dealing with food allergies often struggle to identify which foods might negatively impact their health. Our solution streamlines this process by leveraging AI to provide tailored dietary recommendations.

## Features
- **User Input:** Patients enter their current illness, medications, and food allergies.
- **AI-Powered Analysis:** The app processes the input data and generates a list of foods to avoid.
- **Explanations:** Each food recommendation includes a brief description explaining why it should be avoided.

## Technology Stack
- **Frontend:** React.js
- **Backend:** Express.js
- **AI API:** Gemini API for food recommendations based on health conditions and medications

## How It Works ⚒️
1. The user enters their illness, medications, and food allergies.
2. The backend processes this information and sends it to the Gemini API.
3. The API returns a list of foods to avoid with explanations.
4. The frontend displays the personalized dietary recommendations to the user.

## Future Enhancements
- Expand AI capabilities to provide alternative food recommendations.
- Enhance user experience with a more intuitive UI and additional customization options.

## Team & Acknowledgments
This project was built by a team of four beginner developers during a 24-hour hackathon. Special thanks to the hackathon organizers and mentors for their guidance and support!

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo-name.git
   cd your-repo-name
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add your Gemini API key:
   ```sh
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```sh
   npm start
   ```

## License
This project is open-source and available under the MIT License.

---
We hope our project helps patients make safer dietary choices and improve their overall health!

