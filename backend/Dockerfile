# 1. Start with an official Python image
FROM python:3.11-slim

# 2. Set the working directory
WORKDIR /app

# 3. Copy the list of packages
COPY requirements.txt .

# 4. Install all the packages
RUN pip install -r requirements.txt

# 5. Copy all the backend code into the container
COPY . .

# 6. Tell Docker what command to run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]