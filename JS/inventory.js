import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase.js";

const itemsCol = collection(db, "items");
const itemsQ = query(itemsCol, orderBy("createdAt", "desc"));

export function initInventory() {
  const tbody = document.getElementById("itemsBody");
  if (!tbody) {
    console.error(" itemsBody tbody not found");
    return;
  }

  onSnapshot(itemsQ, (snap) => {
    tbody.innerHTML = "";

    snap.forEach((d) => {
      const x = d.data();
      const stock = Number(x.stock ?? 0);

      //  hide if stock is 0
      if (stock <= 0) return;

      tbody.innerHTML += `
        <tr>
          <td>${x.article ?? ""}</td>
          <td>${x.name ?? ""}</td>
          <td>${x.category ?? ""}</td>
          <td>${stock}</td>
        </tr>
      `;
    });
  });
}
