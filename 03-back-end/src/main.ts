import * as express from "express";
import * as cors from "cors";
import Config from "./config/dev";
import CategoryRouter from "./components/category/router";
import IApplicationRecources from "./common/IApplicationResources.interface";
import * as mysql2 from 'mysql2/promise';
import Router from "./router";
import FeatureRouter from "./components/feature/router";
import CategoryService from "./components/category/service";
import FeatureService from "./components/feature/service";
import ArticleService from "./components/article/service";
import fileUpload = require("express-fileupload");
import ArticleRouter from "./components/article/router";
import AdministratorRouter from "./components/administrator/router";
import AdministratorService from "./components/administrator/service";
import UserRouter from "./components/user/router";
import UserService from "./components/user/service";
import AuthRouter from "./components/auth/dto/router";
import CartRouter from "./components/cart/router";
import CartService from "./components/cart/service";

async function main() {

    const application: express.Application = express();

    application.use(cors());
    application.use(express.json());

    const resources: IApplicationRecources = {
        databaseConnection: await mysql2.createConnection({
            host: Config.database.host,
            port: Config.database.port,
            user: Config.database.user,
            password: Config.database.password,
            database: Config.database.database,
            charset: Config.database.charset,
            timezone: Config.database.timezone,
            supportBigNumbers: true,
        }),
    }
    resources.databaseConnection.connect();

    resources.services = {
        categoryService: new CategoryService(resources),
        featureService: new FeatureService(resources),
        articleService: new ArticleService(resources),
        administratorService: new AdministratorService(resources),
        userService: new UserService(resources),
        cartService: new CartService(resources),
        
    }

    application.use(fileUpload({
        limits: {
            fileSize: Config.fileUpload.maxSize,
            files: Config.fileUpload.maxFiles,
        },
        useTempFiles: true,
        tempFileDir: Config.fileUpload.temporaryDirectory,
        uploadTimeout: Config.fileUpload.timeout,
        safeFileNames: true,
        preserveExtension: true,
        createParentPath: true,
        abortOnLimit: true,
     }));
    application.use(
        Config.server.static.route,
        express.static(Config.server.static.path, {
            index: Config.server.static.index,
            cacheControl: Config.server.static.cacheControl,
            maxAge: Config.server.static.maxAge,
            etag: Config.server.static.etag,
            dotfiles: Config.server.static.dotfiles,
        })

    );

    /* const categoryService: CategoryService = new CategoryService();
    const categoryController: CategoryController = new CategoryController(categoryService);

    application.get("/category", categoryController.getAll.bind(categoryController));
    application.get("/category/:id", categoryController.getById.bind(categoryController));
    */

    Router.setupRoutes(application, resources, [
        new CategoryRouter(),
        new FeatureRouter(),
        new ArticleRouter(),
        new AdministratorRouter(),
        new UserRouter(),
        new AuthRouter(),
        new CartRouter(),

    ])

    application.use((req, res) => {
        res.sendStatus(404);
    });

    application.use((err, req, res, next) => {
        res.status(err.status).send(err.type);
    });

    application.listen(Config.server.port);
};
main();