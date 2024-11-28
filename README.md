## Prerequisites

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) 
- [Docker Compose](https://docs.docker.com/compose/)

## Setup

### Frontend

1. Navigate to the frontend directory:

    ```sh
    cd frontend
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Run Docker Compose to set up and start the services:

    ```sh
    docker-compose up
    ```

4. Start the development server:

    ```sh
    npm run dev
    ```

### Backend

1. Navigate to the backend directory:

    ```sh
    cd backend
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Run database migrations:

    ```sh
    npx migrate
    ```

4. Start the server:

    ```sh
    node bin/www
    ```
   
Now you should have fully functional website running at localhost:5173