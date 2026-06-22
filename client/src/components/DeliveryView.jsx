import { useState, useEffect } from 'react';

export default function DeliveryView() {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/orders?status=ready');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Failed to fetch delivery orders", err);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id) => {
        try {
            const res = await fetch(`http://localhost:3001/api/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'delivered' })
            });
            if (res.ok) {
                fetchOrders();
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    return (
        <div data-testid="delivery-orders">
            <h2>Delivery View - Ready for Delivery</h2>
            {orders.length === 0 ? <p>No orders ready for delivery.</p> : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {orders.map(o => (
                        <li key={o.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px' }}>
                            <p><strong>Order ID:</strong> {o.id}</p>
                            <p><strong>Customer:</strong> {o.customerName}</p>
                            <p><strong>Phone:</strong> {o.phone}</p>
                            <p><strong>Address:</strong> {o.deliveryAddress}</p>
                            
                            <button onClick={() => updateStatus(o.id)}>Mark as Delivered</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}