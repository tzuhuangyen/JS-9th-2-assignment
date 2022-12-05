console.log("test");

let productData = [];
const productWrap = document.querySelector(".productWrap");
const searchResultText = document.querySelector("#searchResult-text");

//0.初始化
function init() {
  getProductData();
}
init();
//1.取得外部資料
function getProductData() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (res) {
      productData = res.data.products;
      renderProduct(productData);
    })
    .catch(function (error) {
      console.log(error);
    });
}
//2.渲染畫面
const allProducts = document.querySelector(".allProducts");
function combineProductHTMLItem(item) {
  return ` <li class="productCard">
<h4 class="productType">新品</h4>
<img
  src="${item.images}"
  alt=""
/>
<a href="#" class="addCardBtn js-addCart" data-id="${item.id}">加入購物車</a>
<h3>${item.title}</h3>
<del class="originPrice">NT$${item.origin_price}</del>
<p class="nowPrice">NT$${item.price}</p>
</li>`;
}
function renderProduct(data) {
  let str = "";
  data.forEach((item) => {
    str += combineProductHTMLItem(item);
  });
  allProducts.setAttribute("selected", "selected");
  productWrap.innerHTML = str;
  searchResultText.innerHTML = `本次搜尋共 ${data.length}筆資料`;
}
//2-2 下拉式選單篩選
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", (e) => {
  //console.log(e.target.value);
  const currValue = e.target.value;
  if (currValue === "全部") {
    renderProduct(productData);
  } else {
    let targetData = [];
    productData.forEach((item) => {
      if (item.category === currValue) targetData.push(item);
      renderProduct(targetData);
    });
  }
  // 放暫存資料的變數，用來放被篩選過的資料
});
//3.取得購物車列表
// let cartData = [];
// function getCartData() {
//   axios
//     .get(
//       `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
//     )
//     .then(function (res) {
//       cartData = res.data.products;
//       console.log(res.data.products);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// }
// getCartData();
