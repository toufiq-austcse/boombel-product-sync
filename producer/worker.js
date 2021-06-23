const { parentPort, workerData } = require('worker_threads');
let axios = require('axios');
let fs = require('fs');
let token = fs.readFileSync('token.txt', { encoding: 'utf-8' });

async function getProducts(page) {
  try {
    let res = await axios.default.get(`https://portal.internet-bikes.com/api/twm/products?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fs.writeFileSync('page.txt', page.toString(), { encoding: 'utf-8' });
    return res.data;
  } catch (error) {
    console.log('error in calling ', page);
    console.log(error);
  }
}
function delay(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

async function getApiToken() {
  try {
    let res = await axios.post('https://portal.internet-bikes.com/api/twm/auth/authenticate', {
      email: 'whitebeam.europe@gmail.com',
      password: 'Leuven3000',
    });
    let { token } = res.data;
    fs.writeFileSync('token.txt', token, { encoding: 'utf-8' });
  } catch (error) {
    console.log('Error in getting API Token..please try 6 minutes later');
    throw new Error(error);
  }
}
(async () => {
  let { start, end } = workerData;
  for (let page = start; page <= end; page++) {
    try {
      console.log('calling  page ', page);
      let { data, meta } = await getProducts(page);
      if (data) parentPort.postMessage(data);
      await delay(4000);
    } catch (error) {
      if (error.response?.status !== 401) {
        throw new Error(error);
      }
      await getApiToken();
      console.log('calling  page ', page);
      let { data, meta } = await getProducts(page);
      if (data) parentPort.postMessage(data);
      await delay(4000);
    }
  }
})();
