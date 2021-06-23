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

(async () => {
  let { start, end } = workerData;
  for (let page = start; page <= end; page++) {
    console.log('calling  page ', page);
    let { data, meta } = await getProducts(page);
    if (data) parentPort.postMessage(data);
    await delay(2000);
  }
})();
