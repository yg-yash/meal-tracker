#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==== Meal Calorie Tracker - Render Deployment Preparation ====${NC}"
echo -e "${YELLOW}This script will prepare your application for deployment to Render${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Check if the directory is a git repository
if [ ! -d .git ]; then
    echo -e "${YELLOW}Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}Git repository initialized.${NC}"
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}You have uncommitted changes. Committing them now...${NC}"
    git add .
    git commit -m "Prepare for Render deployment"
    echo -e "${GREEN}Changes committed.${NC}"
fi

# Check if GitHub CLI is installed for easy repository creation
if command -v gh &> /dev/null; then
    echo -e "${YELLOW}Would you like to create a GitHub repository and push your code? (y/n)${NC}"
    read -r create_repo
    
    if [[ $create_repo == "y" || $create_repo == "Y" ]]; then
        echo -e "${YELLOW}Enter a name for your GitHub repository:${NC}"
        read -r repo_name
        
        echo -e "${YELLOW}Creating GitHub repository...${NC}"
        gh repo create "$repo_name" --private --source=. --push
        echo -e "${GREEN}Repository created and code pushed.${NC}"
    else
        echo -e "${YELLOW}Skipping GitHub repository creation.${NC}"
    fi
else
    echo -e "${YELLOW}GitHub CLI not found. Please create a repository manually and push your code.${NC}"
    echo -e "${YELLOW}Instructions:${NC}"
    echo "1. Create a repository on GitHub"
    echo "2. Run the following commands:"
    echo "   git remote add origin https://github.com/yourusername/your-repo.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi

echo -e "${GREEN}==== Deployment Preparation Complete ====${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Go to https://render.com and sign up/log in"
echo "2. Click 'New' and select 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will detect the render.yaml file and suggest services to deploy"
echo "5. Add the required environment variables:"
echo "   - MONGODB_URI: Your MongoDB connection string"
echo "   - JWT_SECRET: A secure random string for JWT token signing"
echo "6. Click 'Apply' to start the deployment"
echo -e "${GREEN}Your application will be deployed to Render!${NC}"
