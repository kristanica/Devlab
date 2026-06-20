import axios from "axios";
import { auth } from "../../../Firebase/Firebase";

const addStage = async ({ category, lessonId, levelId }) => {
    const token = await auth.currentUser?.getIdToken(true);

    try{
    const res = await axios.post(
    `
https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/addStage`,
    { category, lessonId, levelId },
    {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    }
    );
    return res.data;
}catch (error) {
    console.error("Error Adding Stage:", error);
    throw error;
}
};

export default addStage;
