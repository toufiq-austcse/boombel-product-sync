let fs = require('fs');
let axios = require('axios');

function delay(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}
async function getCategories(page) {
  try {
    let res = await axios.get(`https://boombel.com/wp-json/wc/v3/products/categories?page=${page}`, {
      auth: {
        username: ``,
        password: ``,
      },
    });
    return res.data;
  } catch (error) {
    console.log('error in creating category ', error.response.data);
    throw new Error(error.message);
  }
}

(async () => {
  for (let i = 1; i <= 692; i++) {
    let categories = await getCategories(i);
    for (let cat of categories) {
      let { id, name, parent } = cat;
      let data = JSON.stringify({ id, name: name.replace(/\"/, ''), parent });

      fs.appendFileSync('json/categories.json', data + ',');
    }
    console.log(`page ${i} appended`);
    delay(500);
  }
})();
