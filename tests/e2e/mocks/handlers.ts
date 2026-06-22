import { http, HttpResponse } from "msw";
import { mockDb } from "./mockFirebase";

export const handlers = [
  // User Profile
  http.get("*/fireBase/getSpecificUser/:uid", ({ params, request }) => {
    const uid = params.uid as string;
    console.log("[MSW] getSpecificUser hit for UID:", uid, "URL:", request.url);
    const userData = mockDb.users[uid] || {
      uid,
      email: "test@example.com",
      username: "testuser",
      exp: 0,
      userLevel: 1,
      coins: 100,
      bio: "",
    };
    console.log("[MSW] Returning userData:", userData);
    return HttpResponse.json(userData);
  }),

  // User Progress
  http.get("*/fireBase/userProgres/:subject", ({ params }) => {
    return HttpResponse.json({
      allProgress: {
        "Lesson1-Level1": { isActive: true }
      },
      allStages: {
        "Lesson1-Level1-Stage1": { isActive: true, isCompleted: true },
        "Lesson1-Level1-Stage2": { isActive: true, isCompleted: false },
        "Lesson1-Level1-Stage3": { isActive: false, isCompleted: false }
      },
      allStagesComplete: {
        "Lesson1-Level1-Stage1": true
      },
      completedLevels: 0,
      completedStages: 1,
    });
  }),

  // Curriculum Data
  http.get("*/fireBase/getAllData/:subject", ({ params }) => {
    return HttpResponse.json([
      {
        id: "Lesson1",
        Lesson: "1",
        levels: [
          {
            id: "Level1",
            title: "Syntax Basics",
            description: "Learn the foundational syntax of the language.",
            stages: [
              {
                id: "Stage1",
                title: "Intro Stage",
                description: "Basic concepts of the language.",
                type: "Lesson",
                order: 1
              },
              {
                id: "Stage2",
                title: "BrainBytes MC Challenge",
                description: "Multiple choice challenge.",
                type: "BrainBytes",
                order: 2
              },
              {
                id: "Stage3",
                title: "Boss Challenge",
                description: "Complete boss coding challenge.",
                type: "CodeCrafter",
                order: 3
              }
            ]
          }
        ]
      }
    ]);
  }),

  // Shop Items
  http.get("*/fireBase/Shop", () => {
    return HttpResponse.json([
      {
        id: "item_shield",
        name: "Code Shield",
        description: "Protects your streak",
        cost: 50,
        type: "item",
        image: "shield.png"
      },
      {
        id: "item_double_xp",
        name: "Double XP Potion",
        description: "Doubles XP for 1 hour",
        cost: 200,
        type: "item",
        image: "potion.png"
      }
    ]);
  }),

  // Achievements List
  http.get("*/fireBase/achievements/:category", ({ params }) => {
    return HttpResponse.json({
      ach_first_steps: {
        title: "First Steps",
        description: "Complete your first lesson.",
        coinsReward: 100,
        expReward: 50,
        order: 1,
      },
      ach_master: {
        title: "Subject Master",
        description: "Complete all lessons in the subject.",
        coinsReward: 500,
        expReward: 250,
        order: 2,
      }
    });
  }),

  // Mock Purchase Item Endpoint
  http.post("*/fireBase/purchaseItem", async ({ request }) => {
    const body = (await request.json()) as any;
    if (body?.itemId === "item_fail_500") {
      return new HttpResponse(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
    return HttpResponse.json({ success: true, message: "Purchase completed" });
  }),

  // Mock OpenAI Sandbox Evaluation Endpoint
  http.post("*/openAI/codePlaygroundEval", async ({ request }) => {
    return HttpResponse.json({
      success: true,
      stdout: "Hello Devlab!",
      evaluation: "pass",
      feedback: "Code compiles and runs flawlessly.",
    });
  }),

  // Mock CodeCrafter OpenAI Endpoint
  http.post("*/openAI/codeCrafter", async () => {
    return HttpResponse.json({
      response: JSON.stringify({
        correct: true,
        feedback: "Code compiles and runs flawlessly.",
      })
    });
  }),

  // Mock BugBust OpenAI Endpoint
  http.post("*/openAI/bugBust", async () => {
    return HttpResponse.json({
      response: JSON.stringify({
        correct: true,
        feedback: "Bug resolved correctly.",
      })
    });
  }),

  // Mock CodeRush OpenAI Endpoint
  http.post("*/openAI/codeRush", async () => {
    return HttpResponse.json({
      response: JSON.stringify({
        correct: true,
        feedback: "Code challenge completed on time.",
      })
    });
  }),

  // Mock Unlock Stage Endpoint
  http.post("*/fireBase/unlockStage", async ({ request }) => {
    const body = (await request.json()) as any;
    const { stageId } = body || {};
    if (stageId === "Stage2") {
      return HttpResponse.json({ isNextLevelUnlocked: true });
    }
    return HttpResponse.json({
      isNextStageUnlocked: true,
      nextStageId: "Stage2",
      nextStageType: "BrainBytes"
    });
  }),
];
