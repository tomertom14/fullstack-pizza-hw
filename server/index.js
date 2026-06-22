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

// In-memory storage for orders
const orders = [];
let orderIdCounter = 1;

// POST /api/orders
app.post("/api/orders", (req, res) => {
  // Expected fields from client [cite: 53, 54]
  const { customerName, phone, deliveryAddress, pizzas } = req.body;

  // Basic Validation
  if (
    !customerName ||
    !phone ||
    !deliveryAddress ||
    !pizzas ||
    !Array.isArray(pizzas) ||
    pizzas.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Missing required fields or empty pizza list" });
  }

  let totalPrice = 0;
  const processedPizzas = [];

  // Process and validate pizzas
  for (const item of pizzas) {
    const menuPizza = menu.pizzas.find((p) => p.id === item.pizzaId);
    const menuSize = menu.sizes.find((s) => s.id === item.sizeId);

    if (!menuPizza || !menuSize) {
      return res.status(400).json({ error: "Invalid pizza or size selected" });
    }

    // Personal rule validation: max 2 toppings
    if (item.toppingIds && item.toppingIds.length > 2) {
      return res
        .status(400)
        .json({ error: "Maximum 2 toppings allowed per pizza" });
    }

    let pizzaCost = menuPizza.price + menuSize.price;
    const processedToppings = [];

    if (item.toppingIds) {
      for (const tId of item.toppingIds) {
        const menuTopping = menu.toppings.find((t) => t.id === tId);
        if (!menuTopping) {
          return res.status(400).json({ error: `Invalid topping: ${tId}` });
        }
        pizzaCost += menuTopping.price;
        processedToppings.push(menuTopping);
      }
    }

    totalPrice += pizzaCost; // Calculate total purely on the server
    processedPizzas.push({
      pizza: menuPizza,
      size: menuSize,
      toppings: processedToppings,
      price: pizzaCost,
    });
  }

  // Create the order
  const newOrder = {
    id: `ORD-${orderIdCounter++}`,
    customerName,
    phone,
    deliveryAddress,
    pizzas: processedPizzas,
    totalPrice,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder); // Return 201 Created [cite: 78]
});
