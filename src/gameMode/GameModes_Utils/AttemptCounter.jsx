
// import { create } from "zustand";
// import { doc, increment, onSnapshot, updateDoc } from "firebase/firestore";
// import { auth, db } from "../../Firebase/Firebase";

// const getRef = async () => {
//   const uid = auth.currentUser?.uid;
//   if (!uid) throw new Error("User UID is undefined");
//   return doc(db, "Users", uid);
// };

// export const useAttemptStore = create((set, get) => ({
//   heart: 0,
//   roundKey: 0,
//   gameOver: false,
//   loadHearts: async () => {
//     const userRef = await getRef();
//     const unsub = onSnapshot(userRef, (snap) => {
//       const healthSnapShot = snap.data()?.healthPoints ?? 0;
//       set({
//         heart: healthSnapShot,
//         gameOver: healthSnapShot <= 0,
//       });
//     });
//     return unsub;
//   },
//   submitAttempt: async (isCorrect) => {
//     const { heart, gameOver } = get();
//     if (isCorrect || gameOver) return;
//     // Just decrement — shield logic will be handled outside
//     const userRef = await getRef();
//     await updateDoc(userRef, { healthPoints: increment(-1) });

//     set((state) => ({
//       roundKey: heart > 1 ? state.roundKey + 1 : state.roundKey,
//     }));
//   },

//   resetHearts: async () => {
//     const userRef = await getRef();
//     await updateDoc(userRef, { healthPoints: 3 });
//     set((state) => ({
//       roundKey: state.roundKey + 1,
//       gameOver: false,
//     }));
//   },
// }));
