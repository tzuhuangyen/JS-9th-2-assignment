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
<del class="originPrice">NT$${toThousands(item.origin_price)}</del>
<p class="nowPrice">NT$${toThousands(item.price)}</p>
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
    })
    .catch(function (error) {
      alert = "error";
    });
}
getCartList();
//3-1
function renderCarts(cartData, finalTotal) {
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
  <td>NT$${toThousands(item.product.price)}</td>
  <td>${item.quantity}</td>
  <td>NT$${toThousands(item.product.price * item.quantity)}</td>
  <td class="discardBtn">
    <a href="#" class="material-icons" data-id="${
      item.id
    }" data-productTitle="${item.product.title}"> clear </a>
  </td>
</tr>`;
  });
  shoppingCartTableList.innerHTML = str;
  //console.log(res.data.finalTotal);
  document.querySelector(".js-total").textContent = toThousands(
    res.data.finalTotal
  );
}
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
      renderCarts(res.data.carts, res.data.finalTotal);
    });
});
//4刪除全部購物車產品
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (cartData.length === 0) {
    alert("your cart is empty");
  }
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/yaqn09/carts`
    )
    .then((res) => {
      getCartList();
      alert("deleted completely");
    });
});
//4-2刪除購物車單筆產品
shoppingCartTableList.addEventListener("click", (e) => {
  e.preventDefault();
  //console.log(e.target);
  let cartItemId = e.target.getAttribute("data-id");
  let cartItemName = e.target.getAttribute("data-productTitle");
  console.log(cartItemName);
  console.log(cartItemId);
  if (cartItemId == null) {
    alert("請點選要刪除的商品x按鈕");
    return;
  }
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartItemId}`
    )
    .then((res) => {
      getCartList();
      alert(`deleted this ${cartItemName} item completely`);
    });
});

//5表單送出 產生訂單
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

orderInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (cartData.length === 0) {
    alert("your cart is empty, 快去買起乃");
    return;
  } else if (
    customerName.value === "" ||
    customerPhone.value === "" ||
    customerEmail.value === "" ||
    customerAddress.value === ""
  ) {
    alert("資料沒有填寫完整");
    return;
  }
  const constraints = {
    name: {
      presence: {
        message: "是必填欄位",
      },
    },
    tel: {
      presence: {
        message: "是必填欄位",
      },
      length: {
        minimum: 8,
        message: "需至少 8 碼",
      },
    },
    Email: {
      presence: {
        message: "是必填欄位",
      },
      email: {
        message: "格式錯誤",
      },
    },
    customerAddress: {
      presence: {
        message: "是必填欄位",
      },
    },
    tradeWay: {
      presence: {
        message: "是必填欄位",
      },
    },
  };
  const orderInfoForm = document.querySelector(".orderInfo-form");
  const inputs = document.querySelectorAll("input[name],select[name]");
  //確認表單填寫資料符合格式規範
  let errors = validate(orderInfoForm, constraints) || "";

  if (errors) {
    Object.keys(errors).forEach(function (keys) {
      document.querySelector(`[data-message="${keys}"]`).textContent =
        errors[keys];
    });
    // 助教註解：當進入 if(errors) 代表表單驗證沒通過，
    // 所以這裡要使用 return 跳出函式才不會繼續往後跑然後出錯
    return;
  }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            // 助教註解：這裡再使用 value 取值才會是當下表單的值
            name: customerName.value,
            tel: customerPhone.value,
            email: customerEmail.value,
            address: customerAddress.value,
            payment: tradeWay.value,
          },
        },
      }
    )
    .then((res) => {
      alert("訂單送出成功");

      // 助教註解：清空 input
      customerName.value = "";
      customerPhone.value = "";
      customerEmail.value = "";
      customerAddress.value = "";
      tradeWay.value = "ATM";

      getCartList();
    });
});

// util js、元件
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
