import "./util/secrets";

import * as homeController from "./controllers/home";

import bodyParser from "body-parser";
import express from "express";
import favicon from "serve-favicon";
import path from "path";

const app = express();

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public"), { maxAge: 3600000 }));
app.use(favicon(path.join(__dirname, "public/images", "favicon.ico")));

app.get("/", homeController.index);

export default app;