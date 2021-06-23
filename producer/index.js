const { Worker } = require('worker_threads');
const axios = require('axios');
const boombelCategories = require('./categories');
const AWS = require('aws-sdk');
const fs = require('fs');
let cron = require('node-cron');

const QUEUE_URL = `https://sqs.ap-southeast-1.amazonaws.com/584482757797/products`;
let AWSAccessKeyId = 'AKIAYQFPDDSSQ76MLM4Y';
let AWSSecretKey = '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';
let sqs = new AWS.SQS({
  region: 'ap-southeast-1',
  credentials: {
    accessKeyId: AWSAccessKeyId,
    secretAccessKey: AWSSecretKey,
  },
});
let count = 0;
//db.get('products').push({ name: 'sadi' }).write();
let segments = [
  {
    id: 7439,
    code: 1,
    name: 'Bike',
  },
  {
    id: 7439,
    code: 2,
    name: 'Bike parts',
  },
  {
    id: 7429,
    code: 3,
    name: 'Toys',
  },
  {
    id: 7430,
    code: 5,
    name: 'Sports & Casuals',
  },
  {
    id: 7436,
    code: 7,
    name: 'Eyewear',
  },
  {
    id: 7438,
    code: 8,
    name: 'Books',
  },
  {
    id: 7440,
    code: 9,
    name: 'Baby',
  },
  {
    id: 7433,
    code: 10,
    name: 'Outdoor',
  },
  {
    id: 7434,
    code: 11,
    name: 'Home & Garden',
  },
  {
    id: 7432,
    code: 12,
    name: 'Party',
  },
  {
    id: 7431,
    code: 13,
    name: 'Pet',
  },
  {
    id: 7435,
    code: 14,
    name: 'Health & Beauty',
  },
];

function getProductName(name) {
  if (!name) return '';
  return name[0].toUpperCase() + name.slice(1).toLowerCase();
}
function getWeight(shippingSize) {
  switch (shippingSize) {
    case 'XS':
      return 1;
    case 'S':
      return 3;
    case 'M':
      return 5;
    case 'L':
      return 10;
    case 'XL':
      return 20;
    default:
      return 0;
  }
}

function getPrice(product) {
  let { categories, price } = product;
  let totalPrice = 0;
  let vat = (21 / 100) * price;
  categories.forEach((category) => {
    let segmentCode = category.parent_segment;
    let index = segments.findIndex((segment) => segment.code === segmentCode);
    if (index < 0) return price;
    let segment = segments[index];
    if (segment.name === 'Baby' || segment.name === 'Outdoor' || segment.name === 'Health & Beauty') {
      totalPrice = price + (40 / 100) * price + vat + 4;
      return totalPrice.toFixed(2);
    }
  });

  totalPrice = price + (30 / 100) * price + vat + 4;
  return totalPrice.toFixed(2);
}
function getCategories(product) {
  let result = [];
  let { categories } = product;
  for (let i = 0; i < categories.length; i++) {
    let cat = categories[i];
    let index = segments.findIndex((seg) => seg.code === cat.parent_segment);
    if (index < 0) continue;
    let segment = segments[index];
    let filteredCategories = boombelCategories.filter(
      (bCat) => bCat.name == cat.parent_name_en && bCat.parent == segment.id
    );

    if (filteredCategories.length === 0) continue;
    let finalCategories = boombelCategories.filter(
      (bCat) => bCat.parent === filteredCategories[0].id && bCat.name === cat.name_en
    );
    if (finalCategories.length === 0) continue;
    result.push(...finalCategories);
  }
  return result;
}
function getTags(product) {
  let result = [];
  let { brand, categories } = product;
  result.push({
    name: brand,
  });
  categories.forEach((cat) => {
    result.push({
      name: cat.parent_name_en,
    });
    result.push({
      name: cat.name_en,
    });
  });
  return result;
}

function getImages(product) {
  let { media } = product;
  media = media.filter((m) => m.type === 'image');
  return media.map((m) => ({
    src: m.url,
  }));
}

function getAttributeId(name) {
  switch (name) {
    case 'Size':
      return 6;
    case 'Material':
      return 3;
    case 'Gender':
      return 5;
    case 'Colour':
      return 4;
    case 'Brand':
      return 2;
    default:
      return 0;
  }
}

function getAttributes(product) {
  let { attributes } = product;
  attributes = attributes.filter(
    (attr) =>
      attr.name_en === 'Size' ||
      attr.name_en === 'Material' ||
      attr.name_en === 'Gender' ||
      attr.name_en === 'Colour' ||
      attr.name_en === 'Brand'
  );
  return attributes.map((att) => ({
    id: getAttributeId(att.name_en),
    name: att.name_en,
    visible: true,
    global: true,
  }));
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
function delay(timeInMs) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

async function sendToSqs(body) {
  try {
    let res = await sqs
      .sendMessage({
        MessageBody: body,
        QueueUrl: QUEUE_URL,
      })
      .promise();
    return res;
  } catch (error) {
    console.log('error in sending to sqs ', error.message);
  }
}
let i = 0;
async function processProducts(products) {
  for (let product of products) {
    try {
      await delay(1000);
      let categories = getCategories(product);
      if (categories.length === 0) continue;
      let modifiedProduct = {
        name: getProductName(product.name_en),
        regular_price: getPrice(product).toString(),
        description: product.description_en ? product.description_en : '',
        type: 'simple',
        sku: product.id.toString(),
        published: 1,
        is_featured: 0,
        catalog_visibility: 'visible',
        tax_status: 'taxable',
        stock_status: 'instock',
        Stock: product.stock ? product.stock : 0,
        sold_individually: false,
        weight: getWeight(product.shipping_size).toString(),
        dimensions: {
          length: '',
          width: getWeight(product.shipping_size).toString(),
          height: '',
        },
        reviews_allowed: 0,
        categories,
        tags: getTags(product),
        images: getImages(product),
        attributes: getAttributes(product),
      };
      let res = await sendToSqs(JSON.stringify(modifiedProduct));
    } catch (error) {
      console.log(error.message);
    }
  }
}

cron.schedule('0 */8 * * * *', async () => {
  console.log('updating token');
  try {
    await getApiToken();
    console.log('updated');
  } catch (error) {
    console.log('error in cron ', error.message);
  }
});



 (async () => {
  try {
    await getApiToken();
    let worker1 = new Worker('./worker.js', { workerData: { start: 2601, end: 6600 } });
    worker1.on('error', (error) => {
      console.log(error);
    });

    worker1.on('exit', (exitCode) => {
      console.log(exitCode);
    });

    //Listen for a message from worker
    worker1.on('message', (result) => {
      processProducts(result);
    });
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
})();
 
