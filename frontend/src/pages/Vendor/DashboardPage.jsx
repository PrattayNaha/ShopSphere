// src/pages/vendor/DashboardPage.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/vendorDashboard2.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const [totals, setTotals] = useState({
    total_revenue: 0,
    total_order: 0,
    total_items_sold: 0,
  });

  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [canceledOrders, setCanceledOrders] = useState(0);
  const [stockData, setStockData] = useState({ totalStock:0, lowStock:[], outOfStock: []});

  const [productStats, setProductStats] =  useState({
    highest : null,
    lowest : null,
    top10: [],
  })
  const [subCategoryStats, setSubCategoryStats] = useState([]);
  const [customerStats, setCustomerStats] = useState({
    total_customers: 0,
    new_customers: 0,
    repeat_percentage: 0,
    top_customers: [],
  })

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const [revRes, orderRes, productRes, customerRes] = await Promise.all([
        api.get("/vendor/revenue/"),
        api.get("/vendor/orders/"),
        api.get("/vendor/products/"),
        api.get("/vendor/customer/"),
      ]);

      setTotals(revRes.data);
      setOrders(orderRes.data);
      setCustomerStats(customerRes.data);

      processOrders(orderRes.data);
      processProducts(productRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    console.log("ORDER COUNT FROM API:", orderRes.data.length);
    console.log("TOTAL ORDERS IN STATS:", totals.total_order);
  };

  const processProducts = (products) => {
    let totalStock = 0;
    const lowStock = [];
    const outOfStock = [];
    const subMap = {};

    products.forEach((p) => {
      totalStock += p.stock;

      if (p.stock === 0) {
        outOfStock.push(p);
      }else if(p.stock < 5){
        lowStock.push(p);
      }

      const sub = p.subcategory_name || "Unknown";
      subMap[sub] = (subMap[sub] || 0) +1;
      
    });

    setStockData({
      totalStock,
      lowStock: lowStock.slice(0, 5),
      outOfStock: outOfStock.slice(0, 5),
    });
    // SUBCATEGORY STATS
    const subArr = Object.entries(subMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setSubCategoryStats(subArr);
  };

  console.log("ORDERS RAW:", orders);
  console.log("LENGTH:", orders.length);


  // ================= PROCESS =================
  const processOrders = (items) => {
    const productMap = {};
    let canceled = new Set();

    const last7DaysMap = {};

    items.forEach((item) => {
      // TOP PRODUCTS
      const name = item.product_name;
      productMap[name] = (productMap[name] || 0) + item.quantity;

      // CANCELED ORDERS
      if (item.order_status === "CANCELLED") {
        canceled.add(item.order_id);
      }

      // LAST 7 DAYS SALES
      const date = new Date(item.order_date);
      const key = date.toLocaleDateString();

      const today = new Date();
      const diff = (today - date) / (1000 * 60 * 60 * 24);

      if (diff <= 7) {
        last7DaysMap[key] =
          (last7DaysMap[key] || 0) +
          item.quantity * parseFloat(item.grand_total);
      }
    });

    setCanceledOrders(canceled.size);

    // TOP PRODUCTS
    const sorted = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, qty]) => ({ name, qty }));

    setTopProducts(sorted.slice(0, 5));

    // LAST 7 DAYS ARRAY
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString();
    });

    setMonthlySales(days.map((d) => last7DaysMap[d] || 0));

    // PRODUCT STATS
    const productArray = Object.entries(productMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);

    setProductStats({
      highest: productArray[0] || null,
      lowest: productArray[productArray.length - 1] || null,
      top10: productArray.slice(0, 10),
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= CHART =================
  const salesChart = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [
      {
        label: "Sales",
        data: monthlySales,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
      },
    ],
  };

  // ================= UI =================
  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">

      {/* NAV TABS */}
      <div className="tabs">
        {["overview", "sales", "products", "customers", "inventory", "analytics"].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= OVERVIEW ================= */}
      {activeTab === "overview" && (
        <>
          <div className="cards">
            <Card title="Revenue" value={`$${totals.total_revenue}`} />
            <Card title="Orders" value={orders.length} />
            <Card title="Items Sold" value={totals.total_items_sold} />
            <Card title="Canceled Orders" value={canceledOrders} />
            <Card title="Available Stock" value={stockData.totalStock} />
          </div>

          <div className="grid">
            <div className="chart">
              <Line data={salesChart} />
            </div>

            <div className="panel">
              <h4>Top Products</h4>
              {topProducts.map((p, i) => (
                <div key={i} className="list-item">
                  {p.name} <span>{p.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LOW STOCK ALERT */}
          <div className="panel">
            <h4>⚠ Low Stock Alerts</h4>
            {stockData.lowStock.length === 0 ? (
              <p>No low stock items</p>
            ) : (
              stockData.lowStock.map((p) => (
                <div key={p.id} className="list-item warning">
                  {p.name} <span>{p.stock} left</span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ================= SALES ================= */}
      {activeTab === "sales" && (
        <div className="grid">
          <div className="chart">
            <Bar data={salesChart} />
          </div>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      {activeTab === "products" && (
        <div className="products-grid">

          {/* TOP STATS */}
          <div className="cards">
            <Card
              title="Highest Sold"
              value={productStats.highest?.name || "N/A"}
            />
            <Card
              title="Lowest Sold"
              value={productStats.lowest?.name || "N/A"}
            />
          </div>

          {/* TOP 10 TABLE */}
          <div className="panel">
            <h3>Top 10 Products</h3>

            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sold</th>
                </tr>
              </thead>
              <tbody>
                {productStats.top10.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUBCATEGORY STATS */}
          <div className="panel">
            <h3>Subcategory Distribution</h3>

            {subCategoryStats.map((s, i) => (
              <div key={i} className="list-item">
                {s.name} <span>{s.count} products</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= CUSTOMERS ================= */}
      {activeTab === "customers" && (
        <div className="products-grid">

          {/* TOP CARDS */}
          <div className="cards">
            <Card title="Total Customers" value={customerStats.total_customers} />
            <Card title="New Customers (7d)" value={customerStats.new_customers} />
            <Card title="Repeat Customers %" value={`${customerStats.repeat_percentage}%`} />
          </div>

          {/* TOP CUSTOMERS */}
          <div className="panel">
            <h3>Top Customers</h3>

            {customerStats.top_customers.length === 0 ? (
              <p>No data</p>
            ) : (
              customerStats.top_customers.map((c, i) => (
                <div key={i} className="list-item">
                  {c.name} 
                  <span>${c.total_spent.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

        </div>
      )}


      {/* ================= INVENTORY ================= */}
      {activeTab === "inventory" && (
        <div className="inventory-grid">

          {/* SUMMARY CARDS */}
          <div className="cards">
            <Card title="Total Stock" value={stockData.totalStock} />
            <Card title="Low Stock Items" value={stockData.lowStock.length} />
            <Card title="Out of Stock" value={stockData.outOfStock.length} />
          </div>

          {/* LOW STOCK LIST */}
          <div className="panel">
            <h3>⚠ Low Stock</h3>
            {stockData.lowStock.length === 0 ? (
              <p>No low stock items</p>
            ) : (
              stockData.lowStock.map((p) => (
                <div key={p.id} className="list-item warning">
                  {p.name} <span>{p.stock} left</span>
                </div>
              ))
            )}
          </div>

          {/* OUT OF STOCK LIST */}
          <div className="panel">
            <h3>❌ Out of Stock</h3>
            {stockData.outOfStock.length === 0 ? (
              <p>All products available</p>
            ) : (
              stockData.outOfStock.map((p) => (
                <div key={p.id} className="list-item danger">
                  {p.name} <span>0 left</span>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ================= ANALYTICS ================= */}
      {activeTab === "analytics" && (
        <div className="panel">Advanced analytics coming soon</div>
      )}
    </div>
  );
};

// REUSABLE CARD
const Card = ({ title, value }) => (
  <div className="card">
    <p>{title}</p>
    <h2>{value}</h2>
  </div>
);

export default DashboardPage;