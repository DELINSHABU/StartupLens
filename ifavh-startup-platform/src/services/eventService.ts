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
import { Event } from "@/types";

const COLLECTION = "events";

export async function createEvent(
  data: Omit<Event, "id" | "createdAt">
) {
  return await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getEvents(): Promise<Event[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Event
  );
}

export async function updateEvent(
  id: string,
  data: Partial<Event>
) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
