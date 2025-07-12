# Docker Setup for ArgFuscator

This guide explains how to run ArgFuscator using Docker, including deployment on TrueNAS Scale.

## Quick Start

### Option 1: Using Docker Compose
```bash
# Clone the repository
git clone https://github.com/wietze/ArgFuscator.net.git
cd ArgFuscator.net

# Build and run
docker-compose up -d

# Access at http://localhost:4000
```

### Option 2: Direct Docker Build
```bash
# Build the image
docker build -t argfuscator .

# Run the container
docker run -d -p 4000:4000 --name argfuscator argfuscator

# Access at http://localhost:4000
```

## TrueNAS Scale Deployment

### Method 1: Upload Dockerfile (Recommended)
1. Go to **Apps → Available Applications**
2. Click **Launch Docker Image**
3. Choose **Upload** method
4. Upload the `Dockerfile` from this repository
5. Set container name: `argfuscator`
6. Set port mapping: `4000:4000` (or your preferred external port)
7. Click **Deploy**

### Method 2: Using Portainer
1. Access Portainer in TrueNAS Scale
2. Go to **Stacks → Add Stack**
3. Use the provided `docker-compose.yml`
4. Upload the `Dockerfile` when prompted
5. Deploy the stack

### Method 3: Manual Build
```bash
# SSH into TrueNAS Scale
ssh root@your-truenas-ip

# Create build directory
mkdir -p /tmp/argfuscator && cd /tmp/argfuscator

# Copy Dockerfile content (or wget from GitHub)
nano Dockerfile

# Build the image
docker build -t argfuscator:latest .

# Run using docker-compose or direct docker run
```

## Configuration

### Port Configuration
- **Internal Port**: 4000 (Jekyll default)
- **External Port**: Configurable (default: 4000)
- **TrueNAS**: Change in port mapping as needed

### Environment Variables
- `TZ`: Set timezone (default: UTC)
- `DEBIAN_FRONTEND`: Non-interactive (for build)

### Volumes (Optional)
- `/app`: Application data (auto-populated from GitHub)
- No persistent storage required - app rebuilds from source

## Build Process

The Docker container follows these steps:
1. **Base**: Ubuntu 22.04
2. **Dependencies**: Node.js 18.x, TypeScript, Python 3, Ruby, Jekyll
3. **Source**: Clones from GitHub repository
4. **Build**: 
   - Compiles TypeScript to `gui/assets/js/main.js`
   - Copies models to `gui/assets/`
   - Transforms JSON models to Jekyll entries
   - Builds Jekyll site
5. **Serve**: Jekyll development server on port 4000

## Troubleshooting

### Build Issues
- **TypeScript errors**: Fixed by using Node.js 18.x
- **Missing dependencies**: All installed in Dockerfile
- **Git clone fails**: Check internet connectivity

### Runtime Issues
```bash
# Check container logs
docker logs argfuscator

# Check if service is running
curl http://localhost:4000

# Restart container
docker restart argfuscator
```

### TrueNAS Specific
- **Port conflicts**: Change external port mapping
- **Build timeouts**: Try building during off-peak hours
- **Network issues**: Ensure container has internet access for git clone

## Security Considerations

- Container runs Jekyll development server (suitable for internal use)
- No authentication built-in
- Consider reverse proxy with SSL for external access
- Git clone happens during build (uses public repository)

## Performance

- **Build time**: ~5-10 minutes (downloads dependencies)
- **Runtime**: Lightweight Jekyll server
- **Memory**: ~200-500MB typical usage
- **CPU**: Minimal when idle

## Updates

To update to latest version:
```bash
# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Files

- `Dockerfile`: Container build instructions
- `docker-compose.yml`: Service configuration
- `.dockerignore`: Excludes unnecessary files from build context

## Support

- Original project: [ArgFuscator.net](https://github.com/wietze/ArgFuscator.net)
- Docker setup: This fork/branch
- Issues: Report on GitHub repository
