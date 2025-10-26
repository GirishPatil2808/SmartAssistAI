# Use an official lightweight Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to cache packages
COPY requirements.txt .

# Install the Python packages
RUN pip install -r requirements.txt

# Copy all the backend code (main.py, .env, etc.) into the container
COPY . .

# Tell Docker what command to run when the container starts
# We use 0.0.0.0 to make it accessible outside the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]