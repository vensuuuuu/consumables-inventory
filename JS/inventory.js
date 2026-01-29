import {
  collection, addDoc, onSnapshot,
  query, orderBy, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase.js";

const itemsCol = collection(db, "items");
const itemsQ = query(itemsCol, orderBy("createdAt", "desc"));

export function initInventory() {
  const tbody = document.getElementById("itemsBody");

  onSnapshot(itemsQ, snap => {
    tbody.innerHTML = "";
    snap.forEach(d => {
      const x = d.data();
      tbody.innerHTML += `
        <tr>
          <td>${x.article ?? ""}</td>
          <td>${x.name ?? ""}</td>
          <td>${x.category ?? ""}</td>
          <td>
            <input class="stockInput" type="number" min="0" value="${x.stock ?? 0}">
          </td>
          <td>
            <button data-id="${d.id}" data-action="save">Save</button>
            <button data-id="${d.id}" data-action="delete">Delete</button>
          </td>
        </tr>
      `;
    });
  });

  document.getElementById("addItemBtn").addEventListener("click", async () => {
    const name = newName.value.trim();
    if (!name) return alert("Item name required");

    await addDoc(itemsCol, {
      article: newArticle.value,
      name,
      category: newCategory.value,
      stock: Number(newStock.value) || 0,
      createdAt: Date.now()
    });

    newArticle.value = newName.value = newCategory.value = "";
    newStock.value = 0;
  });

  tbody.addEventListener("click", async e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    const row = btn.closest("tr");

    if (btn.dataset.action === "delete") {
      if (confirm("Delete item?")) await deleteDoc(doc(db, "items", id));
    }

    if (btn.dataset.action === "save") {
      const val = Number(row.querySelector(".stockInput").value);
      if (val < 0) return alert("Invalid stock");
      await updateDoc(doc(db, "items", id), { stock: val });
    }
  });
}