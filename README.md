# 📝 Notes App

A full-stack **Notes Management Application** built with the **MERN stack**, featuring secure authentication, note organization, search and filtering, categories, data import/export, automated testing, and code-quality analysis with SonarQube.

## ✨ Features

### 🔐 Authentication & Security

* User registration and login
* JWT-based authentication
* Bcrypt password hashing
* Protected routes and authenticated API endpoints
* Server-side input validation
* Strong password validation with minimum length and byte-limit checks

### 🗒️ Notes Management

* Create, read, update, and delete notes
* Edit existing notes
* Pin important notes
* Archive inactive notes
* Move notes to trash
* Restore deleted notes
* Permanently delete notes when required

### 🏷️ Categories & Organization

* Create and manage categories
* Assign categories to notes
* Filter notes by category
* User-specific category ownership

### 🔎 Search & Filtering

* Real-time search
* Search notes by title and content
* Filter notes by category
* Sort notes for easier organization

### 📦 Data Import & Export

* Export notes as JSON
* Export notes as TXT
* Import notes from external data files
* Validation for imported data

### 🧪 Testing & Code Quality

* Unit and component testing with Jest
* React Testing Library
* Automated test coverage
* SonarQube code-quality analysis
* CodeRabbit-assisted code reviews

## 🛠️ Tech Stack

### Frontend

* **React.js**
* **Vite**
* **Tailwind CSS**
* **Axios**
* **React Router**
* **Lucide React**
* **React Hot Toast**

### Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT**
* **Bcrypt**
* **CORS**
* **dotenv**
* **Pino**

### Testing & Quality

* **Jest**
* **React Testing Library**
* **SonarQube**
* **CodeRabbit**

## 📁 Project Structure

```text
asadullah-rind-mern-10pshine/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── test/
│   ├── public/
│   └── package.json
│
├── SonarCubeReport/
│   └── sonarqube.png
│
└── README.md
```

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Https-Asad/asadullah-rind-mern-10pshine.git
cd asadullah-rind-mern-10pshine
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` directory and add the required environment variables.

Example:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```


### 5. Start the backend

From the `backend` directory:

```bash
npm run dev
```

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend will be available at the Vite development URL shown in the terminal.

## 🧪 Running Tests

To run the frontend test suite:

```bash
cd frontend
npm test
```


## 🔍 SonarQube

The project is configured for static code-quality analysis using SonarQube.

The analysis checks areas such as:

* Bugs
* Vulnerabilities
* Security Hotspots
* Code Smells
* Code Duplication
* Test Coverage

A SonarQube report is included in the `SonarCubeReport` directory for reference.

## 🔒 Security Notes

* Passwords are hashed before being stored in MongoDB.
* Authentication-protected endpoints require a valid JWT.
* Environment variables are used for sensitive configuration.
* `.env` files and other sensitive files should not be committed to the repository.

## 👨‍💻 Development Workflow

The project follows a feature-branch workflow.

```text
develop
   │
   ├── feature/frontend/...
   ├── feature/backend/...
   └── feature/...
```



## 📌 Future Improvements

Possible future improvements include:

* Additional test coverage
* Enhanced category management
* Improved accessibility
* Additional export formats
* Production deployment
* Advanced note filtering and organization

## 📄 License

This project was developed as part of the **10Pearls SHINE Program – Cohort 9**.
