const CardPaymentForm = ({ total, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);

    setTimeout(() => {
      alert("Card payment successful!");
      onSuccess();
    }, 1200);
  };

  return (
    <div className="card-gateway">
      <h3>Pay with Card</h3>

      <div className="card-field">
        <label>Card Number</label>
        <input type="text" placeholder="1234 5678 9012 3456" />
      </div>

      <div className="card-row">
        <div className="card-field">
          <label>Expiry</label>
          <input type="text" placeholder="MM/YY" />
        </div>

        <div className="card-field">
          <label>CVC</label>
          <input type="text" placeholder="123" />
        </div>
      </div>

      <div className="card-field">
        <label>Cardholder Name</label>
        <input type="text" placeholder="John Doe" />
      </div>

      <button className="pay-btn" disabled={loading} onClick={handlePay}>
        {loading ? "Processing..." : `Pay ৳${total}`}
      </button>
    </div>
  );
};

export default CardPaymentForm;
