# ITPT324GC2

Project Overview
Pisces Enterprises is a company that produces a variety of wholesale products, with the insect production area being the largest production section. The current insect production process relies heavily on manual records, which results in low data processing efficiency, a lack of real-time information, and difficulty in inventory forecasting. These issues can easily lead to production and economic losses. To help the client address these problems, this project will develop a web application. It can be accessed through any modern web browser, providing convenience and flexibility, and allowing managers and employees to interact with the system from different locations and devices.

Project team member
  Project Manager and Frontend Developer: Juan Camilo Serna Trejos
  Frontend Developer: Eunhye Park 
  Backend Developer: Brodie Morgan 
  Backend Developer: Mengnan Liu

THERE IS A .ENV FILE I WILL PUT IN THE DISCORD THAT CONTAINS "SENSITIVE INFORMATION" AND GITHUB WILL NOT ALLOW ME TO PUSH IT TO THE REPOSITORY

TO TEST THE BACKEND CRUD FUNCTIONS/PROCESSES:

 first open the terminal in you IDE (i am using VisualStudio) and navigate the the backend folder directory (C:\Users\brodi\Desktop\ITPT324GC2\backend) and run the server.js file by typing "node server.js" then copy and paste ONE of the following code blocks into the requests.http and click send request
 (This may only be done in the VisualStudio IDE and you must also have the REST Client extenstion installed in the IDE)

1. add data
POST http://localhost:3000/add-data
Content-Type: application/json

{
    "RoomNumber": 5,
    "Tubs": 20,
    "Date": "15-02-2024",
    "FoodType": "1 Scoop",
    "WaterType": "Bottle"
}

2. edit data
PUT http://localhost:3000/update-data/5
Content-Type: application/json

{
    "RoomNumber": 5,
    "Tubs": 23,
    "Date": "23-02-2024",
    "FoodType": "2 Scoops",
    "WaterType": "Bottle with ring"
}

3. get data
GET http://localhost:3000/get-data/5

4. delete data
DELETE http://localhost:3000/delete-data/5




TO TEST THE SIGN UP, CONFIRM USER AND SIGN IN AUTH FUNCTIONALITY FOLLOW THE STEPS BELOW:

1. Go into the github project folder and find the testSignUp.js file and enter a real email address you have access to into the code (i have left a comment for where you do this)
2. open cmd (Command Prompt) and navigate to the backend folder in the github project
3. once in the backend folder type "node testSignUp.js" this will submit your sign up request and a confirmation code will be sent to your email.
4. copy this code into the testConfirmUser.js file (i have left a comment showing where to put it)
5. Now back in cmd type "node testConfirmUser.js" this will confirm your email address
6. Finally while still in cmd type "node testSignIn.js" this will return an Access, ID and Return Tokens from the sign in request being completed successfully
