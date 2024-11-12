import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InstallmentModal from './InstallmentModal';

const ProductList = ({ userSession }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stxToUsd, setStxToUsd] = useState(0);

  useEffect(() => {
    if (userSession) {
      console.log("ProductList");
      console.log(userSession); // This will log the userSession if needed
    }
  }, [userSession]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const url = 'https://dummyjson.com/products';
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    fetchStxPrice();
  }, []);

  const fetchStxPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd');
      const data = await response.json();
      console.log('STX price:', data.blockstack.usd);
      setStxToUsd(data.blockstack.usd); // Set state for STX price
    } catch (error) {
      console.error('Error fetching STX price:', error);
    }
  };

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="cardswrapper">
      {products.map((p) => (
        <div key={p.id} className="cards">
          <CardMedia
            sx={{ height: 140 }}
            image={p.images[0] || 'https://via.placeholder.com/140'}
            title={p.brand}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {p.title}
            </Typography>
            <Typography variant="body2">
              {p.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button className="allbuttons" size="large" onClick={() => handleBuyClick(p)}>Buy Now for ${p.price}</Button>
          </CardActions>
        </div>
      ))}
      <InstallmentModal 
        open={modalOpen} 
        handleClose={() => setModalOpen(false)} 
        product={selectedProduct}
        stxToUsd={stxToUsd}
        userSession={userSession}
      />
    </div>
  );
};

export default ProductList;