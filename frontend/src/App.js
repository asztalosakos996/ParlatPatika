import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Categories from './components/Categories';
import PopularProducts from './components/PopularProducts';
import Newsletter from './components/Newsletter';
import BlogPosts from './components/BlogPosts';
import Footer from './components/Footer';
import CategoryPage from './components/CategoryPage';
import ProductPage from './components/ProductPage';
import Cart from './components/Cart';
import CheckoutProcess from './components/CheckoutProcess';
import AdminDashboard from './components/AdminDashboard';
import AddProduct from './components/AddProduct';
import AddCategory from './components/AddCategory';
import RegisterPage from './components/RegisterPage';
import ChatWidget from './components/ChatWidget';
import ManageCategories from './components/ManageCategories';
import EditCategory from './components/EditCategory';
import EditProductPage from './components/EditProductPage';
import NewCoupon from './components/NewCoupon';
import ManageCoupons from './components/ManageCoupons';
import EditCouponPage from './components/EditCouponPage';
import AdminOrdersPage from './components/AdminOrdersPage';
import orderSuccess from './components/orderSuccess';
import NewBlog from './components/NewBlog';
import ManageBlog from './components/ManageBlog';
import EditBlog from './components/EditBlog';
import UserDetails from './components/UserDetails';
import './App.css';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <div className="routes-container">
              <Routes>
                <Route path="/" element={
                  <>
                    <Banner />
                    <Categories />
                    <PopularProducts />
                    <Newsletter />
                    <BlogPosts />
                  </>
                } />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/checkout" element={<CheckoutProcess />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/new-product" element={<AddProduct />} />
                <Route path="/edit-product/:productId" element={<EditProductPage />} />
                <Route path="/admin/new-category" element={<AddCategory />} />
                <Route path="/admin/manage-categories" element={<ManageCategories />} />
                <Route path="/admin/edit-category/:id" element={<EditCategory />} />
                <Route path="/admin/new-coupon" element={<NewCoupon />} />
                <Route path="/admin/manage-coupons" element={<ManageCoupons />} />
                <Route path="/admin/edit-coupon/:couponId" element={<EditCouponPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/order-success" element={<orderSuccess />} />
                <Route path="/admin/new-blog" element={<NewBlog />} />
                <Route path="/admin/manage-blogs" element={<ManageBlog />} />
                <Route path="/admin/edit-blog/:id" element={<EditBlog />} />
                <Route path="/details" element={<UserDetails />} />
              



              </Routes>
            </div>
            <ChatWidget />
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
