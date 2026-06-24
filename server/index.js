const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Menu ────────────────────────────────────────────────────────────────────

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

// ─── In-memory storage ───────────────────────────────────────────────────────

const orders = [];
let orderIdCounter = 1;

// ─── Valid order statuses and their allowed next state ───────────────────────

const VALID_TRANSITIONS = {
  new: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: null,
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/menu
app.get("/api/menu", (req, res) => {
  res.status(200).json(menu);
});

// POST /api/orders
app.post("/api/orders", (req, res) => {
  const { customerName, phone, deliveryAddress, pizzas } = req.body;

  // Validate required top-level fields
  if (
    !customerName ||
    typeof customerName !== "string" ||
    customerName.trim() === ""
  ) {
    return res.status(400).json({ error: "Missing or invalid customerName" });
  }
  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    return res.status(400).json({ error: "Missing or invalid phone" });
  }
  if (
    !deliveryAddress ||
    typeof deliveryAddress !== "string" ||
    deliveryAddress.trim() === ""
  ) {
    return res
      .status(400)
      .json({ error: "Missing or invalid deliveryAddress" });
  }
  if (!pizzas || !Array.isArray(pizzas) || pizzas.length === 0) {
    return res
      .status(400)
      .json({ error: "Order must include at least one pizza" });
  }

  let totalPrice = 0;
  const processedPizzas = [];

  for (const item of pizzas) {
    // Validate pizza exists in menu
    const menuPizza = menu.pizzas.find((p) => p.id === item.pizzaId);
    if (!menuPizza) {
      return res
        .status(400)
        .json({ error: `Invalid pizza id: ${item.pizzaId}` });
    }

    // Validate size exists in menu
    const menuSize = menu.sizes.find((s) => s.id === item.sizeId);
    if (!menuSize) {
      return res.status(400).json({ error: `Invalid size id: ${item.sizeId}` });
    }

    const toppingIds = item.toppingIds ?? [];

    // FIX 1: Validate each topping id against the menu BEFORE checking the count,
    // so an invalid id always returns 400 and not a misleading message.
    const processedToppings = [];
    for (const tId of toppingIds) {
      const menuTopping = menu.toppings.find((t) => t.id === tId);
      if (!menuTopping) {
        return res.status(400).json({ error: `Invalid topping id: ${tId}` });
      }
      processedToppings.push(menuTopping);
    }

    // FIX 2: Reject duplicate toppings on the same pizza (would cause double billing).
    const uniqueToppingIds = new Set(toppingIds);
    if (uniqueToppingIds.size !== toppingIds.length) {
      return res.status(400).json({
        error: "Duplicate toppings are not allowed on the same pizza",
      });
    }

    // Personal rule (ID ending in 0): max 2 toppings per pizza.
    if (toppingIds.length > 2) {
      return res
        .status(400)
        .json({ error: "Maximum 2 toppings allowed per pizza" });
    }

    const pizzaCost =
      menuPizza.price +
      menuSize.price +
      processedToppings.reduce((sum, t) => sum + t.price, 0);

    totalPrice += pizzaCost;
    processedPizzas.push({
      pizza: menuPizza,
      size: menuSize,
      toppings: processedToppings,
      price: pizzaCost,
    });
  }

  const newOrder = {
    id: `ORD-${orderIdCounter++}`,
    customerName: customerName.trim(),
    phone: phone.trim(),
    deliveryAddress: deliveryAddress.trim(),
    pizzas: processedPizzas,
    totalPrice,
    status: "new",
    paymentStatus: "paid",
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// GET /api/orders  (optional ?status=new,preparing)
app.get("/api/orders", (req, res) => {
  const { status } = req.query;
  if (status) {
    const statuses = status.split(",");
    return res
      .status(200)
      .json(orders.filter((o) => statuses.includes(o.status)));
  }
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

  const { status: newStatus } = req.body;

  if (!newStatus || typeof newStatus !== "string") {
    return res
      .status(400)
      .json({ error: "Request body must include a 'status' field" });
  }

  if (VALID_TRANSITIONS[order.status] !== newStatus) {
    return res.status(409).json({
      error: `Invalid status transition from '${order.status}' to '${newStatus}'`,
    });
  }

  order.status = newStatus;
  res.status(200).json(order);
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
