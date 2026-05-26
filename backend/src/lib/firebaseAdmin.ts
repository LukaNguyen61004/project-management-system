import admin from "firebase-admin";

import serviceAccount from "../../project-managment-system-484e2-firebase-adminsdk-fbsvc-5de575a2be.json" with {type: "json"};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
