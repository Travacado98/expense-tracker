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
let addFormSubmitted;
let editFormSubmitted;

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

  if (newTotal > 0) {
    document.getElementById("total").style.color = "#529D41";
  } else {
    document.getElementById("total").style.color = "#E04545";
  }

  total = newTotal;
  document.getElementById("total").textContent = formatter.format(total);
};

// Adding Entries
const addExpense = async (e) => {
  e.preventDefault();
  addFormSubmitted = true;

  if (!checkFormValidity("add")) return;

  const name = document.getElementById("add-name").value;
  const amount = document.getElementById("add-amount").value;
  const date = document.getElementById("add-date").value;

  const expenseObj = {
    name,
    amount: parseFloat(amount),
    date: date ? new Date(`${date} 00:00`).toDateString() : null,
    id: Date.now(),
  };

  addDoc(collection(db, "expenses"), {
    ...expenseObj,
    date: date ? new Date(expenseObj.date) : null,
  });

  document.getElementById("add-name").value = "";
  document.getElementById("add-amount").value = "";
  document.getElementById("add-date").value = "";

  addFormSubmitted = false;
};

const editExpense = (e) => {
  e.preventDefault();

  editFormSubmitted = true;

  if (!checkFormValidity("edit")) return;

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
  editFormSubmitted = false;
};

const checkFormValidity = (form) => {
  if (
    (form === "add" && !addFormSubmitted) ||
    (form === "edit" && !editFormSubmitted)
  ) {
    return true;
  }

  const name = document.getElementById(`${form}-name`).value;
  const amount = document.getElementById(`${form}-amount`).value;

  if (!name) {
    document.getElementById(`${form}-name`).classList.add(`invalid`);
  } else {
    document.getElementById(`${form}-name`).classList.remove(`invalid`);
  }
  if (!amount) {
    document.getElementById(`${form}-amount`).classList.add(`invalid`);
  } else {
    document.getElementById(`${form}-amount`).classList.remove(`invalid`);
  }

  return name && amount;
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
  const buttonDiv = document.createElement("div");
  const deleteButton = document.createElement("button");
  const editButton = document.createElement("button");
  const editIcon = document.createElement("span");
  const editSpan = document.createElement("span");
  const deleteIcon = document.createElement("span");
  const deleteSpan = document.createElement("span");

  nameSpan.textContent = expenseObj.name;
  amountSpan.textContent = formatter.format(expenseObj.amount);
  dateSpan.textContent = expenseObj.date;
  editSpan.textContent = "Edit";
  deleteSpan.textContent = "Delete";
  editIcon.textContent = "edit";
  deleteIcon.textContent = "delete";

  editButton.appendChild(editIcon);
  editButton.appendChild(editSpan);
  deleteButton.appendChild(deleteIcon);
  deleteButton.appendChild(deleteSpan);

  if (expenseObj.amount < 0) {
    amountSpan.classList.add("negative");
  }

  editIcon.classList.add("material-icons");
  deleteIcon.classList.add("material-icons");
  buttonDiv.classList.add("button-row");

  editButton.classList.add("edit-button");
  deleteButton.classList.add("delete-button");
  nameSpan.classList.add("name-span");
  amountSpan.classList.add("amount-span");
  dateSpan.classList.add("date-span");

  deleteButton.onclick = () => deleteExpense(expenseObj.id);
  editButton.onclick = () => openEditModal(expenseObj.id);

  expenseElm.appendChild(nameSpan);
  expenseElm.appendChild(amountSpan);
  expenseElm.appendChild(dateSpan);
  expenseElm.appendChild(buttonDiv);

  buttonDiv.appendChild(editButton);
  buttonDiv.appendChild(deleteButton);

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

const editModal = document.getElementById("edit-modal");

const openEditModal = (id) => {
  editItem = expenseList.find((expenseObj) => {
    return expenseObj.id === id;
  });

  document.getElementById("edit-name").value = editItem.name;
  document.getElementById("edit-amount").value = editItem.amount;

  if (editItem.date) {
    document.getElementById("edit-date").valueAsDate = new Date(editItem.date);
  } else {
    document.getElementById("edit-date").value = "";
  }
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
window.checkFormValidity = checkFormValidity;
