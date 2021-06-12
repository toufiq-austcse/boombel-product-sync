const { Worker } = require("worker_threads");

function getProductName(name) {
  if (!name) return "";
  let modifiedName = name.toLowerCase();
  modifiedName[0] = modifiedName[0].toUpperCase();
  return modifiedName;
}
function getWeight(shippingSize) {
  switch (shippingSize) {
    case "XS":
      return 1;
    case "S":
      return 3;
    case "M":
      return 5;
    case "L":
      return 10;
    case "XL":
      return 20;
    default:
      return 0;
  }
}

function processProducts(products) {
  for (let product in products) {
    let id = Date.now;
    let modifiedProduct = {
      ID: id,
      Type: "Simple",
      SKU: id,
      Name: getProductName(product.name_en),
      Published: 1,
      is_featured: 0,
      "Visibility in catalog": "visible",
      "Short description": "",
      Description: product.description_en ? processProducts.description_en : "",
      "Date sale price starts": "",
      "Date sale price ends": "",
      "Tax status": "taxable",
      "Tax class": "",
      "In stock?": 1,
      Stock: product.stock ? product.stock : 0,
      "Low stock amount": "",
      "Backorders allowed": "",
      "Sold individually?": 0,
      "Weight (kg)": getWeight(processProducts.shipping_size),
      "Length (cm)": "",
      "Width (cm)": "",
      "Height (cm)": "",
      "Allow customer reviews": 0,
      "Purchase note": "",
      "Sale price": "",

      //sd
      "Regular price": "",
      Categories: "",
      Tags: "",
      "Shipping class": "",
      Images: "",
      "Download limit": "",
      "Download expiry days": "",
      Parent: "",
      "Grouped products": "",
      Upsells: "",
      "Cross-sells": "",
      "External URL": "",
      "Button text": "",
      Position: "",
      "Meta: _wxr_import_user_slug": "",
      "Meta: big_store_sidebar_dyn": "",
      "Attribute 1 name": "",
      "Attribute 1 value(s)": "",
      "Attribute 1 visible": "",
      "Attribute 1 global": "",
      "Attribute 2 name": "",
      "Attribute 2 value(s)": "",
      "Attribute 2 visible": "",
      "Attribute 2 global": "",
      "Attribute 3 name": "",
      "Attribute 3 value(s)": "",
      "Attribute 3 visible": "",
      "Attribute 3 global": "",
      "Attribute 4 name": "",
      "Attribute 4 value(s)": "",
      "Attribute 4 visible": "",
      "Attribute 4 global": "",
      "Attribute 5 name": "",
      "Attribute 5 value(s)": "",
      "Attribute 5 visible": "",
      "Attribute 5 global": "",
      "Meta: _last_editor_used_jetpack": "",
      "Meta: _wp_page_template": "",
      "Attribute 1 default": "",
    };
  }
}
(async () => {
  let total = 0;
  let worker1 = new Worker("./worker.js", { workerData: { start: 1, end: 100 } });
  worker1.on("error", (error) => {
    console.log(error);
  });

  worker1.on("exit", (exitCode) => {
    console.log(exitCode);
  });

  //Listen for a message from worker
  worker1.on("message", (result) => {
    total += 1;
    console.log("result ", result);
  });

  let worker2 = new Worker("./worker.js", { workerData: { start: 101, end: 200 } });
  worker2.on("error", (error) => {
    console.log(error);
  });

  worker2.on("exit", (exitCode) => {
    console.log(exitCode);
  });

  worker2.on("message", (result) => {
    total += 1;
    console.log("result ", result);
  });

  let worker3 = new Worker("./worker.js", { workerData: { start: 201, end: 300 } });
  worker3.on("error", (error) => {
    console.log(error);
  });

  worker3.on("exit", (exitCode) => {
    console.log(exitCode);
  });

  worker3.on("message", (result) => {
    total += 1;
    console.log("result ", result);
  });
})();
