import { readFileSync } from "node:fs";
const url = new URL(readFileSync("deployment-url.txt", "utf8").trim());
if (url.protocol !== "https:") throw Error("Invalid deployment URL");
for (const path of ["/", "/admin"]) {
  const response = await fetch(new URL(path, url));
  if (
    !response.ok ||
    !(await response.text()).includes("Central · Demandas da equipe")
  )
    throw Error("Published route verification failed");
}
console.log(
  "Published requester and administrator SPA routes responded successfully. Complete authenticated and phone/QR acceptance separately.",
);
