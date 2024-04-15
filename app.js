import { Server } from "socket.io";
import express from "express";
import mongoose from "mongoose";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import { productRouter } from "./routes/productRouter.js";
import { cartRouter } from "./routes/cartRouter.js";
import messagesModel from "./dao/models/message.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import userRouter from "./routes/userRouter.js";
import MongoStore from "connect-mongo";

const app = express();
const port = process.env.PORT || 8080;
const server = app.listen(port, () => console.log("Servidor operando en puerto", port));

// Definición de DB_URL
const DB_URL = "mongodb+srv://dan13l:dani06011998@cluster0.pm7efvk.mongodb.net/ecommerce";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());

// Configuración de la sesión
app.use(
  session({
    store: new MongoStore({
      mongoUrl: DB_URL,
      ttl: 3600,
    }),
    secret: "Secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/chat", (req, res) => {
  res.render("chat");
});

app.get("/product", (req, res) => {
  res.render("product");
});

app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/register", (req, res) => {
    res.render("register");
  });

// Conexión a la base de datos
const connectMongoDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1);
  }
};

connectMongoDB();

const io = new Server(server);
const msg = [];

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado:", socket.id);

  socket.on("message", async (data) => {
    try {
      const newMessage = new messagesModel(data);
      await newMessage.save();
      io.emit("messageLogs", await messagesModel.find());
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
    }
  });
});
