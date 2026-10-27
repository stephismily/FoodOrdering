import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import api from "./api.js";

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

function Notice({ children, type = "success" }) {
  if (!children) return null;
    return <div className={`notice ${type}`}>{children}</div>;
    }
    
function Header({ count }) {
  return (
      <header className="topbar">
            <div className="brand">Food Ordering System</div>
            
      <nav className="nav">
              <NavLink to="/" end>Home</NavLink>
                      <NavLink to="/cart">Cart</NavLink>
                              <NavLink to="/admin">Admin</NavLink>
                                    </nav>
                                    
      <Link to="/cart" className="cart-mini">Cart ({count})</Link>
          </header>
            );
            }
            
function FoodCard({ food, add }) {
  return (
      <div className="food-row">
            <div className="food-details">
                    <strong>{food.name}</strong>
                            <span>{food.category}</span>
                                    <small>{food.description || "Freshly prepared item."}</small>
                                          </div>
                                          
      <div className="food-price">{money(food.price)}</div>
      
      <button type="button" className="button primary" disabled={!food.available} onClick={() => add(food)}>
              {food.available ? "Add to cart" : "Unavailable"}
                    </button>
                        </div>
                          );
                          }
                          
function MenuPage({ foods, add, loading, error }) {
  const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    
  const categories = ["All", ...new Set(foods.map((food) => food.category).filter(Boolean))];
  
  const visibleFoods = useMemo(() => {
      return foods.filter((food) => {
            const matchesCategory = category === "All" || food.category === category;
                  const text = `${food.name} ${food.description || ""} ${food.category || ""}`.toLowerCase();
                        return matchesCategory && text.includes(search.toLowerCase());
                            });
                              }, [foods, category, search]);
                              
  return (
      <main className="page">
            <div className="panel">
                    <h2>Available Food Items</h2>
                    
        <div className="toolbar">
                  <input
                              type="text"
                                          value={search}
                                                      onChange={(e) => setSearch(e.target.value)}
                                                                  placeholder="Search food"
                                                                            />
                                                                            
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {categories.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                                ))}
                                                          </select>
                                                                  </div>
                                                                  
        <Notice type="error">{error}</Notice>
        
        {loading ? (
                  <p className="empty-text">Loading food items...</p>
                          ) : visibleFoods.length === 0 ? (
                                    <p className="empty-text">No food items found.</p>
                                            ) : (
                                                      <div className="list-wrap">
                                                                  {visibleFoods.map((food) => (
                                                                                <FoodCard key={food._id} food={food} add={add} />
                                                                                            ))}
                                                                                                      </div>
                                                                                                              )}
                                                                                                                    </div>
                                                                                                                        </main>
                                                                                                                          );
                                                                                                                          }
                                                                                                                          
function CartPage({ cart, changeQty, remove, placeOrder, busy }) {
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", notes: "" });
    const [message, setMessage] = useState("");
      const [error, setError] = useState("");
      
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const submit = async (e) => {
      e.preventDefault();
          setError("");
              setMessage("");
              
    try {
          const result = await placeOrder(form);
                setMessage(`Order placed successfully. Reference: ${result.id}. Total: ${money(result.total)}.`);
                      setForm({ customerName: "", phone: "", address: "", notes: "" });
                          } catch (err) {
                                setError(err.response?.data?.message || err.message || "Could not place order.");
                                    }
                                      };
                                      
  return (
      <main className="page">
            <div className="panel">
                    <h2>Your Cart</h2>
                    
        <Notice>{message}</Notice>
                <Notice type="error">{error}</Notice>
                
        {!cart.length ? (
                  <div className="empty-box">
                              <p>Your cart is empty.</p>
                                          <Link to="/" className="button secondary">
                                                        Go to menu
                                                                    </Link>
                                                                              </div>
                                                                                      ) : (
                                                                                                <div className="cart-layout">
                                                                                                            <div className="cart-items">
                                                                                                                          {cart.map((item) => (
                                                                                                                                          <div className="cart-item" key={item._id}>
                                                                                                                                                            <div className="cart-item-info">
                                                                                                                                                                                <strong>{item.name}</strong>
                                                                                                                                                                                                    <span>{item.category}</span>
                                                                                                                                                                                                                        <small>{money(item.price)}</small>
                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                          
                  <div className="qty-box">
                                      <button type="button" onClick={() => changeQty(item._id, -1)}>-</button>
                                                          <span>{item.quantity}</span>
                                                                              <button type="button" onClick={() => changeQty(item._id, 1)}>+</button>
                                                                                                  <button type="button" className="remove-btn" onClick={() => remove(item._id)}>
                                                                                                                        Remove
                                                                                                                                            </button>
                                                                                                                                                              </div>
                                                                                                                                                              
                  <div className="line-total">{money(item.price * item.quantity)}</div>
                                  </div>
                                                ))}
                                                            </div>
                                                            
            <div className="checkout-box">
                          <h3>Delivery details</h3>
                          
              <form onSubmit={submit} className="form-stack">
                              <label>
                                                Full name
                                                                  <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                                                                                  </label>
                                                                                  
                <label>
                                  Phone number
                                                    <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                                                    </label>
                                                                    
                <label>
                                  Delivery address
                                                    <textarea required rows="3" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                                                                    </label>
                                                                    
                <label>
                                  Notes
                                                    <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                                                                    </label>
                                                                    
                <div className="total-row">
                                  <span>Total</span>
                                                    <strong>{money(total)}</strong>
                                                                    </div>
                                                                    
                <button type="submit" className="button primary full" disabled={busy}>
                                  {busy ? "Placing order..." : "Place order"}
                                                  </button>
                                                                </form>
                                                                            </div>
                                                                                      </div>
                                                                                              )}
                                                                                                    </div>
                                                                                                        </main>
                                                                                                          );
                                                                                                          }
                                                                                                          
function AdminPage({ foods, reloadFoods, reloadOrders, orders, setOrders }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("foods");
  const [login, setLogin] = useState({ email: "admin@example.com", password: "" });
  const [form, setForm] = useState({ name: "", description: "", category: "Indian", price: "", image: "", available: true });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => setLoggedIn(true))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    const loadOrders = async () => {
      if (reloadOrders) {
        await reloadOrders();
      } else {
        const response = await api.get("/orders");
        setOrders(response.data);
      }
    };

    loadOrders();
    const timer = setInterval(loadOrders, 5000);
    return () => clearInterval(timer);
  }, [loggedIn, reloadOrders, setOrders]);

  const refresh = async () => {
    await reloadFoods();
    if (reloadOrders) {
      await reloadOrders();
      return;
    }
          const response = await api.get("/orders");
              setOrders(response.data);
                };
                
  const signIn = async (e) => {
      e.preventDefault();
          setError("");
          
    try {
          await api.post("/auth/login", login);
                setLoggedIn(true);
                      await refresh();
                          } catch (err) {
                                setError(err.response?.data?.message || "Login failed.");
                                    }
                                      };
                                      
  const logout = async () => {
      await api.post("/auth/logout");
          setLoggedIn(false);
              setOrders([]);
                  setNotice("Logged out successfully.");
                    };
                    
  const reset = () => {
      setForm({ name: "", description: "", category: "Indian", price: "", image: "", available: true });
          setEditing(null);
            };
            
  const saveFood = async (e) => {
      e.preventDefault();
          setError("");
              setNotice("");
                  setBusy(true);
                  
    try {
          const data = { ...form, price: Number(form.price) };
          
      if (editing) {
              await api.put(`/foods/${editing}`, data);
                    } else {
                            await api.post("/foods", data);
                                  }
                                  
      await reloadFoods();
            reset();
                  setNotice(editing ? "Food updated successfully." : "Food added successfully.");
                      } catch (err) {
                            setError(err.response?.data?.message || "Could not save food.");
                                } finally {
                                      setBusy(false);
                                          }
                                            };
                                            
  const editFood = (food) => {
      setEditing(food._id);
          setForm({
                name: food.name,
                      description: food.description || "",
                            category: food.category,
                                  price: String(food.price),
                                        image: food.image || "",
                                              available: food.available,
                                                  });
                                                      window.scrollTo({ top: 0, behavior: "auto" });
                                                        };
                                                        
  const deleteFood = async (id) => {
      if (!window.confirm("Delete this food item?")) return;
      
    try {
          await api.delete(`/foods/${id}`);
                await reloadFoods();
                      setNotice("Food item deleted.");
                          } catch (err) {
                                setError(err.response?.data?.message || "Delete failed.");
                                    }
                                      };
                                      
  const updateStatus = async (id, status) => {
      try {
            const result = await api.patch(`/orders/${id}/status`, { status });
                  setOrders((old) => old.map((order) => (order._id === id ? result.data : order)));
                        setNotice("Order status updated.");
                            } catch (err) {
                                  setError(err.response?.data?.message || "Status update failed.");
                                      }
                                        };
                                        
  const deleteOrder = async (id) => {
      if (!window.confirm("Delete this order?")) return;
      
    try {
          await api.delete(`/orders/${id}`);
                setOrders((old) => old.filter((order) => order._id !== id));
                      setNotice("Order deleted.");
                          } catch (err) {
                                setError(err.response?.data?.message || "Delete failed.");
                                    }
                                      };
                                      
  const filteredFoods = foods.filter((food) => `${food.name} ${food.category}`.toLowerCase().includes(query.toLowerCase()));
    const filteredOrders = orders.filter((order) => `${order.customerName} ${order._id} ${order.status}`.toLowerCase().includes(query.toLowerCase()));
    
  if (checking) {
      return <main className="page"><div className="panel">Checking admin session...</div></main>;
        }
        
  if (!loggedIn) {
      return (
            <main className="page">
                    <div className="login-box panel">
                              <h2>Admin Login</h2>
                              
          <Notice type="error">{error}</Notice>
          
          <form onSubmit={signIn} className="form-stack">
                      <label>
                                    Email
                                                  <input type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
                                                              </label>
                                                              
            <label>
                          Password
                                        <input type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
                                                    </label>
                                                    
            <button type="submit" className="button primary full">Login</button>
                      </form>
                      
          <Link to="/" className="back-link">Back to menu</Link>
                  </div>
                        </main>
                            );
                              }
                              
  return (
      <main className="page">
            <div className="panel">
                    <div className="admin-top">
                              <h2>Admin Dashboard</h2>
                                        <button type="button" className="button secondary" onClick={logout}>Logout</button>
                                                </div>
                                                
        <Notice>{notice}</Notice>
                <Notice type="error">{error}</Notice>
                
        <div className="summary-row">
                  <div className="summary-box">
                              <span>Menu items</span>
                                          <strong>{foods.length}</strong>
                                                    </div>
                                                              <div className="summary-box">
                                                                          <span>Total orders</span>
                                                                                      <strong>{orders.length}</strong>
                                                                                                </div>
                                                                                                          <div className="summary-box">
                                                                                                                      <span>Pending</span>
                                                                                                                                  <strong>{orders.filter((order) => order.status === "Pending").length}</strong>
                                                                                                                                            </div>
                                                                                                                                                    </div>
                                                                                                                                                    
        <div className="tab-row">
                  <button type="button" className={tab === "foods" ? "tab active" : "tab"} onClick={() => { setTab("foods"); setQuery(""); }}>
                              Food Management
                                        </button>
                                                  <button type="button" className={tab === "orders" ? "tab active" : "tab"} onClick={() => { setTab("orders"); setQuery(""); }}>
                                                              Customer Orders
                                                                        </button>
                                                                                </div>
                                                                                
        {tab === "foods" && (
                  <div className="admin-grid">
                              <form className="form-box" onSubmit={saveFood}>
                                            <h3>{editing ? "Edit food item" : "Add food item"}</h3>
                                            
              <label>
                              Food name
                                              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                                            </label>
                                                            
              <label>
                              Category
                                              <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                                                            </label>
                                                            
              <label>
                              Price (₹)
                                              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                                            </label>
                                                            
              <label>

                                              <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                                            </label>
                                                            
              <label className="checkbox-row">
                              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
                                              Available
                                                            </label>
                                                            
              <div className="button-row">
                              <button type="submit" className="button primary" disabled={busy}>
                                                {busy ? "Saving..." : editing ? "Update food" : "Add food"}
                                                                </button>
                                                                                {editing && (
                                                                                                  <button type="button" className="button secondary" onClick={reset}>
                                                                                                                      Cancel
                                                                                                                                        </button>
                                                                                                                                                        )}
                                                                                                                                                                      </div>
                                                                                                                                                                                  </form>
                                                                                                                                                                                  
            <div className="table-box">
                          <div className="table-header">
                                          <h3>Food List</h3>
                                                          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food" />
                                                                        </div>
                                                                        
              <table>
                              <thead>
                                                <tr>
                                                                    <th>Name</th>
                                                                                        <th>Category</th>
                                                                                                            <th>Price</th>
                                                                                                                                <th>Available</th>
                                                                                                                                                    <th>Actions</th>
                                                                                                                                                                      </tr>
                                                                                                                                                                                      </thead>
                                                                                                                                                                                                      <tbody>
                                                                                                                                                                                                                        {filteredFoods.length ? (
                                                                                                                                                                                                                                            filteredFoods.map((food) => (
                                                                                                                                                                                                                                                                  <tr key={food._id}>
                                                                                                                                                                                                                                                                                          <td>{food.name}</td>
                                                                                                                                                                                                                                                                                                                  <td>{food.category}</td>
                                                                                                                                                                                                                                                                                                                                          <td>{money(food.price)}</td>
                                                                                                                                                                                                                                                                                                                                                                  <td>{food.available ? "Yes" : "No"}</td>
                                                                                                                                                                                                                                                                                                                                                                                          <td>
                                                                                                                                                                                                                                                                                                                                                                                                                    <div className="small-actions">
                                                                                                                                                                                                                                                                                                                                                                                                                                                <button type="button" className="button small" onClick={() => editFood(food)}>Edit</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <button type="button" className="button small danger" onClick={() => deleteFood(food._id)}>Delete</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ) : (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <td colSpan="5">No food items found.</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </tbody>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </table>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
        {tab === "orders" && (
                  <div className="table-box orders-box">
                              <div className="table-header">
                                            <h3>Customer Orders</h3>
                                                          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders" />
                                                                      </div>
                                                                      
            <table>
                          <thead>
                                          <tr>
                                                            <th>Customer</th>
                                                                              <th>Items</th>
                                                                                                <th>Total</th>
                                                                                                                  <th>Status</th>
                                                                                                                                    <th>Action</th>
                                                                                                                                                    </tr>
                                                                                                                                                                  </thead>
                                                                                                                                                                                <tbody>
                                                                                                                                                                                                {filteredOrders.length ? (
                                                                                                                                                                                                                  filteredOrders.map((order) => (
                                                                                                                                                                                                                                      <tr key={order._id}>
                                                                                                                                                                                                                                                            <td>
                                                                                                                                                                                                                                                                                    <strong>{order.customerName}</strong>
                                                                                                                                                                                                                                                                                                            <small>{order.phone}</small>
                                                                                                                                                                                                                                                                                                                                  </td>
                                                                                                                                                                                                                                                                                                                                                        <td>{order.items?.length || 0}</td>
                                                                                                                                                                                                                                                                                                                                                                              <td>{money(order.total)}</td>
                                                                                                                                                                                                                                                                                                                                                                                                    <td>
                                                                                                                                                                                                                                                                                                                                                                                                                            <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                      <option value="Pending">Pending</option>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <option value="Preparing">Preparing</option>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <option value="Out for Delivery">Out for Delivery</option>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <option value="Delivered">Delivered</option>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </select>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <button type="button" className="button small danger" onClick={() => deleteOrder(order._id)}>Delete</button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ) : (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              <tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <td colSpan="5">No orders found.</td>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </tr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </tbody>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              </table>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                )}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          </main>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
export default function App() {
  const [foods, setFoods] = useState([]);
    const [cart, setCart] = useState([]);
      const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
          const [orders, setOrders] = useState([]);
            const [busy, setBusy] = useState(false);
            
  const reloadFoods = async () => {
    try {
      const response = await api.get("/foods");
      setFoods(response.data || []);
      setError("");
    } catch (err) {
      setFoods([]);
      setError(err.response?.data?.message || "Could not load food menu.");
    }
  };

  const reloadOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data || []);
    } catch (err) {
      setOrders([]);
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError(err.response?.data?.message || "Could not load orders.");
      }
    }
  };

  useEffect(() => {
    reloadFoods().finally(() => setLoading(false));
  }, []);

  const add = (food) => {
      setCart((previous) => {
            const found = previous.find((item) => item._id === food._id);
                  if (found) {
                          return previous.map((item) =>
                                    item._id === food._id ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item
                                            );
                                                  }
                                                        return [...previous, { ...food, quantity: 1 }];
                                                            });
                                                              };
                                                              
  const changeQty = (id, delta) => {
      setCart((previous) =>
            previous
                    .map((item) => (item._id === id ? { ...item, quantity: item.quantity + delta } : item))
                            .filter((item) => item.quantity > 0 && item.quantity <= 99)
                                );
                                  };
                                  
  const remove = (id) => {
      setCart((previous) => previous.filter((item) => item._id !== id));
        };
        
  const placeOrder = async (form) => {
      setBusy(true);
          try {
                const response = await api.post("/orders", {
                        ...form,
                                items: cart.map((item) => ({ foodId: item._id, quantity: item.quantity })),
                                      });
                                            setCart([]);
                                                  return response.data;
                                                      } finally {
                                                            setBusy(false);
                                                                }
                                                                  };
                                                                  
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
      <div className="app-shell">
            <Header count={count} />
            
      <Routes>
              <Route path="/" element={<MenuPage foods={foods} add={add} loading={loading} error={error} />} />
                      <Route path="/cart" element={<CartPage cart={cart} changeQty={changeQty} remove={remove} placeOrder={placeOrder} busy={busy} />} />
                              <Route
          path="/admin"
          element={<AdminPage foods={foods} reloadFoods={reloadFoods} reloadOrders={reloadOrders} orders={orders} setOrders={setOrders} />}
        />
                                      <Route path="*" element={<main className="page"><div className="panel"><h2>Page not found</h2><Link to="/" className="button primary">Back to menu</Link></div></main>} />
                                            </Routes>
                                                </div>
                                                  );
                                                  }
                                                  