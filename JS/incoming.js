import {
  collection, addDoc, query, orderBy, onSnapshot,
  getDocs, where, limit, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { db } from "./firebase.js";

const incomingCol = collection(db, "incoming");
const itemsCol = collection(db, "items");

// DATE FORMAT//
function formatDateTime(value) {
  if (!value) return "";

  // if it's already a timestamp (number)
  if (typeof value === "number") {
    return new Date(value).toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  // if it's from datetime-local input (YYYY-MM-DDTHH:mm)
  return new Date(value).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}


// "# 103 HRT Jade Tissue" -> { name: "HRT Jade Tissue" }
function parseWarehouseArticle(text) {
  const t = (text || "").trim();
  const match = t.match(/#\s*(\d+)\s+(.*)/);
  if (!match) return { name: t };
  return { name: match[2].trim() };
}


async function findItem(article, name) {
  // 1) match by article first
  if (article) {
    const q1 = query(itemsCol, where("article", "==", article), limit(1));
    const s1 = await getDocs(q1);
    if (!s1.empty) return { doc: s1.docs[0], matchedBy: "article" };
  }

  // 2) fallback match by name
  const q2 = query(itemsCol, where("name", "==", name), limit(1));
  const s2 = await getDocs(q2);
  if (!s2.empty) return { doc: s2.docs[0], matchedBy: "name" };

  return null;
}

export function initIncoming() {
  // ✅ incoming table
  const incomingBody = document.getElementById("incomingBody");
  if (incomingBody) {
    onSnapshot(query(incomingCol, orderBy("createdAt", "desc")), (snap) => {
      incomingBody.innerHTML = "";
      snap.forEach((d) => {
        const x = d.data();
        incomingBody.innerHTML += `
          <tr>
            <td>${formatDateTime(x.date)}</td>
            <td>${x.item ?? ""}</td>
            <td>${x.qty ?? ""}</td>
            <td>${x.warehouseArticle ?? ""}</td>
            <td>${x.price ?? ""}</td>
            <td>${x.article ?? ""}</td>
          </tr>
        `;
      });
    });
  }

  //  form submit
  const form = document.getElementById("receivingForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    //  GRN + article merged here
    const article = document.getElementById("inArticle").value.trim();


    const whText = document.getElementById("warehouseArticle").value.trim();
    const qty = Number(document.getElementById("qtyIn").value);
    const price = Number(document.getElementById("price").value);
    const date = document.getElementById("dateIn").value;

    const categoryInput = (document.getElementById("inCategory")?.value || "").trim();

    if (!article) return alert("Please enter Article #");
    if (!whText) return alert("Please fill Warehouse Article");
    if (!qty || qty <= 0) return alert("Invalid QuantityIN");
    if (!categoryInput) return alert("Please enter Category");

    const parsed = parseWarehouseArticle(whText);
    const name = parsed.name;

    if (!name) return alert("Invalid Warehouse Article");

    const foundWrap = await findItem(article, name);

    if (foundWrap) {
      const found = foundWrap.doc;
      const data = found.data();

      const currentStock = Number(data.stock ?? 0);
      const currentCategory = (data.category ?? "").trim();
      const currentArticle = (data.article ?? "").trim();

      //  If matched by NAME but article conflicts, stop.
      if (
        foundWrap.matchedBy === "name" &&
        article &&
        currentArticle &&
        article !== currentArticle
      ) {
        return alert(
          `This item already exists with Article #${currentArticle}.\n` +
          `You typed Article #${article}.\n\n` +
          `Fix the Article # in GRN to match, then submit again.`
        );
      }

      const updates = { stock: currentStock + qty };

      //  update category only if empty/N/A
      if (!currentCategory || currentCategory.toLowerCase() === "n/a") {
        updates.category = categoryInput;
      }

      //  update article if missing (but normally it already exists)
      if (!currentArticle && article) {
        updates.article = article;
      }

      await updateDoc(doc(db, "items", found.id), updates);
    } else {
      //  create new item with correct article + category
      await addDoc(itemsCol, {
        article,
        name,
        category: categoryInput,
        stock: qty,
        createdAt: Date.now()
      });
    }

    //  log receiving report
      await addDoc(incomingCol, {
    warehouseArticle: whText,
    item: name,
    qty,
    price: isNaN(price) ? 0 : price,
    date,
    category: categoryInput,
    article,
    createdAt: Date.now()
  });


    alert(" Receiving Report submitted! Inventory updated.");
    form.reset();
  });
}
