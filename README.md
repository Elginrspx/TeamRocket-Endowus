# 🧍 Solution 2 - Portfolio Simulator
[FYP Project] Gamifying Financial Literacy

## Project Tools
- [Notion](https://www.notion.so/ng-pei-ming-jessie/846cc0d09da74884a65581b2b1b7fc0b?v=55f27f5d83094e9484e1b6ef67bdcb02), our home page for the project
- [GitHub](https://github.com/Elginrspx/TeamRocket-Endowus), for version control

## Application Technologies
- **Front-End**: HTML, CSS, Javascript
- **Back-End**: NodeJS
- **Database**: MongoDB Atlas
- **Deployment**: Netlify (Frontend), Heroku (Backend)
- **Testing**: SIT, UAT
- **Continuous Integration (CI)**: GitHub Actions
- **Continuous Deployment (CD)**: Netlify, Heroku

## Directory Layout
- `.github\workflows` contains the github actions 
- `public\assets` contains the asset files
- `src` contains the scene (map) files and js files for running Phaser
```
.
├───.github\workflows
├───public
    └───assets
        ├───characters
        ├───data
        ├───form
        ├───images
        ├───music
        └───tilemaps
└───src
     ├───plugins
     ├───scenes
     ├───eventscemter.js
     ├───index.html
     ├───main.js
     ├───node.js
     └───settings.js
├───Procfile
├───README.md
└───package.json
```
## Deployed Application 
   Navigate to https://endowusgame.netlify.app/
   
### Template Accounts
Enter the following information to authenticate as the related persona, each persona will experience a different sequence of events
```
Demo Account [demo@gmail.com]
Student [student@gmail.com]
Fresh Graduate [fresh_grad@gmail.com]
Bachelor [bachelor@gmail.com]
Married Man [married_man@gmail.com]
Family Man [family_man@gmail.com]
```
*If upon entering any of the above details, and nothing occurs, please wait 5-10 seconds and refresh the browser before re-initiating the login process. This is a limitation due to our backend, Heroku, going into an inactive state upon prolonged periods of inactivity.
   
## Installation & Running on Local Machine
1. Install requirements 
   ```
   > npm install
   ```
2. Open 2 terminals, run the following command in each terminal
   ```
   > npm run start
   > node src/node.js
   ```
   Navigate to http://localhost:1234/
   

   
