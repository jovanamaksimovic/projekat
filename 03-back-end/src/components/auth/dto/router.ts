import { Application } from 'express';
import IApplicationResourcesInterface from '../../../common/IApplicationResources.interface';
import IRouter from '../../../common/IRouter.interface';
import AuthController from './controller';

export default class AuthRouter implements IRouter {
    public setupRoutes(application: Application, resources: IApplicationResourcesInterface) {
        const authController: AuthController = new AuthController(resources);

        application.post("/auth/user/login", authController.userLogin.bind(authController));
        application.post("/auth/administrator/login", authController.administratorLogin.bind(authController));
    }
}