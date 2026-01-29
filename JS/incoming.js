import {
  collection, addDoc, query, orderBy,
  onSnapshot, doc, updateDoc, getDocs, where, limit
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase.js";

const incomingCol = collection(db, "incoming");
const itemsCol = collection(db, "items");

async function findItem(name) {
  const q = query(itemsCol, where("name", "==", name), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0];
}

export function initIncoming() {
  onSnapshot(query(incomingCol, orderBy("createdAt", "desc")), snap => {
    incomingBody.innerHTML = "";
    snap.forEach(d => {
      const x = d.data();
      incomingBody.innerHTML += `
        <tr>
          <td>${x.date}</td>
          <td>${x.item}</td>
          <td>${x.qty}</td>
          <td>${x.warehouse}</td>
        </tr>
      `;
    });
  });

  addIncomingBtn.addEventListener("click", async () => {
    const item = inItem.value.trim();
    const qty = Number(inQty.value);
    if (!item || qty <= 0) return alert("Invalid input");

    const found = await findItem(item);
    if (!found) return alert("Item not found");

    await updateDoc(doc(db, "items", found.id), {
      stock: (found.data().stock || 0) + qty
    });

    await addDoc(incomingCol, {
      date: inDate.value,
      item, qty,
      warehouse: inWh.value,
      createdAt: Date.now()
    });

    inItem.value = "";
    inQty.value = 1;
    inWh.value = "";
  });
}