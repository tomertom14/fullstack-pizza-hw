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
    paymentStatus: "paid", // Added payment status
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder); // Return 201 Created [cite: 78]
});

// GET /api/orders (with optional status query)
app.get("/api/orders", (req, res) => {
  const status = req.query.status;
  if (status) {
    // If status is provided, filter the orders.
    // We split by comma to allow querying multiple statuses at once (e.g., ?status=new,preparing)
    const statuses = status.split(",");
    const filtered = orders.filter((o) => statuses.includes(o.status));
    return res.status(200).json(filtered);
  }
  // If no status is provided, return all orders
  res.status(200).json(orders);
});

// GET /api/orders/:id
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.status(200).json(order);
});

// PATCH /api/orders/:id/status
app.patch("/api/orders/:id/status", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const newStatus = req.body.status;

  // Define valid state machine transitions
  const validTransitions = {
    new: "preparing",
    preparing: "ready",
    ready: "delivered",
    delivered: null, // Cannot transition out of delivered
  };

  if (validTransitions[order.status] !== newStatus) {
    return res.status(409).json({
      error: `Invalid status transition from ${order.status} to ${newStatus}`,
    });
  }

  order.status = newStatus;
  res.status(200).json(order);
});
