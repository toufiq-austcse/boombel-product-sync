const { parentPort, workerData } = require("worker_threads");
let axios = require("axios");

async function getProducts(page) {
  try {
    let res = await axios.default.get(`https://portal.internet-bikes.com/api/twm/products?page=${page}`, {
      headers: {
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvcG9ydGFsLmludGVybmV0LWJpa2VzLmNvbVwvYXBpXC90d21cL2F1dGhcL2F1dGhlbnRpY2F0ZSIsImlhdCI6MTYyMzcyMTM5MCwiZXhwIjoxNjIzNzIzMTkwLCJuYmYiOjE2MjM3MjEzOTAsImp0aSI6IkdkbTEySFhVSmhWZGJPM2oiLCJzdWIiOjYyNzYxNCwicHJ2IjoiOGI0MjJlNmY2NTc5MzJiOGFlYmNiMWJmMWUzNTZkZDc2YTM2NWJmMiJ9.YSR88RlXbsAVtsdSVSzb-apr8gY2qWnmjJ2hK3K7exU`,
      },
    });
    return res.data;
  } catch (error) {
    console.log("error in calling ", page);
    console.log(error.message);
  }
}

(async () => {
  let { start, end } = workerData;
  for (let page = start; page <= end; page++) {
    console.log("calling  page ", page);
    let { data, meta } = await getProducts(page);
    if (data) parentPort.postMessage(data);
    
  }
})();
