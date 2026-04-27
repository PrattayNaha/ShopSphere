import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [deliveryFilter, setDeliveryFilter] = useState("ALL")


  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/vendor/orders/");
      console.log("Fetched Orders:", response.data);
      setOrders(response.data);
      setLoading(false);
      console.log("Fetched Orders:", response.data);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
      setError("Failed to load orders.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const downloadMemo = (orderId) => {
    navigate(`/vendor/memo/${orderId}`)
  };

  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      await api.delete(`/vendor/orders/${orderId}/delete/`);
      setOrders((prev) =>
        prev.filter((item) => item.order_id !== orderId)
      );
    } catch (err) {
      console.error("Delete Order Error:", err);
      alert("Failed to delete order.");
    }
  };

  if (loading) return <div className="content">Loading...</div>;
  if (error) return <div className="content">{error}</div>;

  

  const filteredOrders = orders
    .filter((item) => {
      const search = searchTerm.toLowerCase();

      return (
        item.order_id.toString().includes(search) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(search)) ||
        (item.phone && item.phone.includes(search))
      );
    })
    .filter((item) => {
      if (statusFilter === "ALL") return true;
      return item.order_status === statusFilter;
    })
    .filter((item) => {
      if (deliveryFilter === "ALL") return true;
      return item.delivery_status === deliveryFilter;
    })
    .sort((a, b) => new Date(b.order_date) - new Date(a.order_date));


  return (
    <div className="content">
      <h3>Orders</h3>
      <div style={{display:"flex", gap:"10px", marginBottom:"15px"}}>

        <input
          type="text"
          placeholder="Search Order ID / Customer / Phone"
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
          style={{
            padding:"8px",
            border:"1px solid #ccc",
            borderRadius:"6px",
            width:"250px"
          }}
        />

        <h4 style={{margin:"0"}}>Payment Status:</h4>
        <select
          value={statusFilter}
          onChange={(e)=>setStatusFilter(e.target.value)}
          style={{
            padding:"8px",
            border:"1px solid #ccc",
            borderRadius:"6px"
          }}
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

      </div>

      <h4 style={{margin:"0", marginBottom:"5px"}}>Delivery Status:</h4>
      <select
        value={deliveryFilter}
        onChange={(e) => setDeliveryFilter(e.target.value)}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px"
        }}
      >
        <option value="ALL">All Delivery</option>
        <option value="PLACED">Placed</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="RETURNED">Returned</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Amount</th>
            <th>Payment Status</th>
            <th>Delivery Status</th>
            <th>Order Date</th>
            <th>Memo</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders
          .map((item) => (
            <tr key={item.order_id} onClick={() => navigate(`/vendor/orders/${item.order_id}`)}
              style={{ cursor: "pointer" }}>
              <td>{item.order_id}</td>
              <td>{item.product_name}</td>
              <td>{item.quantity}</td>
              <td>${item.grand_total}</td>
              <td>{item.order_status}</td>
              <td>{item.delivery_status}</td>
              <td>{new Date(item.order_date).toLocaleDateString()}</td>
              <td>
                <button
                  className="primary-btn23"
                  onClick={(e) => {e.stopPropagation(); downloadMemo(item.order_id)}}
                >
                  Download Memo
                </button>
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={ (e) =>{e.stopPropagation(); handleDelete(item.order_id)}}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
