import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Investor } from "@/types";

const COLLECTION = "investors";

export async function createInvestor(
  data: Omit<Investor, "id" | "createdAt">
) {
  return await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getInvestors(): Promise<Investor[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Investor
  );
}

export async function updateInvestor(
  id: string,
  data: Partial<Investor>
) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteInvestor(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
