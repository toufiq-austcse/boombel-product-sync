const { Worker } = require('worker_threads');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ products: [{}] }).write();

//db.get('products').push({ name: 'sadi' }).write();
let segments = [
  {
    code: 0,
    name: 'Others',
  },
  {
    code: 1,
    name: 'Bikes',
  },
  {
    code: 2,
    name: 'Bike parts',
  },
  {
    code: 3,
    name: 'Toys',
  },
  {
    code: 4,
    name: 'Sportclubs',
  },
  {
    code: 5,
    name: 'Sport and Casuals',
  },
  {
    code: 6,
    name: 'Automotive',
  },
  {
    code: 7,
    name: 'Eyewear',
  },
  {
    code: 8,
    name: 'Book',
  },
  {
    code: 9,
    name: 'Baby',
  },
  {
    code: 10,
    name: 'Outdoor',
  },
  {
    code: 11,
    name: 'Home and Garden',
  },
  {
    code: 12,
    name: 'Party',
  },
  {
    code: 13,
    name: 'Pet',
  },
  {
    code: 14,
    name: 'Health and Beauty',
  },
];

function getProductName(name) {
  if (!name) return '';
  let modifiedName = name.toLowerCase();
  return modifiedName[0].toUpperCase() + name.slice(1);
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

function splitProductBySegment(product) {
  let splittedProducts = [];
  let { categories } = product;
  categories.forEach((category) => {
    let { categories, ...rest } = product;
    splittedProducts.push({ category, ...rest });
  });

  return splittedProducts;
}

function getPrice(product) {
  let { categories, consumer_price } = product;
  let totalPrice = 0;
  let vat = (21 / 100) * consumer_price;
  categories.forEach((category) => {
    let segmentCode = category.parent_segment;
    let index = segments.findIndex((segment) => segment.code === segmentCode);
    if (index < 0) return 0;
    let segment = segments[index];
    if (segment.name === 'Babyshop' || segment.name === 'Outdoorshop' || segment.name === 'Health and Beauty') {
      totalPrice = consumer_price + (40 / 100) * consumer_price + vat + 4;
      return totalPrice;
    }
  });

  totalPrice = consumer_price + (30 / 100) * consumer_price + vat + 4;
  return totalPrice;
}
function getCategories(product) {
  let result = [];
  let { categories } = product;
  categories.forEach((cat) => {
    let index = segments.findIndex((segment) => segment.code === cat.parent_segment);
    if (index < 0) return result.push('');
    let segment = segments[index];
    let category = `${segment.name}>${cat.parent_name_en}>${cat.name_en}`;
    result.push(category);
  });
  return result;
}
function getTags(product) {
  let result = [];
  let { brand, categories } = product;

  categories.forEach((cat) => {
    let tags = `${brand}`;
    tags += `, ${cat.parent_name_en}, ${cat.name_en}`;
    result.push(tags);
  });
  return result;
}

function getImages(product) {
  let { media } = product;
  media = media.filter((m) => m.type === 'image');
  let urls = [];
  media.forEach((m) => urls.push(m.url));
  return urls;
}
function getColorAttr(product) {
  let index = product.attributes.findIndex((att) => att.name_en === 'Colour');
  if (index === -1) return '';
  return product.attributes[index].value_en;
}

function getGenderAttr(product) {
  let index = product.attributes.findIndex((att) => att.name_en === 'Gender');
  if (index === -1) return '';
  return product.attributes[index].value_en;
}

function getMaterialAttr(product) {
  let index = product.attributes.findIndex((att) => att.name_en === 'Material');
  if (index === -1) return '';
  return product.attributes[index].value_en;
}

function getSizeAttr(product) {
  let index = product.attributes.findIndex((att) => att.name_en === 'Size');
  if (index === -1) return '';
  return product.attributes[index].value_en;
}
function isRemoveAble(product) {
  let { categories } = product;
  categories.forEach((category) => {
    let index = segments.findIndex((segment) => segment.code === category.parent_segment);
    if (index < 0) return true;
    let segment = segments[index];
    if (segment.name === 'Bikes') {
      if (category.name_en === 'Bicycles' || category.parent_name_en === 'Bicycles') return true;
    }
    if (segment.name === 'Home and Garden') {
      if (category.name_en === 'Electronics' || category.parent_name_en === 'Electronics') return true;
    }
  });
  return false;
}

function postToBoombel(product) {

}
function processProducts(products) {
  products.forEach((product) => {
    if (!isRemoveAble(product)) {
      let id = Date.now();
      let modifiedProduct = {
        id: id,
        name: getProductName(product.name_en),
        regular_price: getPrice(product),
        description: product.description_en ? product.description_en : '',
        type: 'Simple',
        SKU: id,
       
        Published: 1,
        is_featured: 0,
        'Visibility in catalog': 'visible',
        'Short description': '',
      
        'Date sale price starts': '',
        'Date sale price ends': '',
        'Tax status': 'taxable',
        'Tax class': '',
        'In stock?': 1,
        Stock: product.stock ? product.stock : 0,
        'Low stock amount': '',
        'Backorders allowed': '',
        'Sold individually?': 0,
        'Weight (kg)': getWeight(product.shipping_size),
        'Length (cm)': '',
        'Width (cm)': '',
        'Height (cm)': '',
        'Allow customer reviews': 0,
        'Purchase note': '',
        'Sale price': '',
        
        Categories: getCategories(product),
        Tags: getTags(product),
        'Shipping class': '',
        Images: getImages(product),
        'Download limit': '',
        'Download expiry days': '',
        Parent: '',
        'Grouped products': '',
        Upsells: '',
        'Cross-sells': '',
        'External URL': '',
        'Button text': '',
        Position: '',
        'Meta: _wxr_import_user_slug': '',
        'Meta: big_store_sidebar_dyn': '',

        'Attribute 1 name': 'Brand',
        'Attribute 1 value(s)': product.brand,
        'Attribute 1 visible': 1,
        'Attribute 1 global': 1,

        'Attribute 2 name': 'Color',
        'Attribute 2 value(s)': getColorAttr(product),
        'Attribute 2 visible': 1,
        'Attribute 2 global': 1,

        'Attribute 3 name': 'Gender',
        'Attribute 3 value(s)': getGenderAttr(product),
        'Attribute 3 visible': 1,
        'Attribute 3 global': 1,

        'Attribute 4 name': 'Material',
        'Attribute 4 value(s)': getMaterialAttr(product),
        'Attribute 4 visible': 1,
        'Attribute 4 global': 1,

        'Attribute 5 name': 'Size',
        'Attribute 5 value(s)': getSizeAttr(product),
        'Attribute 5 visible': 1,
        'Attribute 5 global': 1,
        'Meta: _last_editor_used_jetpack': '',
        'Meta: _wp_page_template': 'default',
        'Attribute 1 default': '',
      };
    }
  });
}
(async () => {
  let total = 0;
  let worker1 = new Worker('./worker.js', { workerData: { start: 1, end: 1000 } });
  worker1.on('error', (error) => {
    console.log(error);
  });

  worker1.on('exit', (exitCode) => {
    console.log(exitCode);
  });

  //Listen for a message from worker
  worker1.on('message', (result) => {
    total += 1;
    processProducts(result);
  });

  let worker2 = new Worker('./worker.js', { workerData: { start: 1001, end: 2000 } });
  worker2.on('error', (error) => {
    console.log(error);
  });

  worker2.on('exit', (exitCode) => {
    console.log(exitCode);
  });

  worker2.on('message', (result) => {
    total += 1;
    // console.log('result ', result);
  });

  let worker3 = new Worker('./worker.js', { workerData: { start: 2001, end: 3000 } });
  worker3.on('error', (error) => {
    console.log(error);
  });

  worker3.on('exit', (exitCode) => {
    console.log(exitCode);
  });

  worker3.on('message', (result) => {
    total += 1;
    // console.log('result ', result);
  });
})();
