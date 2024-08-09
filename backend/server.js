const express = require("express");
const path = require("path");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const http = require('http');
const WebSocket = require('ws');
const app = express();
const cors = require("cors");
require("dotenv").config();


app.use(cors());
app.use(
  cors({
    origin: "http://insect-production-frontend.s3-website-ap-southeast-2.amazonaws.com",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
  })
);
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
});



// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', ws => {
  console.log('Client connected');

  // Send updates to clients
  const interval = setInterval(() => {
    ws.send(JSON.stringify({ message: 'Update from server' }));
  }, 5000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  ws.on('message', message => {
    console.log('Received:', message);
    // Handle incoming messages from clients
  });
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the directory where server.js is located
app.use(express.static(__dirname));
app.use(bodyParser.json());

// Serve signup.html
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

// Serve dashboard.html
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Add Data
app.post("/add-data", async (req, res) => {
  const { RoomNumber, Date, FoodType, WaterType, Tubs, Week, Stock } = req.body;

  if (
    RoomNumber === undefined ||
    Date === undefined ||
    FoodType === undefined ||
    WaterType === undefined ||
    Tubs == undefined ||
    Week == undefined ||
    Stock == undefined
  ) {
    return res.status(400).send("Missing required fields");
  }

  if (typeof RoomNumber !== "number" || typeof Tubs !== "number") {
    return res.status(400).send("RoomNumber and Tubs must be numbers");
  }

  const params = {
    TableName: "InsectProductionStock",
    Item: {
      RoomNumber,
      Date,
      FoodType,
      WaterType,
      Tubs,
      Stock,
      Week,
    },
  };

  try {
    await dynamoDB.put(params).promise();
    res.status(201).json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).send(`Error adding data: ${error.message}`);
  }
});

//get list
app.get("/get-list", async (req, res) => {
  const params = {
    TableName: "InsectProductionStock",
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    console.error(
      "Unable to scan the table. Error JSON:",
      JSON.stringify(err, null, 2)
    );
    res.status(500).json({ error: "Could not retrieve data" });
  }
});

// Retrieve Data
app.get("/get-data/:roomNumber", async (req, res) => {
  const roomNumber = parseInt(req.params.roomNumber, 10);

  if (isNaN(roomNumber)) {
    return res.status(400).send("Invalid RoomNumber");
  }

  const params = {
    TableName: "InsectProductionStock",
    Key: {
      RoomNumber: roomNumber,
    },
  };

  try {
    const data = await dynamoDB.get(params).promise();
    if (data.Item) {
      res.status(200).json(data.Item);
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).send(`Error retrieving data: ${error.message}`);
  }
});

// Update Data
app.put("/update-data", async (req, res) => {
  const { RoomNumber, Date, FoodType, WaterType, Tubs, Week, Stock } = req.body;

  if (
    RoomNumber === undefined ||
    Date === undefined ||
    FoodType === undefined ||
    WaterType === undefined ||
    Tubs == undefined ||
    Week == undefined ||
    Stock == undefined
  ) {
    return res.status(400).send("Missing required fields");
  }

  if (typeof RoomNumber !== "number" || typeof Tubs !== "number") {
    return res.status(400).send("RoomNumber and Tubs must be numbers");
  }

  const params = {
    TableName: "InsectProductionStock",
    Key: {
      RoomNumber,
    },
    UpdateExpression:
      "set #d = :date, #f = :foodType, #w = :waterType, #t = :tubs ,#we = :week, #s = :stock",
    ExpressionAttributeNames: {
      "#d": "Date",
      "#f": "FoodType",
      "#w": "WaterType",
      "#t": "Tubs",
      "#we": "Week",
      "#s": "Stock",
    },
    ExpressionAttributeValues: {
      ":date": Date,
      ":foodType": FoodType,
      ":waterType": WaterType,
      ":tubs": Tubs,
      ":week": Week,
      ":stock": Stock,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await dynamoDB.update(params).promise();
    res.status(200).json(result.Attributes);
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send(`Error updating data: ${error.message}`);
  }
});

// Delete Data
app.delete("/delete-data/:roomNumber", async (req, res) => {
  const roomNumber = parseInt(req.params.roomNumber, 10);

  if (isNaN(roomNumber)) {
    return res.status(400).send("Invalid RoomNumber");
  }

  const params = {
    TableName: "InsectProductionStock",
    Key: {
      RoomNumber: roomNumber,
    },
  };

  try {
    await dynamoDB.delete(params).promise();
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send(`Error deleting data: ${error.message}`);
  }
});

const { signUp, confirmSignUp, signIn } = require("./auth");

app.post("/sign-up", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const user = await signUp(username, password, email);
    res.status(200).json({
      message:
        "Sign-Up successful. Please check your email for the confirmation code.",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error signing up", error: error.message });
  }
});

app.post("/confirm-sign-up", async (req, res) => {
  const { username, confirmationCode } = req.body;
  try {
    const result = await confirmSignUp(username, confirmationCode);
    res.status(200).json({
      message: "Confirmation successful. You can now sign in.",
      result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error confirming sign-up", error: error.message });
  }
});

app.post("/sign-in", async (req, res) => {
  const { username, password } = req.body;
  try {
    const authResult = await signIn(username, password);
    res.status(200).json({ message: "Sign-In successful", authResult });
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
