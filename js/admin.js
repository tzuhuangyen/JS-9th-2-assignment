let orderData = [];
const orderList = document.querySelector(".js-orderList");
//console.log(orderList);
//0.初始化
function init() {
  getOrderList();
}
init();

//1-1.取得訂單列表
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      config
    )
    .then((res) => {
      orderData = res.data.orders;
      //console.log(res.data);
      //console.log(orderData);
      renderOderList();
      renderC3();
      //renderC3_lv2();
    });
}
//1-2渲染列表
function renderOderList() {
  let str = "";
  orderData.forEach((item) => {
    //組時間字串
    const timeStamp = new Date(item.createdAt * 1000);
    const orderTime = `${timeStamp.getFullYear()}/${
      timeStamp.getMonth() + 1
    }/${timeStamp.getDate()}`;
    console.log(orderTime);
    //組同筆訂單但多個品項字串
    let productStr = "";
    item.products.forEach((productItem) => {
      productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
    });

    // 判斷訂單處理狀態
    let orderStatus = "";
    if (item.paid == true) {
      orderStatus = "已處理";
    } else {
      orderStatus = "未處理";
    }
    //組全部訂單字串
    str += ` <tr>
    <td>${item.id}</td>
    <td>
      <p>${item.user.name}</p>
      <p>${item.user.tel}</p>
    </td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>
      ${productStr}
    </td>
    <td>${orderTime}</td>
    <td class=" js-oderStatus">
      <a href="#" class="orderStatus" data-id="${item.id}" data-status="${item.paid}" >${orderStatus}</a>
    </td>
    <td>
      <input
        type="button"
        class="delSingleOrder-Btn js-oderDelete"
        data-id="${item.id}"
        value="刪除"
      />
    </td>
  </tr>`;
  });
  orderList.innerHTML = str;
}
//2-1.綁定監聽 確認點擊刪除＆變更按鈕
orderList.addEventListener("click", (e) => {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  const id = e.target.getAttribute("data-id");
  //console.log(targetClass);
  if (targetClass == "delSingleOrder-Btn js-oderDelete") {
    deleteOrderItem(id);
    return;
  }
  if (targetClass == "orderStatus") {
    //console.log(e.target.textContent);
    const status = e.target.getAttribute("data-status");

    changeOrderStatus(status, id);
  }
});
//2-2.變更訂單狀態函示
function changeOrderStatus(status, id) {
  console.log(status, id);
  let newStatus;
  if (status === "true") {
    newStatus = false;
  } else {
    newStatus = true;
  }
  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      config
    )
    .then((res) => {
      alert("changed has been done");
      getOrderList();
    });
}
//2-3刪除單筆訂單函示
function deleteOrderItem(id) {
  //console.log(id);
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      config
    )
    .then((res) => {
      alert("deleted this order");
      getOrderList();
    });
}
//2-4刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  deleteAllOrder();
});
function deleteAllOrder() {
  //console.log(id);
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      config
    )
    .then((res) => {
      alert("deleted all orders");
      getOrderList();
    });
}

//3-1.level1-c3 chart
function renderC3() {
  console.log(orderData);
  //取得要呈現在圖表的物件資料收集
  //並加總個品項的營收
  let total = {};
  orderData.forEach((item) => {
    item.products.forEach((productItem) => {
      if (total[productItem.category] === undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });
  console.log(total);

  //做出資料關聯 將total物件轉換為陣列
  let categoryAry = Object.keys(total);
  console.log(categoryAry);
  //宣告變數來接c3要得格式
  let newData = [];
  categoryAry.forEach((item) => {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  console.log(newData);

  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      // colors: {
      //   "Louvre 雙人床架": "#DACBFF",
      //   "Antony 雙人床架": "#9D7FEA",
      //   "Anty 雙人床架": "#5434A7",
      //   其他: "#301E5F",
      // },
    },
  });
}
//3-2.level2-c3 chart

function soreOrders() {
  //取得要呈現在圖表的{物件} 資料收集
  let obj = {};
  orderData.forEach((item) => {
    item.products.forEach((productItem) => {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.price * productItem.quantity;
      } else {
        obj[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  console.log(obj);

  //將物件轉為陣列 object.keys(obj)
  let originAry = Object.keys(obj);
  console.log(originAry);

  let rankSortAry = [];
  originAry.forEach((item) => {
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  });
  console.log(rankSortAry);

  //排序
  rankSortAry.sort((a, b) => {
    return b[1] - a[1];
  });
  //如超過四筆數據、第四筆後合併為其他
  if (rankSortAry.length > 3) {
    let otherTotal = 0;
    rankSortAry.forEach((item, index) => {
      if (index > 2) {
        otherTotal += rankSortAry[index][1];
      }
    });
    rankSortAry.splice(3, rankSortAry.length - 1);
    rankSortAry.push(["其他", otherTotal]);
    console.log(rankSortAry);
  }
  return rankSortAry;
  //renderC3_lv2(rankSortAry);
}
soreOrders();
// function renderC3_lv2() {
//   // chart.load({
//   //   unload: true,
//   //   columns: soreOrders(),
//   // });
//   let chart = c3.generate({
//     bindto: "#chart2", // HTML 元素綁定
//     data: {
//       type: "pie",
//       columns: data,
//       colors: {
//         pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"],
//       },
//     },
//   });
// }
