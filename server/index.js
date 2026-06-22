const express = require("express");
const cors = require("cors");

const app = express();
// The server must use the PORT environment variable or default to 3001
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mandatory menu items
const menu = {
  pizzas: [
    { id: "p1", name: "Margherita", price: 35 },
    { id: "p2", name: "Vegetarian", price: 39 },
    { id: "p3", name: "Pepperoni", price: 42 },
  ],
  sizes: [
    { id: "s1", name: "Small", price: 0 },
    { id: "s2", name: "Medium", price: 8 },
    { id: "s3", name: "Large", price: 15 },
  ],
  toppings: [
    { id: "t1", name: "Olives", price: 4 },
    { id: "t2", name: "Mushrooms", price: 4 },
    { id: "t3", name: "Corn", price: 4 },
    { id: "t4", name: "Onion", price: 4.5 },
    { id: "t5", name: "Extra Cheese", price: 3.5 },
  ],
};

// GET /api/menu route
app.get("/api/menu", (req, res) => {
  res.status(200).json(menu);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
