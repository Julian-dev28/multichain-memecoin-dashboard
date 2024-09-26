import axios from 'axios';
import CryptoJS from 'crypto-js';

const BASE_URL = 'https://www.okx.com';

const sign = (timestamp, method, requestPath, body, secretKey) => {
  const message = timestamp + method + requestPath + (body ? JSON.stringify(body) : '');
  return CryptoJS.HmacSHA256(message, secretKey).toString(CryptoJS.enc.Base64);
};

const apiRequest = async (method, endpoint, params = null) => {
  const timestamp = new Date().toISOString();
  const requestPath = `/api/v5${endpoint}`; // Remove '/wallet' from the path

  // Construct the full URL with query parameters for GET requests
  const url = new URL(`${BASE_URL}${requestPath}`);
  if (method === 'GET' && params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  const headers = {
    'OK-ACCESS-ID': process.env.REACT_APP_OKX_PROJECT,
    'OK-ACCESS-KEY': process.env.REACT_APP_OKX_API_KEY,
    'OK-ACCESS-SIGN': '',
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': process.env.REACT_APP_OKX_PASSPHRASE,
  };

  // Add the signature to the headers
  headers['OK-ACCESS-SIGN'] = sign(
    timestamp,
    method,
    `${requestPath}${method === 'GET' ? `?${url.searchParams.toString()}` : ''}`,
    method === 'GET' ? '' : JSON.stringify(params),
    process.env.REACT_APP_OKX_SECRET_KEY
  );

  try {
    const response = await axios({
      method,
      url: url.toString(),
      headers,
      ...(method !== 'GET' && { data: params }),
    });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getHistoricalPrices = (params) => {
  const queryParams = {
    chainId: params.chainIndex,
    contract: params.tokenAddress,
    limit: params.limit,
    after: params.begin,
    before: params.end,
    bar: params.period
  };

  // Remove undefined or null parameters
  Object.keys(queryParams).forEach(key => 
    queryParams[key] == null && delete queryParams[key]
  );

  return apiRequest('GET', '/market/history-candles', queryParams);
};