## Setup & Installation

The recommended way to work with this project is to use a Python virtual environment (`venv`) so dependencies remain isolated from your system Python installation.

### 1. Create a Virtual Environment

From the repository root, run:

```bash
python -m venv venv
```

### 2. Activate the Virtual Environment

#### macOS / Linux

```bash
source venv/bin/activate
```

#### Windows (PowerShell)

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

Install the required Python packages using the `requirements.txt` file:

```bash
pip install -r requirements.txt
```

## Running the Program

Navigate to the `draw_app` folder:
```bash
cd ./draw_app
```
From the `draw_app` folder, start the development server:

```bash
python manage.py runserver 0.0.0.0:8000
```

## View the Application

Open the application in your browser:

```text
http://127.0.0.1:8000/
```
