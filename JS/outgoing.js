import {
  collection, addDoc, query, orderBy,
  onSnapshot, doc, updateDoc, getDocs, where, limit
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase.js";

const outgoingCol = collection(db, "outgoing");
const itemsCol = collection(db, "items");

async function findItem(name) {
  const q = query(itemsCol, where("name", "==", name), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0];
}

export function initOutgoing() {
  onSnapshot(query(outgoingCol, orderBy("createdAt", "desc")), snap => {
    outgoingBody.innerHTML = "";
    snap.forEach(d => {
      const x = d.data();
      outgoingBody.innerHTML += `
        <tr>
          <td>${x.date}</td>
          <td>${x.item}</td>
          <td>${x.qty}</td>
          <td>${x.issuedTo}</td>
        </tr>
      `;
    });
  });

  addOutgoingBtn.addEventListener("click", async () => {
    const item = outItem.value.trim();
    const qty = Number(outQty.value);
    if (!item || qty <= 0) return alert("Invalid input");

    const found = await findItem(item);
    if (!found) return alert("Item not found");

    const current = found.data().stock || 0;
    if (qty > current) return alert("Not enough stock");

    await updateDoc(doc(db, "items", found.id), {
      stock: current - qty
    });

    await addDoc(outgoingCol, {
      date: outDate.value,
      item, qty,
      issuedTo: outTo.value,
      createdAt: Date.now()
    });

    outItem.value = "";
    outQty.value = 1;
    outTo.value = "";
  });
}