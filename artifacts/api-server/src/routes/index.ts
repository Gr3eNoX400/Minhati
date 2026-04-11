import { Router, type IRouter } from "express";
import healthRouter from "./health";
import telegramRouter from "./telegram";
import anemRouter from "./anem";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", telegramRouter);
router.use(anemRouter);
router.use(adminRouter);

export default router;
