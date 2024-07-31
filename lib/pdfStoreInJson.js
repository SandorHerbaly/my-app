// lib/pdfStoreInJson.js
import { db } from './firebase.config';
import { collection, addDoc } from "firebase/firestore";

export const storeInvoiceData = async (invoiceData) => {
  try {
    const docRef = await addDoc(collection(db, "invoices"), invoiceData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
