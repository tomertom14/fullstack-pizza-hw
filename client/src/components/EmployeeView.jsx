import { useState, useEffect } from 'react';

export default function EmployeeView() {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            // Fetch both new and preparing orders
            const res = await fetch('http://localhost:3001/api/orders?status=new,preparing');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Failed to fetch employee orders", err);
        }
    };

    // Fetch orders on mount and every 5 seconds to keep it updated
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`http://localhost:3001/api/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchOrders(); // Refresh list on success
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    return (
        <div data-testid="employee-orders">
            <h2>Employee View - Active Orders</h2>
            {orders.length === 0 ? <p>No active orders.</p> : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {orders.map(o => (
                        <li key={o.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px' }}>
                            <p><strong>Order ID:</strong> {o.id}</p>
                            <p><strong>Customer:</strong> {o.customerName}</p>
                            <p><strong>Items:</strong> {o.pizzas.map(p => `${p.pizza.name} (${p.size.name})`).join(', ')}</p>
                            <p><strong>Total:</strong> {o.totalPrice} NIS</p>
                            <p><strong>Status:</strong> {o.status}</p>
                            
                            {o.status === 'new' && (
                                <button onClick={() => updateStatus(o.id, 'preparing')}>Start Preparing</button>
                            )}
                            {o.status === 'preparing' && (
                                <button onClick={() => updateStatus(o.id, 'ready')}>Mark as Ready</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}