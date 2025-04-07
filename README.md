# Jack of All Travel

## Overview

Jack of All Travel is a travel application that consolidates all your planning/vacation needs into one convenient place. Eliminating the need to switch between multiple different applications making your trip details easy to track. Equipped with the functionality to create shared calendars and access mapping features using the Google Calendar and Google Maps APIs. 

## Prerequisites

- You must have [Node.js](https://nodejs.org/) downloaded.

## Local Deployment

Follow these steps to set up and run the project locally:

1. **Clone the repository**
   ```bash
   git clone git@github.com:CMPT-276-SPRING-2025/final-project-16-moons.git
   cd final-project-16-moons
   ```

2. **Install dependencies in the root directory**
   ```bash
   npm install
   ```

3. **Navigate to the app directory and install additional dependencies**
   ```bash
   cd app
   npm install
   ```

4. **Set up environment variables**
   - Create a `.env` file in the app directory
   - Add the following environment variables:
     ```
     VITE_GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     ```
   - Replace `your_google_calendar_api_key` and `your_google_maps_api_key` with your actual API keys
   - To obtain API keys:
     - Check the canvas submission for included keys if you are the teaching team.  
   - Otherwise go to the documentation pages:
     - [Google Maps API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)
     - [Google Calendar API Key](https://developers.google.com/calendar/api/guides/auth)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   - The default local server is: [http://localhost:5173](http://localhost:5173)
   - Otherwise check your terminal to see where the local server is being hosted.

## Project Links

- **Deployed Website**: [jack-of-all-travel-vercel.app](https://jack-of-all-travel.vercel.app/)
- **Project Report**: [Link to be added]
- **Demo Video**: [Link to be added]
