import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AdminDashboard = () => {
    const [orderStats, setOrderStats] = useState(Array(12).fill(0));
    const [openGroup, setOpenGroup] = useState(null);

    useEffect(() => {
        const fetchOrderStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/orders/stats');
                const data = await response.json();
                setOrderStats(data);
            } catch (error) {
                console.error('Hiba a rendelési statisztikák lekérésekor:', error);
            }
        };

        fetchOrderStats();
    }, []);

    const data = {
        labels: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
        datasets: [
            {
                label: 'Rendelések száma',
                data: orderStats,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const toggleGroup = (group) => {
        setOpenGroup(openGroup === group ? null : group);
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Felület</h1>
            <div className="dashboard-chart">
                <Bar data={data} options={options} />
                <p>Rendelési Statisztikák (Rendelésszám, összérték, stb.)</p>
            </div>

            <div className="admin-functions">
                {/* Termékek és Kategóriák */}
                <div>
                    <h2 onClick={() => toggleGroup('productsCategories')} className="group-header">
                        Termékek és Kategóriák {openGroup === 'productsCategories' ? '▲' : '▼'}
                    </h2>
                    {openGroup === 'productsCategories' && (
                        <div className="function-group">
                            <Link to="/admin/new-product" className="function-card">
                                <div>
                                    <p>Új Termék Létrehozása</p>
                                </div>
                            </Link>
                            <Link to="/admin/new-category" className="function-card">
                                <div>
                                    <p>Új Kategória Létrehozása</p>
                                </div>
                            </Link>
                            <Link to="/admin/manage-categories" className="function-card">
                                <div>
                                    <p>Kategóriák Kezelése</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Rendelések */}
                <div>
                    <h2 onClick={() => toggleGroup('orders')} className="group-header">
                        Rendelések {openGroup === 'orders' ? '▲' : '▼'}
                    </h2>
                    {openGroup === 'orders' && (
                        <div className="function-group">
                            <Link to="/admin/orders" className="function-card">
                                <div>
                                    <p>Rendelések Kezelése</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Kuponok */}
                <div>
                    <h2 onClick={() => toggleGroup('coupons')} className="group-header">
                        Kuponok {openGroup === 'coupons' ? '▲' : '▼'}
                    </h2>
                    {openGroup === 'coupons' && (
                        <div className="function-group">
                            <Link to="/admin/new-coupon" className="function-card">
                                <div>
                                    <p>Új kupon létrehozása</p>
                                </div>
                            </Link>
                            <Link to="/admin/manage-coupons" className="function-card">
                                <div>
                                    <p>Kuponok kezelése</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Blogok */}
                <div>
                    <h2 onClick={() => toggleGroup('blogs')} className="group-header">
                        Blogok {openGroup === 'blogs' ? '▲' : '▼'}
                    </h2>
                    {openGroup === 'blogs' && (
                        <div className="function-group">
                            <Link to="/admin/new-blog" className="function-card">
                                <div>
                                    <p>Új Blog Poszt Létrehozása</p>
                                </div>
                            </Link>
                            <Link to="/admin/manage-blogs" className="function-card">
                                <div>
                                    <p>Blog Posztok Kezelése</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
