let orderData = [];
const orderList = document.querySelector(".js-orderList");
//console.log(orderList);
function init() {
  getOrderList();
}
init();
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then((res) => {
      orderData = res.data.orders;
      //console.log(res.data);
      //console.log(orderData);

      //訂單處理狀態
      //組全部訂單字串
      let str = "";
      orderData.forEach((item) => {
        //組同筆訂單但多個品項字串
        let productStr = "";
        item.products.forEach((productItem) => {
          productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });

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
        <td>${item.createdAt}</td>
        <td class="orderStatus">
          <a href="#">${item.paid}</a>
        </td>
        <td>
          <input
            type="button"
            class="delSingleOrder-Btn"
            data-id="${item.id}"
            value="刪除"
          />
        </td>
      </tr>`;
      });
      orderList.innerHTML = str;
    });
}
