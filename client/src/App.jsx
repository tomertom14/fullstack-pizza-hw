import { useState, useEffect } from 'react';
import CustomerView from './components/CustomerView';
import EmployeeView from './components/EmployeeView';
import DeliveryView from './components/DeliveryView';

function App() {
    const [currentView, setCurrentView] = useState('customer'); 
    const [menu, setMenu] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/menu')
            .then(res => res.json())
            .then(data => setMenu(data))
            .catch(err => console.error("Failed to fetch menu:", err));
    }, []);

    if (!menu) return <div>Loading Menu...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Pizza Ordering System</h1>
            <nav style={{ marginBottom: '20px', gap: '10px', display: 'flex' }}>
                <button onClick={() => setCurrentView('customer')}>Customer</button>
                <button onClick={() => setCurrentView('employee')}>Employee</button>
                <button onClick={() => setCurrentView('delivery')}>Delivery</button>
            </nav>
            
            <main>
                {currentView === 'customer' && <CustomerView menu={menu} />}
                {currentView === 'employee' && <EmployeeView />}
                {currentView === 'delivery' && <DeliveryView />}
            </main>
        </div>
    );
}

export default App;