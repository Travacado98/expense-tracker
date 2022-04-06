/*
  Expense Tracker
  Create a web application for tracking expenses
  
  Requirements:
  + Allow users to add an expense item to a list with:
    - Description (required)
    - Amount (required)
    - Date (optional)
  + Allow users to delete expense items
  + Allow users to edit existing expense items in the list

  Notes:
  + The Amount should be saved as a number, but displayed with a dollar sign in the list
  + Deletion should be confirmed by the user with a browser confirmation popup
  + Save the application state to the browser so that it persists on refresh
  + The site should be mobile responsive and have a clean & friendly UI/UX
  + The list should be sorted by the Date with the newest entries at the top, oldest at the bottom

  BONUS CHALLENGES:
  + Allow the user to change the sort based on any of the fields ascending or descending
  + Ensure that the user cannot type more than 2 decimal places in the Amount input field (ensure input is a valid USD currency format)
  + Display "Yesterday" and "Today" for the dates in the list when they are yesterday or today respectively
*/

import {
  db,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "./firebase.js";

let expenseList = [];
let total = 0;

const getExpenses = () => {
  const q = query(collection(db, "expenses"));

  onSnapshot(q, (querySnapshot) => {
    expenseList = [];

    querySnapshot.forEach((doc) => {
      const date = doc.data().date;

      const expenseObj = {
        ...doc.data(),
        _id: doc.id,
        date: date ? date.toDate().toDateString() : null,
      };

      expenseList.push(expenseObj);
    });

    renderExpenses();
    calculateTotal();
  });
};

getExpenses();

// Create our number formatter.
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Calculate total
const calculateTotal = () => {
  let newTotal = 0;

  expenseList.forEach((expenseObj) => {
    newTotal += expenseObj.amount;
  });
  total = newTotal;
  document.getElementById("total").textContent = formatter.format(total);
};

// Adding Entries
const addExpense = async (e) => {
  e.preventDefault();

  const date = document.getElementById("Date").value;

  const expenseObj = {
    name: document.getElementById("Name").value,
    amount: parseFloat(document.getElementById("Amount").value),
    date: date ? new Date(`${date} 00:00`).toDateString() : null,
    id: Date.now(),
  };

  addDoc(collection(db, "expenses"), {
    ...expenseObj,
    date: date ? new Date(expenseObj.date) : null,
  });
};

const renderExpenses = () => {
  document.getElementById("expenseList").innerHTML = "";
  expenseList.forEach(renderExpense);
};

const renderExpense = (expenseObj) => {
  const expenseElm = document.createElement("div");

  expenseElm.className = "expense-item";
  expenseElm.id = expenseObj.id;

  const nameSpan = document.createElement("span");
  const amountSpan = document.createElement("span");
  const dateSpan = document.createElement("span");
  const deleteButton = document.createElement("button");
  const editButton = document.createElement("button");

  nameSpan.textContent = expenseObj.name;
  amountSpan.textContent = formatter.format(expenseObj.amount);
  dateSpan.textContent = expenseObj.date;
  editButton.textContent = "Edit";
  deleteButton.textContent = "X";

  deleteButton.onclick = () => deleteExpense(expenseObj.id);
  editButton.onclick = () => openEditModal(expenseObj.id);

  expenseElm.appendChild(nameSpan);
  expenseElm.appendChild(amountSpan);
  expenseElm.appendChild(dateSpan);
  expenseElm.appendChild(editButton);
  expenseElm.appendChild(deleteButton);

  document.getElementById("expenseList").appendChild(expenseElm);
};

// Delete Entries

const deleteExpense = (id) => {
  const index = expenseList.findIndex((expenseObj) => {
    return expenseObj.id === id;
  });
  deleteDoc(doc(db, "expenses", expenseList[index]._id));
};

// Modal
let editItem;

const editExpense = (e) => {
  e.preventDefault();

  const date = document.getElementById("edit-date").value;

  const expenseObj = {
    name: document.getElementById("edit-name").value,
    amount: parseFloat(document.getElementById("edit-amount").value),
    date: date ? new Date(`${date} 00:00`).toDateString() : null,
    id: Date.now(),
  };

  updateDoc(doc(db, "expenses", editItem._id), {
    ...expenseObj,
    date: date ? new Date(expenseObj.date) : null,
  });
  closeEditModal();
};

const editModal = document.getElementById("edit-modal");

const openEditModal = (id) => {
  editItem = expenseList.find((expenseObj) => {
    return expenseObj.id === id;
  });

  document.getElementById("edit-name").value = editItem.name;
  document.getElementById("edit-amount").value = editItem.amount;
  document.getElementById("edit-date").valueAsDate = new Date(editItem.date);

  editModal.classList.add("open");
};

const closeEditModal = () => {
  editModal.classList.remove("open");
};

editModal.onclick = (event) => {
  if (event.target === editModal) closeEditModal();
};

window.addExpense = addExpense;
window.editExpense = editExpense;
