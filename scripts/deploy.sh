#!/bin/bash

# Production Deployment Script
# Automates the deployment process for production environment

set -e  # Exit on any error

# Configuration
PROJECT_NAME="equity-leaders-website"
FRONTEND_DIR="frontend"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
DEPLOY_DIR="/var/www/$PROJECT_NAME"
LOG_FILE="/var/log/deploy/$PROJECT_NAME.log"
HEALTH_CHECK_URL="https://equity-leaders.com/api/health"
ROLLBACK_URL="https://equity-leaders.com/api/rollback"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$DEPLOY_DIR"
    success "Directories created"
}

# Backup current deployment
backup_current() {
    log "Backing up current deployment..."
    
    if [[ -d "$DEPLOY_DIR/current" ]]; then
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        cp -r "$DEPLOY_DIR/current" "$BACKUP_DIR/$BACKUP_NAME"
        success "Backup created: $BACKUP_NAME"
    else
        warning "No current deployment found to backup"
    fi
}

# Update code from repository
update_code() {
    log "Updating code from repository..."
    
    cd "$DEPLOY_DIR"
    
    if [[ ! -d ".git" ]]; then
        git clone https://github.com/your-org/$PROJECT_NAME.git .
    else
        git fetch origin
        git reset --hard origin/main
    fi
    
    success "Code updated"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd "$DEPLOY_DIR/$FRONTEND_DIR"
    npm ci --production
    
    success "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$DEPLOY_DIR/$FRONTEND_DIR"
    
    # Load environment variables
    if [[ -f ".env.deployment" ]]; then
        export $(cat .env.deployment | grep -v '^#' | xargs)
    fi
    
    npm run build
    
    success "Application built"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    cd "$DEPLOY_DIR/$FRONTEND_DIR"
    
    # Run unit tests
    npm run test:ci
    
    # Run E2E tests if available
    if command -v cypress &> /dev/null; then
        npm run test:e2e:headless
    fi
    
    success "All tests passed"
}

# Deploy new version
deploy_new_version() {
    log "Deploying new version..."
    
    # Create new deployment directory
    NEW_DEPLOY_DIR="$DEPLOY_DIR/releases/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$NEW_DEPLOY_DIR"
    
    # Copy built files
    cp -r "$DEPLOY_DIR/$FRONTEND_DIR/dist"/* "$NEW_DEPLOY_DIR/"
    
    # Update symlink to new version
    ln -sfn "$NEW_DEPLOY_DIR" "$DEPLOY_DIR/current"
    
    # Set proper permissions
    chown -R www-data:www-data "$NEW_DEPLOY_DIR"
    chmod -R 755 "$NEW_DEPLOY_DIR"
    
    success "New version deployed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        warning "Health check attempt $attempt/$max_attempts failed"
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Get latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n 1)
    
    if [[ -n "$LATEST_BACKUP" ]]; then
        cp -r "$BACKUP_DIR/$LATEST_BACKUP"/* "$DEPLOY_DIR/current/"
        success "Rollback completed"
    else
        error "No backup found for rollback"
        return 1
    fi
}

# Cleanup old deployments
cleanup() {
    log "Cleaning up old deployments..."
    
    # Keep only last 5 deployments
    cd "$DEPLOY_DIR/releases"
    ls -t | tail -n +6 | xargs -r rm -rf
    
    # Keep only last 10 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +11 | xargs -r rm -rf
    
    success "Cleanup completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Slack notification (if webhook is configured)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$PROJECT_NAME deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    # Email notification (if configured)
    if [[ -n "$ADMIN_EMAIL" ]]; then
        echo "$message" | mail -s "$PROJECT_NAME deployment $status" "$ADMIN_EMAIL"
    fi
}

# Main deployment function
main() {
    log "Starting deployment process..."
    
    # Check prerequisites
    check_root
    create_directories
    
    # Deployment steps
    backup_current
    update_code
    install_dependencies
    build_application
    run_tests
    deploy_new_version
    
    # Health check
    if health_check; then
        cleanup
        success "Deployment completed successfully!"
        send_notification "SUCCESS" "Deployment completed successfully at $(date)"
    else
        error "Deployment failed health check"
        rollback
        send_notification "FAILED" "Deployment failed and was rolled back at $(date)"
        exit 1
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    health-check)
        health_check
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check|cleanup}"
        exit 1
        ;;
esac