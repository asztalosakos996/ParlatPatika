import React, { useEffect, useState } from 'react';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/orders/my-orders', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Token hozzáadása
                    },
                });

                if (!response.ok) {
                    throw new Error('Hiba történt a rendelések lekérése során.');
                }

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <p>Rendelések betöltése...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="my-orders">
            <h2>Korábbi megrendeléseim</h2>
            {orders.length > 0 ? (
                <ul>
                    {orders.map((order) => (
                        <li key={order._id} className="order-item">
                            <p><strong>Dátum:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                            <h4>Termékek:</h4>
                            <ul>
                                {order.items.map((item) => (
                                    <li key={item.product}>
                                        {item.quantity} x {item.product.name || 'Termék'} - {item.price} Ft/db
                                    </li>
                                ))}
                            </ul>
                            <p><strong>Végösszeg:</strong> {order.totalAmount} Ft</p>
                            <p><strong>Állapot:</strong> {order.status}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nincsenek korábbi rendeléseid.</p>
            )}
        </div>
    );
};

export default MyOrders;
