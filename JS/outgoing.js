import {
  collection, addDoc, getDocs, query, where, limit,
  doc, updateDoc, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase.js";

const outgoingCol = collection(db, "outgoing");
const itemsCol = collection(db, "items");

async function findItemByName(name) {
  const q = query(itemsCol, where("name", "==", name), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0];
}

function parseReleaseItem(text) {
  const t = (text || "").trim();
  const match = t.match(/#\s*(\d+)\s+(.*)/);
  if (!match) return { name: t };
  return { name: match[2].trim() };
}

export function initOutgoing() {
  // ✅ show outgoing table if you have <tbody id="outgoingBody"></tbody>
  const outgoingBody = document.getElementById("outgoingBody");
  if (outgoingBody) {
    onSnapshot(query(outgoingCol, orderBy("createdAt", "desc")), (snap) => {
      outgoingBody.innerHTML = "";
      snap.forEach((d) => {
        const x = d.data();
        outgoingBody.innerHTML += `
          <tr>
            <td>${x.item ?? ""}</td>
            <td>${x.qty ?? ""}</td>
            <td>${x.releasedTo ?? ""}</td>
            <td>${x.remarks ?? ""}</td>
            <td>${x.createdAt ? new Date(x.createdAt).toLocaleString() : ""}</td>
          </tr>
        `;
      });
    });
  }

  const form = document.getElementById("releasingForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const releaseText = document.getElementById("releaseItem").value.trim();
    const qty = Number(document.getElementById("qtyOut").value);
    const releasedTo = document.getElementById("releasedTo").value.trim();
    const remarks = document.getElementById("remarks").value.trim();

    if (!releaseText || !releasedTo) return alert("Fill Item and Released To");
    if (!qty || qty <= 0) return alert("Invalid QuantityOut");

    const { name } = parseReleaseItem(releaseText);
    const found = await findItemByName(name);
    if (!found) return alert("Item not found in inventory");

    const current = Number(found.data().stock ?? 0);
    if (qty > current) return alert(`Not enough stock. Current stock: ${current}`);

    await updateDoc(doc(db, "items", found.id), { stock: current - qty });

    await addDoc(outgoingCol, {
      item: name,
      qty,
      releasedTo,
      remarks,
      createdAt: Date.now()
    });

    alert("✅ Releasing Form submitted! Stock updated.");
    form.reset();
  });
}
