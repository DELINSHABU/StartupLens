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
import { Startup } from "@/types";

const COLLECTION = "startups";

export async function createStartup(
  data: Omit<Startup, "id" | "createdAt">
) {
  return await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getStartups(): Promise<Startup[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Startup
  );
}

export async function updateStartup(
  id: string,
  data: Partial<Startup>
) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteStartup(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
