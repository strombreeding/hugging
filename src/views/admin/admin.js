import * as Api from "/api.js";
// 관리자가 아니라면 튕겨내는 기능 구현 예정
const bigDiv = document.querySelector("#list-box");

const orderBtn = document.querySelector("#orderBtn");
const itemBtn = document.querySelector("#itemsBtn");
const categoryBtn = document.querySelector("#categoryBtn");
orderBtn.addEventListener("click", clickedOrder);
itemBtn.addEventListener("click", clickedItem);
categoryBtn.addEventListener("click", clickedCategory);

// 주문 조회 버튼
async function clickedOrder() {
  const dataObj = await Api.get("/api/orders/");
  const data = dataObj.data;
  bigDiv.innerHTML = "";

  // divComponent: 한 사람의 주문정보 넣기 (first + second + thrid)
  for (let i = 0; i < data.length; i++) {
    const divComponent = document.createElement("div");
    divComponent.className = "divComponent";

    // firstDiv: 상품배송정보
    const firstDiv = document.createElement("div");
    firstDiv.className = "firstDiv";

    // firstDiv-orderInfoDiv:주문날짜, 주문시간, 주문번호
    const orderInfoDiv = document.createElement("div");

    orderInfoDiv.id = data[i].주문번호;
    const orderDate = data[i].주문날짜;

    // orderDate=Date.now() => 날짜랑 시간 분리해서 출력
    orderInfoDiv.innerHTML = `
        <p>${orderDate.slice(0, 10)}</p>
        <p>${orderDate.slice(11, 19)}</p>
        <p>${data[i].주문번호}</p>
    `;

    // firstDiv-itemsDiv: 주문상품,개수
    const itemsDiv = document.createElement("div");
    const ul = document.createElement("ul");
    for (let j = 0; j < data[i].상품목록.length; j++) {
      const li = document.createElement("li");
      li.innerText = `${data[i].상품목록[j].상품} ${data[i].상품목록[j].개수}개`;
      ul.appendChild(li);
    }

    // firstDiv-itemsDiv li 마지막에 배송상태 추가
    const shippingState = document.createElement("li");
    shippingState.innerText = data[i].배송상태;
    shippingState.id = "shippingState";
    ul.appendChild(shippingState);

    // firstDiv-itemsDiv li 마지막에 요청메세지(배송메시지) 추가
    const shippingMessage = document.createElement("li");
    shippingMessage.innerText = data[i].요청사항;
    ul.appendChild(shippingMessage);
    itemsDiv.appendChild(ul);

    firstDiv.appendChild(orderInfoDiv);
    firstDiv.appendChild(itemsDiv);

    // secondDiv:주문자 정보 추가
    const secondDiv = document.createElement("div");

    secondDiv.innerHTML = `
    <p>${data[i].구매자이름}</p>
    <p>${data[i].구매자이메일}</p>
    <p>${data[i].전화번호}</p>
    <p>${data[i].주소}</p>
    `;

    divComponent.appendChild(firstDiv);
    divComponent.appendChild(secondDiv);

    // thirdDiv: 주문삭제,발송완료 버튼 (구매취소,판매자취소시 수정불가)
    const thirdDiv = document.createElement("div");
    thirdDiv.className = "thirdDiv";

    if (data[i].수정 === "수정가능") {
      thirdDiv.innerHTML = `
        <button id="${data[i].주문번호}" class="delBtn">주문삭제</button>
        <label for="${data[i].주문번호}">배송상태변경</label>
        <select id="${data[i].주문번호}" class="selectShippingState">
            <option>배송준비중</option>
            <option>배송중</option>
            <option>배송완료</option>
        </select> 
        `;
    } else {
      thirdDiv.innerHTML = "";
    }
    divComponent.appendChild(thirdDiv);

    bigDiv.appendChild(divComponent);
  }

  // 주문삭제 버튼
  const delBtns = document.querySelectorAll(".delBtn");

  // 버튼마다 이벤트동작 추가
  delBtns.forEach((delBtn) => {
    delBtn.addEventListener("click", async () => {
      const id = delBtn.id;
      await Api.patch(`/api/orders`, "", {
        id: id,
        reson: "orderCancel",
      });
      alert("삭제되었습니다!");
      clickedOrder();
    });
  });

  // 배송상태 변경 (select) 이벤트동작 추가
  const selects = document.querySelectorAll(".selectShippingState");

  selects.forEach((select) => {
    select.addEventListener("change", async () => {
      const id = select.id;
      // 선택된 배송상태
      const changedState = select.value;
      console.log(changedState);
      await Api.patch("/api/orders", "", {
        id: id,
        reson: changedState,
      });
      alert("배송상태가 변경되었습니다");
      clickedOrder();
    });
  });
}

// --------------------------------------------------------------------------
// 상품조회 이벤트
async function clickedItem() {
  // 표 상단 만들기
  bigDiv.innerHTML = `
  <div id="productsListBox">
    <table>
      <thead>
        <tr>
          <th>이름</th>
          <th>카테고리</th>
          <th>가격</th>
          <th>이미지</th>
          <th>생성날짜</th>
          <th>현재판매량</th>
          <th>게시상태</th>
          <th>상세내용</th>
        </tr>
      </thead>
      <tbody id="tableBody">
      </tbody>
    </table>
  </div>
  <div id="productDetailBox"></div>
  `;

  // 상품정보리스트 받아오기
  const data = await Api.get("/api/items/admin");
  // 리스트가 들어갈 표의 body
  const tableBody = document.querySelector("#tableBody");

  // 상품 리스트 출력하기
  for (let i = 0; i < data.data.length; i++) {
    const productObj = data.data[i];
    // 한 행 생성
    const tr = document.createElement("tr");
    tr.id = productObj._id;
    // 행 안에 값 넣기
    tr.innerHTML = `
    <td>${productObj.name}</td>
    <td>${productObj.category}</td>
    <td>${productObj.price}</td>
    <td>
      <img src=${productObj.imageUrl} alt="${productObj.name} 사진" width="70"/>
    </td>
    <td>${productObj.createdAt.slice(0, 10)}</td>
    <td>${productObj.sales}</td>
    `;
    // 판매량이 있는데 삭제 요청하면, 판매중 / 판매량 없으면 바로 삭제
    if (productObj.onSale) {
      tr.innerHTML += "<td id>판매중</td>";
    } else {
      tr.innerHTML += "<td>판매중지</td>";
    }

    tr.innerHTML += `
    <td>${productObj.itemDetail}</td>
    `;

    if (productObj.onSale) {
      tr.innerHTML += `
      <td>
        <button id=${productObj._id} class="productModifyBtn">상품수정</button>
        <button id=${productObj._id} class="productDelBtn">상품삭제</button>
      </td>`;
    } else {
      tr.innerHTML += `
      <td>
        <button id=${productObj._id} class="productModifyBtn">상품수정</button>
        <button id=${productObj._id} class="productOrderRestartBtn">판매시작</button>
      </td>`;
    }
    tableBody.appendChild(tr);
  }

  // 상품 삭제 버튼
  const productDelBtns = document.querySelectorAll(".productDelBtn");
  // 각 버튼에 이벤트리스너 적용
  productDelBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.id;
      const res = await Api.delete(`/api/items/${id}`);
      alert(res.msg);
      clickedItem();
    });
  });

  // 상품 판매시작 버튼
  const productOrderRestartBtns = document.querySelectorAll(
    ".productOrderRestartBtn"
  );

  productOrderRestartBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.id;
      await Api.patch(`/api/items/${id}`, "", {
        name: undefined,
        category: undefined,
        price: undefined,
        imageUrl: undefined,
        itemDetail: undefined,
        onSale: true,
      });
      alert("해당 상품이 판매 시작 처리되었습니다.");
      btn.className = "productDelBtn";
      btn.innerHTML = "상품 삭제";
      clickedItem();
    });
  });

  // 상품 수정 버튼
  // 리스트 하단에 상세정보칸 나와서 수정가능
  const productModifyBtns = document.querySelectorAll(".productModifyBtn");
  const productDetailBox = document.querySelector("#productDetailBox");

  productModifyBtns.forEach((btn) => {
    btn.addEventListener("click", modifyFnc);

    async function modifyFnc() {
      // 아래에 페이지 추가로 생성
      const id = btn.id;
      // 상품 정보
      const productInfo = (await Api.get(`/api/items/${id}`)).data;
      productDetailBox.innerHTML += `
        <table>
          <tr>
            <td>이름</td>
            <td>
              <input id="nameModifyInput" value="${productInfo.name}" />
            </td>
          </tr>
          <tr>
            <td>가격</td>
            <td>
              <input id="priceModifyInput" value="${productInfo.price}" />
            </td>
          </tr>
          <tr>
            <td>이미지url</td>
            <td>
              <input id="imgModifyInput" value="${productInfo.imageUrl}" />
            </td>
          </tr>
          <tr>
            <td>상세내용</td>
            <td>
              <input id="detailModifyInput" value="${productInfo.itemDetail}" />
            </td>
          </tr>
          <tr>
            <td></td>
            <td><button id="modifyDoneBtn">수정 완료</button></td>
          </tr>
        </table>
      `;
      // 카테고리 셀렉트 만들기
      // 테이블 만들기
      // 카테고리 셀릭트 만들기
      // 카테고리들 가져오기
      // 카테고리들 순회하며 셀렉트 안에 옵션 추가
      // 셀렉트 테이블 안에 넣기

      const categoriesSelect = document.createElement("select");
      const categories = (await Api.get("/api/categories/all")).data;
      categoriesSelect.id = "categoryModifySelect";

      categories.forEach((category) => {
        categoriesSelect.innerHTML += `
          <option>${category}</option>
        `;
      });

      const modifyDoneBtn = document.querySelector("#modifyDoneBtn");

      modifyDoneBtn.addEventListener("click", async () => {
        await Api.patch(`/api/items/${id}`, "", {
          name: nameModifyInput.value,
          category: categoryModifyInput.value,
          price: priceModifyInput.value,
          imageUrl: imgModifyInput.value,
          itemDetail: detailModifyInput.value,
          onSale: undefined,
        });
        alert("수정이 완료되었습니다");
      });
    }
  });
}

async function clickedCategory() {
  const dataObj = await Api.get("/api/categories/all");
  const data = dataObj.data;
}
