# Pizza Ordering System

## Student Details
* Tomer Elimeleh - 208895870

**GitHub Repository:** 
https://github.com/tomertom14/fullstack-pizza-hw

---

## Installation & Running Instructions

### Server Setup (Node.js + Express)
1. Open a terminal and navigate to the `server` directory: `cd server`
2. Run `npm install` to install dependencies (express, cors).
3. Run `npm run dev` (or `npm start`) to start the server.
4. The server will run on the port defined by the `PORT` environment variable, or default to port `3001` if it is not set (e.g., `http://localhost:3001`).

### Client Setup (React + Vite)
1. Open a new terminal and navigate to the `client` directory: `cd client`
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the React application.
4. The client will run on Vite's default port (usually `http://localhost:5173`).

---

## Project Structure
The project is divided into two main directories:
* **server:** A Node.js backend using Express. It handles routing, stores the static menu data, manages in-memory orders, performs strict validations, and calculates total prices.
* **client:** A React frontend (bootstrapped with Vite) featuring a flat UI with 4 views (Customer, Employee, Delivery, and History). State management is handled centrally without complex routing to maintain simplicity.

---

## Personal Business Rule
**Rule (ID ending in 0):** A maximum of two toppings can be selected per pizza.
* **Implementation:** This rule is strictly enforced on both sides. On the client side, the UI prevents the user from selecting more than two toppings per pizza and displays an alert. On the server side, the `POST /api/orders` route validates the toppings array length and returns a `400 Bad Request` if the limit is exceeded.

---

## Design Changes from Exercise 1
We decided to forgo complex Service layers and rigid OOP classes (as originally planned in the Class Diagram) in favor of using plain JavaScript objects stored in memory. This aligns better with the Node.js/React ecosystem and adheres to the assignment's guidelines to prefer a "small, organized, and stable system over a large and complicated one".

---

## Q&A

**1. What is the difference between the client side and the server side in your system?**
The client side is solely responsible for presenting the UI, collecting user input, and displaying data. The server side acts as the "source of truth." It handles the business logic, validates incoming requests, securely calculates prices, and stores the application's state (orders) in memory.

**2. Where is the total price calculated and why?**
The total price is calculated exclusively on the server. This is a critical security measure to prevent malicious users from tampering with the final price via the browser or API requests. The server relies only on its internal static menu prices to determine the cost.

**3. What happens when a client sends an invalid order?**
The server strictly validates the payload. If required fields are missing, invalid menu items are selected, or the personal rule (max 2 toppings) is violated, the server immediately rejects the request and returns a `400 Bad Request` status code along with an error message, which is then displayed to the user on the client side.

**4. What happens after the mock payment succeeds?**
The server generates a unique order ID, saves the order in memory with a 'new' status, and returns a `201 Created` status code. The client then clears the shopping cart and displays an official order confirmation screen containing the order ID, status, and server-calculated price. Simultaneously, the order becomes visible to the Restaurant Employee.

**5. What is the personal rule that applies to you?**
Because the submitting student's ID ends in 0, the rule is: A maximum of two toppings is allowed per pizza.

**6. What was the most challenging part of the assignment?**
The most challenging part was managing the asynchronous state updates and ensuring the UI efficiently re-rendered across the different views (Customer, Employee, Delivery) whenever an order's status transitioned through the valid state machine.

**7. Name one design decision you made and explain why.**
We decided to use React's conditional rendering with a single state variable (`currentView`) to navigate between screens instead of using a third-party library like React Router. This kept our architecture minimalist, reduced dependencies, and perfectly fit the requirement for a simple, single-page application structure.