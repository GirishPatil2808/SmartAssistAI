# Use an official lightweight nginx web server image
FROM nginx:alpine

# Set the working directory to the default nginx web folder
WORKDIR /usr/share/nginx/html

# Copy all our widget files (index.html, style.css, widget.js)
# into that folder
COPY . .