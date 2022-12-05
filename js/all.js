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

const allProducts = document.querySelector(".allProducts");
//重組字串 可重複使用
function combineProductHTMLItem(item) {
  return ` <li class="productCard">
<h4 class="productType">新品</h4>
<img
  src="${item.images}"
  alt=""
/>
<a href="#"  class="js-addCart" data-id="${item.id}">加入購物車</a>
<h3>${item.title}</h3>
<del class="originPrice">NT$${item.origin_price}</del>
<p class="nowPrice">NT$${item.price}</p>
</li>`;
}
//2.渲染畫面
function renderProduct(data) {
  let str = "";
  data.forEach((item) => {
    str += combineProductHTMLItem(item);
  });

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
      allProducts.setAttribute("selected", "selected");
      renderProduct(targetData);
    });
  }
  // 放暫存資料的變數，用來放被篩選過的資料
});

//3.取得購物車列表
const shoppingCartTableList = document.querySelector(".shoppingCart-tableList");
let cartData = [];
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (res) {
      cartData = res.data.carts;
      //console.log(cartData);
      let str = "";
      cartData.forEach((item) => {
        str += `<tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="" />
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>NT$${item.product.price}</td>
        <td>${item.quantity}</td>
        <td>NT$${item.product.price * item.quantity}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons"> clear </a>
        </td>
      </tr>`;
      });
      shoppingCartTableList.innerHTML = str;
    })
    .catch(function (error) {
      console.log(error);
    });
}
getCartList();
//3-2 加入購物車按鈕 addEventListener
productWrap.addEventListener("click", (e) => {
  e.preventDefault();
  //console.log(e.target);
  let addCartClass = e.target.getAttribute("class");
  //console.log(addCartClass);
  if (addCartClass !== "js-addCart") {
    return;
  }
  let productId = e.target.getAttribute("data-id");
  //console.log(productId);

  //預設數量是１
  let quantityNum = 1;
  //確認購物車內有無重複的品項
  cartData.forEach((item) => {
    if (item.product.id === productId) {
      quantityNum = item.quantity += 1;
    }
  });
  //console.log(quantityNum);
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: quantityNum,
        },
      }
    )
    .then((res) => {
      console.log(res);
      alert("加入購物車");
      getCartList();
    });
});
