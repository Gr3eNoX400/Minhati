import { Router, type IRouter } from "express";
import healthRouter from "./health";
import telegramRouter from "./telegram";
import anemRouter from "./anem";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", telegramRouter);
router.use(anemRouter);

export default router;
