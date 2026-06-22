import { vi } from "vitest";

// In-Memory Database State
export interface MockDatabase {
  users: Record<string, any>;
  inventory: Record<string, Record<string, any>>;
  progress: Record<string, Record<string, any>>;
  achievements: Record<string, Record<string, any>>;
}

export let mockDb: MockDatabase = {
  users: {},
  inventory: {},
  progress: {},
  achievements: {},
};

// Reset database state between tests
export const resetMockDb = () => {
  mockDb = {
    users: {},
    inventory: {},
    progress: {},
    achievements: {},
  };
  snapshotListeners.length = 0;
};

// Mock Auth State
export let mockCurrentUser: any = null;
let authStateListeners: Array<(user: any) => void> = [];

export const setMockUser = (user: any) => {
  if (user) {
    if (!user.getIdTokenResult) {
      user.getIdTokenResult = async () => ({ claims: { role: user.role || "user" } });
    }
    if (!user.getIdToken) {
      user.getIdToken = async () => "mock-token-id";
    }
    if (user.emailVerified === undefined) {
      user.emailVerified = true;
    }
    if (!user.reload) {
      user.reload = async () => Promise.resolve();
    }
  }
  mockCurrentUser = user;
  authStateListeners.forEach((listener) => listener(user));
};

// Snapshot listeners registry
export interface Listener {
  path: string;
  callback: (snapshot: any) => void;
  isCollection: boolean;
}

export const snapshotListeners: Listener[] = [];

// Helper to get firestore data by path
export const getFirestoreData = (path: string): any => {
  const parts = path.split("/");
  if (parts[0] === "Users") {
    if (parts.length === 2) {
      const uid = parts[1];
      return mockDb.users[uid];
    }
    // Users/{uid}/Inventory
    if (parts.length === 3 && parts[2] === "Inventory") {
      const uid = parts[1];
      return mockDb.inventory[uid] || {};
    }
    // Users/{uid}/Inventory/{itemId}
    if (parts.length === 4 && parts[2] === "Inventory") {
      const uid = parts[1];
      const itemId = parts[3];
      return mockDb.inventory[uid]?.[itemId];
    }
    // Users/{uid}/Achievements
    if (parts.length === 3 && parts[2] === "Achievements") {
      const uid = parts[1];
      return mockDb.achievements[uid] || {};
    }
    // Users/{uid}/Achievements/{achievementId}
    if (parts.length === 4 && parts[2] === "Achievements") {
      const uid = parts[1];
      const achievementId = parts[3];
      return mockDb.achievements[uid]?.[achievementId];
    }
    // Users/{uid}/Progress/...
    if (parts[2] === "Progress") {
      const uid = parts[1];
      const subPath = parts.slice(3).join("/");
      return mockDb.progress[uid]?.[subPath];
    }
  }
  
  if (parts[0] === "Achievements" && parts.length === 2) {
    const subject = parts[1];
    return {
      ach_first_steps: {
        title: "First Steps",
        coinsReward: 100,
        expReward: 50,
        unlockCondition: {
          levelId: "Level1",
          lessonId: "Lesson1",
          subject: subject
        }
      }
    };
  }
  
  const subjects = ["Html", "Css", "JavaScript", "Database"];
  if (subjects.includes(parts[0])) {
    if (parts.length === 6 && parts[4] === "Stages") {
      const stageId = parts[5];
      let type = "Lesson";
      if (stageId === "Stage2") type = "BrainBytes";
      if (stageId === "Stage3") type = "CodeCrafter";
      return {
        id: stageId,
        type,
        title: `${stageId} Title`,
        description: `${stageId} Description`,
      };
    }
  }
  return null;
};

// Helper to trigger snapshot updates manually or automatically
export const triggerSnapshot = (path: string) => {
  snapshotListeners.forEach((listener) => {
    const isExactMatch = listener.path === path;
    const isParentMatch = !listener.isCollection && path.startsWith(listener.path + "/");
    const isCollectionParentMatch = listener.isCollection && path.startsWith(listener.path + "/") && path.split("/").length === listener.path.split("/").length + 1;
    
    if (isExactMatch || isParentMatch || isCollectionParentMatch) {
      if (listener.isCollection) {
        const dataMap = getFirestoreData(listener.path) || {};
        const docs = Object.entries(dataMap).map(([id, val]) => ({
          id,
          exists: () => true,
          data: () => val,
        }));
        listener.callback({
          docs,
          forEach: (cb: any) => docs.forEach(cb),
        });
      } else {
        const data = getFirestoreData(listener.path);
        listener.callback({
          exists: () => data !== undefined && data !== null,
          data: () => data,
          id: listener.path.split("/").pop() || "",
        });
      }
    }
  });
};

const resolveIncrementValue = (currentVal: any, fieldValue: any) => {
  if (fieldValue && typeof fieldValue === "object" && fieldValue.__type === "increment") {
    const base = typeof currentVal === "number" ? currentVal : 0;
    return base + fieldValue.value;
  }
  return fieldValue;
};

const resolveFields = (currentData: any, updateData: any) => {
  const result = { ...(currentData || {}) };
  for (const [key, val] of Object.entries(updateData)) {
    result[key] = resolveIncrementValue(result[key], val);
  }
  return result;
};

// Mock Firebase Auth
vi.mock("firebase/auth", () => {
  return {
    getAuth: () => ({
      get currentUser() { return mockCurrentUser; },
      onAuthStateChanged: (callback: (user: any) => void) => {
        authStateListeners.push(callback);
        callback(mockCurrentUser);
        return () => {
          authStateListeners = authStateListeners.filter((l) => l !== callback);
        };
      },
      signOut: async () => {
        setMockUser(null);
        return Promise.resolve();
      },
      setPersistence: async () => Promise.resolve(),
    }),
    onAuthStateChanged: (auth: any, callback: (user: any) => void) => {
      authStateListeners.push(callback);
      callback(mockCurrentUser);
      return () => {
        authStateListeners = authStateListeners.filter((l) => l !== callback);
      };
    },
    signOut: async () => {
      setMockUser(null);
      return Promise.resolve();
    },
    signInWithEmailAndPassword: async (auth: any, email: string) => {
      const matchedUser = Object.values(mockDb.users).find((u) => u.email === email);
      if (!matchedUser) {
        throw { code: "auth/invalid-credential" };
      }
      const userObj = {
        uid: matchedUser.uid,
        email: matchedUser.email,
        emailVerified: matchedUser.emailVerified ?? true,
        getIdTokenResult: async () => ({ claims: { role: matchedUser.role || "user" } }),
        getIdToken: async () => "mock-token-id",
        reload: async () => Promise.resolve(),
      };
      setMockUser(userObj);
      return { user: userObj };
    },
    createUserWithEmailAndPassword: async (auth: any, email: string) => {
      const uid = "user_" + Math.random().toString(36).substr(2, 9);
      const newUser = { uid, email, role: "user", emailVerified: true };
      mockDb.users[uid] = newUser;
      const userObj = {
        uid,
        email,
        emailVerified: true,
        getIdTokenResult: async () => ({ claims: { role: "user" } }),
        getIdToken: async () => "mock-token-id",
        reload: async () => Promise.resolve(),
      };
      return { user: userObj };
    },
    sendEmailVerification: async () => Promise.resolve(),
    sendPasswordResetEmail: async () => Promise.resolve(),
    setPersistence: async () => Promise.resolve(),
    browserLocalPersistence: "local",
    browserSessionPersistence: "session",
  };
});

// Mock Firebase Firestore
vi.mock("firebase/firestore", () => {
  return {
    getFirestore: () => ({}),
    doc: (db: any, ...paths: string[]) => {
      return { path: paths.join("/") };
    },
    collection: (db: any, ...paths: string[]) => {
      return { path: paths.join("/") };
    },
    getDoc: async (docRef: { path: string }) => {
      const data = getFirestoreData(docRef.path);
      return {
        exists: () => data !== undefined && data !== null,
        data: () => data,
        id: docRef.path.split("/").pop() || "",
      };
    },
    getDocs: async (collRef: { path: string }) => {
      const dataMap = getFirestoreData(collRef.path);
      const docs = Object.entries(dataMap || {}).map(([id, val]) => ({
        id,
        exists: () => true,
        data: () => val,
      }));
      return {
        docs,
        forEach: (cb: (doc: any) => void) => docs.forEach(cb),
      };
    },
    setDoc: async (docRef: { path: string }, data: any) => {
      const parts = docRef.path.split("/");
      if (parts[0] === "Users") {
        if (parts.length === 2) {
          const uid = parts[1];
          mockDb.users[uid] = resolveFields(mockDb.users[uid], data);
        } else if (parts.length === 4 && parts[2] === "Inventory") {
          const uid = parts[1];
          const itemId = parts[3];
          if (!mockDb.inventory[uid]) mockDb.inventory[uid] = {};
          mockDb.inventory[uid][itemId] = resolveFields(mockDb.inventory[uid][itemId], data);
        } else if (parts.length === 4 && parts[2] === "Achievements") {
          const uid = parts[1];
          const achievementId = parts[3];
          if (!mockDb.achievements[uid]) mockDb.achievements[uid] = {};
          mockDb.achievements[uid][achievementId] = resolveFields(mockDb.achievements[uid][achievementId], data);
        } else if (parts[2] === "Progress") {
          const uid = parts[1];
          const subPath = parts.slice(3).join("/");
          if (!mockDb.progress[uid]) mockDb.progress[uid] = {};
          mockDb.progress[uid][subPath] = resolveFields(mockDb.progress[uid][subPath], data);
        }
      }
      triggerSnapshot(docRef.path);
      const parentPath = parts.slice(0, -1).join("/");
      triggerSnapshot(parentPath);
      return Promise.resolve();
    },
    updateDoc: async (docRef: { path: string }, data: any) => {
      const parts = docRef.path.split("/");
      if (parts[0] === "Users") {
        if (parts.length === 2) {
          const uid = parts[1];
          mockDb.users[uid] = resolveFields(mockDb.users[uid], data);
        } else if (parts.length === 4 && parts[2] === "Inventory") {
          const uid = parts[1];
          const itemId = parts[3];
          if (!mockDb.inventory[uid]) mockDb.inventory[uid] = {};
          mockDb.inventory[uid][itemId] = resolveFields(mockDb.inventory[uid][itemId], data);
        } else if (parts.length === 4 && parts[2] === "Achievements") {
          const uid = parts[1];
          const achievementId = parts[3];
          if (!mockDb.achievements[uid]) mockDb.achievements[uid] = {};
          mockDb.achievements[uid][achievementId] = resolveFields(mockDb.achievements[uid][achievementId], data);
        } else if (parts[2] === "Progress") {
          const uid = parts[1];
          const subPath = parts.slice(3).join("/");
          if (!mockDb.progress[uid]) mockDb.progress[uid] = {};
          mockDb.progress[uid][subPath] = resolveFields(mockDb.progress[uid][subPath], data);
        }
      }
      triggerSnapshot(docRef.path);
      const parentPath = parts.slice(0, -1).join("/");
      triggerSnapshot(parentPath);
      return Promise.resolve();
    },
    deleteDoc: async (docRef: { path: string }) => {
      const parts = docRef.path.split("/");
      if (parts[0] === "Users") {
        if (parts.length === 2) {
          const uid = parts[1];
          delete mockDb.users[uid];
        } else if (parts.length === 4 && parts[2] === "Inventory") {
          const uid = parts[1];
          const itemId = parts[3];
          if (mockDb.inventory[uid]) {
            delete mockDb.inventory[uid][itemId];
          }
        } else if (parts.length === 4 && parts[2] === "Achievements") {
          const uid = parts[1];
          const achievementId = parts[3];
          if (mockDb.achievements[uid]) {
            delete mockDb.achievements[uid][achievementId];
          }
        } else if (parts[2] === "Progress") {
          const uid = parts[1];
          const subPath = parts.slice(3).join("/");
          if (mockDb.progress[uid]) {
            delete mockDb.progress[uid][subPath];
          }
        }
      }
      triggerSnapshot(docRef.path);
      const parentPath = parts.slice(0, -1).join("/");
      triggerSnapshot(parentPath);
      return Promise.resolve();
    },
    increment: (val: number) => {
      return {
        __type: "increment",
        value: val,
      };
    },
    onSnapshot: (ref: any, callback: any) => {
      const path = ref.path;
      const isCollection = path.split("/").length % 2 === 1;
      const listener: Listener = { path, callback, isCollection };
      snapshotListeners.push(listener);
      
      if (isCollection) {
        const dataMap = getFirestoreData(path) || {};
        const docs = Object.entries(dataMap).map(([id, val]) => ({
          id,
          exists: () => true,
          data: () => val,
        }));
        callback({
          docs,
          forEach: (cb: any) => docs.forEach(cb),
        });
      } else {
        const data = getFirestoreData(path);
        callback({
          exists: () => data !== undefined && data !== null,
          data: () => data,
          id: path.split("/").pop() || "",
        });
      }
      
      return () => {
        const index = snapshotListeners.indexOf(listener);
        if (index > -1) {
          snapshotListeners.splice(index, 1);
        }
      };
    },
  };
});
