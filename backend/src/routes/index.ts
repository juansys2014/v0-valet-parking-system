import { Router } from "express";
import entryRoutes from "./entry";
import activeRoutes from "./active";
import historyRoutes from "./history";
import checkoutRoutes from "./checkout";
import ticketsRoutes from "./tickets";
import alertsRoutes from "./alerts";

const apiRouter = Router();

apiRouter.use("/entry", entryRoutes);
apiRouter.use("/active", activeRoutes);
apiRouter.use("/history", historyRoutes);
apiRouter.use("/checkout", checkoutRoutes);
apiRouter.use("/tickets", ticketsRoutes);
apiRouter.use("/alerts", alertsRoutes);

export default apiRouter;
