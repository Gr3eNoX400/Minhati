import { Router } from "express";
import { verifiedUsers } from "./telegram";

const router = Router();

const ADMIN_TOKEN = process.env["ADMIN_TOKEN"] ?? "minhati-admin-2024";

function requireAdmin(req: Parameters<Parameters<typeof router.use>[0]>[0], res: Parameters<Parameters<typeof router.use>[0]>[1], next: Parameters<Parameters<typeof router.use>[0]>[2]) {
  const token = req.headers["x-admin-token"] ?? req.query["token"];
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  next();
}

router.get("/admin/stats", requireAdmin, (_req, res) => {
  const users = Array.from(verifiedUsers.values());
  res.json({
    totalVerified: users.length,
    telegramLinked: users.filter((u) => u.chatId).length,
    uptime: process.uptime(),
    memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

router.get("/admin/users", requireAdmin, (_req, res) => {
  const users = Array.from(verifiedUsers.values()).map((u) => ({
    nin: `${u.nin.slice(0, 4)}****${u.nin.slice(14)}`,
    nni: u.nni ? `${u.nni.slice(0, 3)}***` : null,
    telegramLinked: !!u.chatId,
    registeredAt: new Date(u.createdAt).toISOString(),
  }));
  res.json({ users, total: users.length });
});

export default router;
