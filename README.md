Project: CI/CD Login Portal Deployment on AWS EC2
Objective:
To deploy a static Login Portal website (HTML, CSS, JS) from GitHub onto an AWS EC2 Ubuntu web server automatically using Jenkins.

Step 1: Project Setup (Local)
Created a frontend project folder: loginproject/
login.html
password.html
style.css
javascript.js

Verified the project works locally on the laptop.
Pushed the code to GitHub:
🔗 Repository: https://github.com/yourreponame/login_portal


Step 2: AWS EC2 Setup
Launched an EC2 Ubuntu instance.
Connected using SSH:
ssh -i "key.pem" ubuntu@<your-ec2-public-ip>

Updated the system:
sudo apt update -y
sudo apt upgrade -y


Installed Apache web server:
sudo apt install apache2 -y


Started and enabled Apache:
sudo systemctl start apache2
sudo systemctl enable apache2


Verified by opening in browser:
http://<EC2-Public-IP>/ 


Step 3: Jenkins Installation & Setup
Installed Java (required for Jenkins):
sudo apt install openjdk-17-jre -y


Added Jenkins repo and installed Jenkins:
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee \
/usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
https://pkg.jenkins.io/debian binary/ | sudo tee \
/etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update -y
sudo apt install jenkins -y


Started Jenkins:
sudo systemctl start jenkins
sudo systemctl enable jenkins


Opened Jenkins in browser:
http://<EC2-Public-IP>:8080


Step 4: Jenkins Configuration
Unlocked Jenkins using:
sudo cat /var/lib/jenkins/secrets/initialAdminPassword


Installed suggested plugins.
Created admin user and logged in.

Step 5: Git Configuration in Server
Installed Git:
sudo apt install git -y


Configured Git username and email:
git config --global user.name "githubname"
git config --global user.email "yourmailid"


🔧 Step 6: Jenkins Job Setup for Deployment

Created a new Jenkins Freestyle Project named LoginPortalDeploy.
Configured GitHub Repository URL:
https://github.com/githubid/login_portal.git

Build Trigger: Build Now (manual or automatic via GitHub webhook).

Build Step (Execute Shell):
sudo chown -R jenkins:jenkins /var/www/html
sudo rm -rf /var/www/html/*
sudo cp -r * /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo systemctl restart apache2

🧾 Step 7: Fixing Common Errors

Fixed “Permission Denied” by giving Jenkins access:
sudo chown -R jenkins:jenkins /var/www/html
Fixed Apache startup issues by restarting:
sudo systemctl restart apache2

Renamed homepage to:
mv login.html index.html

🌐 Step 8: Accessing the Website
✅ Successfully accessed website using
http://Your EC2 IP/

<img width="1585" height="848" alt="image" src="https://github.com/user-attachments/assets/d78cc285-9edc-42be-8384-7b834f5a5ec1" />
<img width="1588" height="851" alt="image" src="https://github.com/user-attachments/assets/b2c4b44b-0133-45fa-8601-db5b5f13c7fb" />




