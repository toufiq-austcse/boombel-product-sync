let fs = require('fs');
let axios = require('axios');

async function createCategory(data) {
  try {
    let res = await axios.post('https://boombel.com/wp-json/wc/v3/products/categories', data, {
      auth: {
        username: `ck_adaf805d4e9cd352f1aa6f282712aaa0423d3251`,
        password: `cs_3051aa1312e7a00c6234ab95f7150de9ca8981ca`,
      },
    });
    return res.data;
  } catch (error) {
    console.log('error in creating category ', error.response.data);
    throw new Error(error.message);
  }
}

function delay(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

let res = fs.readFileSync('data/Baby.csv', { encoding: 'utf-8' });
let rows = res.split('\n');
let segments = [
  {
    id: 196,
    name: 'Toys',
  },
  {
    id: 197,
    name: 'Sports & Casuals',
  },
  {
    id: 198,
    name: 'Pet',
  },
  {
    id: 199,
    name: 'Party',
  },
  {
    id: 200,
    name: 'Outdoor',
  },
  {
    id: 201,
    name: 'Home & Garden',
  },
  {
    id: 202,
    name: 'Health & Beauty',
  },
  {
    id: 203,
    name: 'Eyewear',
  },
  {
    id: 204,
    name: 'Car',
  },
  {
    id: 205,
    name: 'Books',
  },
  {
    id: 206,
    name: 'Bike',
  },
  {
    id: 207,
    name: 'Baby',
  },
];
/*

Row 150 created with parentId 5434
*/
(async () => {
  let parentId;
  let segmentId = 207;
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    try {
      let columns = row.split(',');
      await delay(500);
      if (columns[0] !== '') {
        let name = columns[0].toLowerCase() === 'root' ? 'Others' : columns[0];
        let data = await createCategory({
          name,
          parent: segmentId,
        });
        parentId = data.id;
        await createCategory({
          name: columns[1],
          parent: parentId,
        });
      } else {
        await createCategory({
          name: columns[1],
          parent: parentId,
        });
      }
      console.log(`Row ${i + 1} created with parentId ${parentId}`);
    } catch (error) {
      console.log('error ', error.message, row);
      throw new Error(error);
    }
  }
})();
