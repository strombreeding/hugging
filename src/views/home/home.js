import * as Api from "/api.js";

const bestContainer = document.querySelector(".bestContainer");
const newContainer = document.querySelector(".newContainer");

createDB();
getDataFromApi();

async function getDataFromApi() {
  const data = await Api.get("/api/items");
  // data = [ [{...},{...}...{...}:8개] , [{...}{}{}:3개] ]
  const { bestItems, newItems } = data;

  bestContainer.appendChild(draw(bestItems, "bestItem"));
  newContainer.appendChild(draw(newItems, "newItem"));

  attachBtn();
}

function draw(Items, className) {
  let card = document.createElement("div");
  card.setAttribute("class", "containerLayout");
  for (let i = 0; i < Items.length; i++) {
    card.innerHTML += `
    <div id="${Items[i]._id}" class="${className}">
      <p>${Items[i].name}</p>
      <img src="${Items[i].imageUrl}">
      <p>${Items[i].price}</p>
      <p>${Items[i].category}</p>
    </div>
    `;
  }
  return card;
}

function createDB() {
  if (window.indexedDB) {
    const databaseName = "cart";
    const version = 1;

    const request = indexedDB.open(databaseName, version);

    request.onupgradeneeded = function () {
      request.result.createObjectStore("items", { keyPath: "id" });
    };
    request.onsuccess = function () {};
    request.onerror = function (event) {
      alert(event.target.errorCode);
    };
  }
}

function attachBtn() {
  const detailToBtns = document.querySelectorAll(".bestItem");
  const newItemToBtns = document.querySelectorAll(".newItem");

  console.log(detailToBtns);

  detailToBtns.forEach((detailToBtn) => {
    detailToBtn.addEventListener("click", () => {
      const id = detailToBtn.id;
      localStorage.setItem("itemDetail", `${id}`);
      location.href = "/detail";
    });
  });

  newItemToBtns.forEach((newItemToBtn) => {
    newItemToBtn.addEventListener("click", () => {
      const id = newItemToBtn.id;
      localStorage.setItem("itemDetail", `${id}`);
      location.href = "/detail";
    });
  });
}
