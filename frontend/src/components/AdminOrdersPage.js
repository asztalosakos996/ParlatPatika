import React, { useEffect, useState } from 'react';
import './AdminOrdersPage.css'; // Külön CSS fájl a stílusokhoz

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Szűrők állapotai
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [selectedShippingMethod, setSelectedShippingMethod] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/orders');
                if (!response.ok) {
                    throw new Error('Hiba történt a rendelések lekérésekor.');
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

    // Szűrt rendelések
    const filteredOrders = orders.filter((order) => {
        const matchesPayment =
            selectedPaymentMethod === '' || order.paymentMethod === selectedPaymentMethod;
        const matchesShipping =
            selectedShippingMethod === '' || order.shippingMethod === selectedShippingMethod;
        return matchesPayment && matchesShipping;
    });

    if (loading) {
        return <p>Rendelések betöltése...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="admin-orders-page">
            <h1>Rendelések kezelése</h1>

            {/* Szűrők */}
            <div className="filters">
                <label>
                    Fizetési mód:
                    <select
                        value={selectedPaymentMethod}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    >
                        <option value="">Összes</option>
                        <option value="Bankkártya">Bankkártya</option>
                        <option value="Utánvét">Utánvét</option>
                        <option value="banki átutalás">Banki átutalás</option>
                        {/* További lehetőségek */}
                    </select>
                </label>

                <label>
                    Szállítási mód:
                    <select
                        value={selectedShippingMethod}
                        onChange={(e) => setSelectedShippingMethod(e.target.value)}
                    >
                        <option value="">Összes</option>
                        <option value="Futárszolgálat">Futárszolgálat</option>
                        <option value="személyes átvétel">Személyes átvétel</option>
                        <option value="csomagautomata">Csomagautomata</option>
                        {/* További lehetőségek */}
                    </select>
                </label>
            </div>

            {/* Táblázat */}
            <table>
                <thead>
                    <tr>
                        <th>Rendelés ID</th>
                        <th>Vásárló neve</th>
                        <th>Dátum</th>
                        <th>Összeg</th>
                        <th>Fizetési mód</th>
                        <th>Szállítási mód</th>
                        <th>Állapot</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order) => (
                        <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.contactInfo?.name || 'Nincs megadva név'}</td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Nincs adat'}</td>
                        <td>{order.totalAmount ? `${order.totalAmount.toLocaleString()} Ft` : 'Nincs adat'}</td>
                        <td>{order.paymentMethod || 'Nincs adat'}</td>
                        <td>
                            {order.shippingMethod?.method || 'Nincs adat'}
                            {/* Ha szeretnéd megjeleníteni a szállítási részleteket: */}
                        </td>
                        <td>{order.status || 'Nincs adat'}</td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
};

export default AdminOrdersPage;
