import { useState } from 'react';

export default function CustomerView({ menu }) {
    const [cart, setCart] = useState([]);
    const [selectedPizza, setSelectedPizza] = useState(menu.pizzas[0]);
    const [selectedSize, setSelectedSize] = useState(menu.sizes[0]);
    const [selectedToppings, setSelectedToppings] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });

    const handleToppingChange = (topping) => {
        if (selectedToppings.find(t => t.id === topping.id)) {
            setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
        } else {
            // Personal rule: max 2 toppings per pizza
            if (selectedToppings.length < 2) {
                setSelectedToppings([...selectedToppings, topping]);
            } else {
                alert("You can only select up to 2 toppings per pizza.");
            }
        }
    };

    const addToCart = () => {
        const item = {
            id: Date.now(), 
            pizza: selectedPizza,
            size: selectedSize,
            toppings: selectedToppings
        };
        setCart([...cart, item]);
        setSelectedPizza(menu.pizzas[0]);
        setSelectedSize(menu.sizes[0]);
        setSelectedToppings([]);
    };

    const estimatedTotal = cart.reduce((total, item) => {
        let itemPrice = item.pizza.price + item.size.price;
        item.toppings.forEach(t => itemPrice += t.price);
        return total + itemPrice;
    }, 0);

    return (
        <div>
            <h2>Customer Menu</h2>
            <div data-testid="menu-list">
                <h3>Select Pizza</h3>
                {menu.pizzas.map(p => (
                    <label key={p.id} style={{ display: 'block' }}>
                        <input type="radio" name="pizza" checked={selectedPizza.id === p.id} onChange={() => setSelectedPizza(p)} />
                        {p.name} ({p.price} NIS)
                    </label>
                ))}
                
                <h3>Select Size</h3>
                {menu.sizes.map(s => (
                    <label key={s.id} style={{ display: 'block' }}>
                        <input type="radio" name="size" checked={selectedSize.id === s.id} onChange={() => setSelectedSize(s)} />
                        {s.name} (+{s.price} NIS)
                    </label>
                ))}

                <h3>Select Toppings (Max 2)</h3>
                {menu.toppings.map(t => (
                    <label key={t.id} style={{ display: 'block' }}>
                        <input type="checkbox" checked={selectedToppings.some(st => st.id === t.id)} onChange={() => handleToppingChange(t)} />
                        {t.name} (+{t.price} NIS)
                    </label>
                ))}
                <button onClick={addToCart} style={{ marginTop: '10px' }}>Add to Cart</button>
            </div>

            <hr />

            <div data-testid="cart">
                <h3>Your Cart</h3>
                {cart.length === 0 ? <p>Cart is empty</p> : (
                    <ul>
                        {cart.map(item => (
                            <li key={item.id}>
                                {item.pizza.name} ({item.size.name}) 
                                {item.toppings.length > 0 && ` + ${item.toppings.map(t => t.name).join(', ')}`}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <hr />

            <div data-testid="order-summary-panel">
                <h3>Order Summary</h3>
                <p>Estimated Total: {estimatedTotal} NIS</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxWidth: '200px' }}>
                    <input type="text" placeholder="Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    <input type="text" placeholder="Phone" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                    <input type="text" placeholder="Address" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                </div>
                
                <button data-testid="checkout-button" style={{ marginTop: '10px' }} 
                        disabled={cart.length === 0 || !customerInfo.name || !customerInfo.phone || !customerInfo.address}>
                    Checkout
                </button>
            </div>
        </div>
    );
}