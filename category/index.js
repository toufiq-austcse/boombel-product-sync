let fs = require('fs');
let axios = require('axios');

async function createCategory(data) {
  try {
    let res = await axios.post('https://boombel.eu/wp-json/wc/v3/products/categories', data, {
      auth: {
        username: `ck_380d746b8f0878e48bec98d831906c907ab4d8df`,
        password: `cs_2ed49a196bc9f0da900c23617a8a251218f4d462`,
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
    id: 7429,
    name: 'Toys',
  },
  {
    id: 7430,
    name: 'Sports & Casuals',
  },
  {
    id: 7431,
    name: 'Pet',
  },
  {
    id: 7432,
    name: 'Party',
  },
  {
    id: 7433,
    name: 'Outdoor',
  },
  {
    id: 7434,
    name: 'Home & Garden',
  },
  {
    id: 7435,
    name: 'Health & Beauty',
  },
  {
    id: 7436,
    name: 'Eyewear',
  },
  {
    id: 7437,
    name: 'Car',
  },
  {
    id: 7438,
    name: 'Books',
  },
  {
    id: 7439,
    name: 'Bike',
  },
  {
    id: 7440,
    name: 'Baby',
  }
];

(async () => {
  let parentId;
  let segmentId = 7440;
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
      throw new Error(error)
    }
  }
})();
