FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    ruby \
    ruby-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x (newer version)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Install TypeScript globally
RUN npm install -g typescript

# Install Python dependencies
RUN pip3 install pyyaml

# Install Jekyll and bundler
RUN gem install bundler jekyll webrick

# Set working directory
WORKDIR /app

# Clone the repository
RUN git clone https://github.com/wietze/ArgFuscator.net.git .
RUN ls -la

# Step 1: Compile TypeScript
RUN mkdir -p gui/assets/js
RUN tsc --project src/ --outfile gui/assets/js/main.js

# Step 2: Copy and convert models
RUN cp -r models/ gui/assets/
RUN mkdir -p gui/_entries
RUN python3 .github/workflows/json-transform.py

# Step 3: Build Jekyll site
WORKDIR /app/gui
RUN jekyll build

# Expose port
EXPOSE 4000

# Start Jekyll serve
CMD ["jekyll", "serve", "--host", "0.0.0.0", "--port", "4000"]
