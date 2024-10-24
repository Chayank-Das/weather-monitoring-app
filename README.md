# Weather Monitoring App

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-enabled-green.svg)

## Overview
The **Weather Monitoring App** is a full-stack application that provides real-time and historical weather data for multiple cities. Users can view current weather conditions, receive daily summaries, and analyze weather trends over time. The app leverages Docker for containerization, ensuring easy deployment and scalability. This document will guide you through the complete setup, whether running locally or using Docker.

## Features
- **Real-Time Weather Data**: Fetch current weather conditions using the OpenWeatherMap API.
- **Daily Summaries**: Aggregates daily weather data and stores summaries in a MongoDB database.
- **Historical Data Visualization**: Displays historical weather data.
- **Responsive Design**: Accessible on both desktop and mobile devices.

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose

## Design Choices
- **Containerization**: Docker containers for each service ensure isolated environments and minimize conflicts. Docker Compose simplifies management.
- **Backend and Frontend Separation**: Separate Docker services for backend and frontend improve modularity.
- **Database as a Separate Service**: MongoDB is containerized for easy management and data persistence.

## Prerequisites
- **Docker**: Ensure Docker is installed on your machine.
  - **Windows & macOS**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
  - **Linux**: Follow the [installation guide](https://docs.docker.com/engine/install/)
- **Docker Compose**: Comes with Docker Desktop. For Linux, [install Docker Compose](https://docs.docker.com/compose/install/).
- **Git**: [Download Git](https://git-scm.com/downloads) to clone the repository.
- **OpenWeatherMap API Key**: Register at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up) to get an API key.

## Installation
You can set up and run the Weather Monitoring App either using Docker or running it directly on your local machine.

### Using Docker

#### Step 1: Clone the Repository
```sh
$ git clone https://github.com/your-username/weather-monitoring-app.git
$ cd weather-monitoring-app
```

#### Step 2: Update Backend Code with Your API Key and MongoDB URI
1. **Navigate to Backend Directory**
   ```sh
   $ cd backend
   ```
2. **Open `server.js` in Your Preferred Text Editor**
   - Replace the hardcoded MongoDB URI and API key with your credentials:
     ```js
     const uri = "mongodb://your-mongodb-uri:27017/daily_Weather_summary";
     const apiKey = "your_actual_openweathermap_api_key";
     ```
     const uri - Search in backend/server.js
     const apiKey - Search in frontend/script.js
     

#### Step 3: Build and Run Containers
Navigate back to the project root and run the following command:
```sh
$ docker-compose up --build -d
```
This will build the Docker images and start the containers for MongoDB, backend, and frontend.

#### Step 4: Access the Application
- **Frontend**: Open your browser and go to [http://localhost:8080](http://localhost:8080).
- **Backend API**: Accessible at [http://localhost:3000](http://localhost:3000).

### Running Locally (Without Docker)

#### Step 1: Clone the Repository
```sh
$ git clone https://github.com/your-username/weather-monitoring-app.git
$ cd weather-monitoring-app
```

#### Step 2: Setup Backend
1. **Navigate to Backend Directory**
   ```sh
   $ cd backend
   ```
2. **Install Dependencies**
   ```sh
   $ npm install
   ```
3. **Update Credentials**
   - Open `server.js` and replace the hardcoded values for MongoDB URI and API key.
   ```js
   const uri = "mongodb://localhost:27017/daily_Weather_summary";
   const apiKey = "your_actual_openweathermap_api_key";
   ```
   const uri - Search in backend/server.js
   const apiKey - Search in frontend/script.js
   
5. **Start the Backend Server**
   ```sh
   $ npm start
   ```

#### Step 3: Setup Frontend
1. **Navigate to Frontend Directory**
   ```sh
   $ cd ../frontend
   ```
2. **Serve the Frontend**
   - Install `http-server` globally using npm and run it to serve the frontend:
   ```sh
   $ npm install -g http-server
   $ http-server -p 8080
   ```

#### Step 4: Access the Application
- **Frontend**: Go to [http://localhost:8080](http://localhost:8080).
- **Backend API**: Ensure backend is running on [http://localhost:3000](http://localhost:3000).

## API Endpoints
### 1. Test Insert
- **Endpoint**: `/api/test-insert`
- **Method**: `POST`
- **Description**: Inserts a sample summary into the database for testing purposes.

### 2. Receive Daily Summaries
- **Endpoint**: `/api/daily-summaries`
- **Method**: `POST`
- **Description**: Receives an array of daily weather summaries and stores them in the database.

### 3. Retrieve Daily Summaries
- **Endpoint**: `/api/daily-summaries`
- **Method**: `GET`
- **Description**: Retrieves all daily weather summaries from the database.

## Contributing
1. **Fork the Repository**
2. **Clone Your Fork**
   ```sh
   $ git clone https://github.com/your-username/weather-monitoring-app.git
   $ cd weather-monitoring-app
   ```
3. **Create a New Branch**
   ```sh
   $ git checkout -b feature/YourFeatureName
   ```
4. **Make Changes and Commit**
   ```sh
   $ git add .
   $ git commit -m "Add your descriptive commit message"
   ```
5. **Push to Your Fork**
   ```sh
   $ git push origin feature/YourFeatureName
   ```
6. **Open a Pull Request**

## License
This project is licensed under the MIT License.

## Contact
For questions or support, contact:
- **Chayank Das**
- **Email**: chayankdas35@gmail.com
- **GitHub**: [Chayank-Das](https://github.com/your-username)

