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
import { FundingRound } from "@/types";

const COLLECTION = "fundingRounds";

export async function createFundingRound(
  data: Omit<FundingRound, "id" | "createdAt">
) {
  return await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getFundingRounds(): Promise<FundingRound[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as FundingRound
  );
}

export async function updateFundingRound(
  id: string,
  data: Partial<FundingRound>
) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteFundingRound(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}
