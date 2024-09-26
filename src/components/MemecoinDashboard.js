import React, { useState, useEffect } from 'react';
import { getHistoricalPrices } from '../api/okx';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const memecoins = [
  { name: 'PEPE', address: '0x6982508145454ce325ddbe47a25d4ec3d2311933' },
  { name: 'Shiba Inu', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce' },
  { name: 'Dogecoin', address: '0x35a532d376ffd9a705d0bb319532837337a398e7' },
  { name: 'FLOKI', address: '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e' },
  { name: 'Dogelon Mars', address: '0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3' },
];

function MemecoinDashboard() {
  const [priceData, setPriceData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const newPriceData = {};
      const end = Date.now();
      const begin = end - 24 * 60 * 60 * 1000; // 24 hours ago
      for (const coin of memecoins) {
        try {
          const data = await getHistoricalPrices({
            chainIndex: '1', // Assuming EVM chain
            tokenAddress: coin.address,
            begin: begin.toString(),
            end: end.toString(),
            period: '1H',
            limit: '24' // 24 data points for 24 hours
          });
          newPriceData[coin.name] = data.data;
        } catch (error) {
          console.error(`Error fetching data for ${coin.name}:`, error);
        }
      }
      setPriceData(newPriceData);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getChartData = (coinName) => {
    const prices = priceData[coinName] || [];
    return {
      labels: prices.map(p => new Date(parseInt(p.time)).toLocaleString()),
      datasets: [
        {
          label: coinName,
          data: prices.map(p => parseFloat(p.price)),
          borderColor: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`,
          tension: 0.1
        }
      ]
    };
  };

  return (
    <div>
      <h1>Memecoin Dashboard</h1>
      {memecoins.map(coin => (
        <div key={coin.name}>
          <h2>{coin.name}</h2>
          {priceData[coin.name] ? (
            <>
              <p>Current Price: ${parseFloat(priceData[coin.name][0].price).toFixed(8)}</p>
              <Line data={getChartData(coin.name)} />
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default MemecoinDashboard;