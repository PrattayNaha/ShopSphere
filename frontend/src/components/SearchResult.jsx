import { useParams } from "react-router-dom";
import api from "../services/api";

const SearchResults = () => {
  const { query } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await api.get(`/public/search/?q=${query}`);
      setProducts(res.data);
    };
    fetchResults();
  }, [query]);
}
