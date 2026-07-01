import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { startStaleIssueJob } from "./cronjobs/staleIssue.job.js"

const PORT =  process.env.PORT || 5000;

app.listen(PORT, ()=>{
  console.log(`Server started on port http://localhost:${PORT}`);

  startStaleIssueJob()
})