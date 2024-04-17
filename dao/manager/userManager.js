import userModel from "../models/users.js";
import bcrypt from "bcrypt";
import { createHash } from "../../utils.js";


const userManager = {

    getLogin: async (req, res) => {
        res.render("login");
    },

    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await userModel.findOne({ email });

            if (!user) {
                return res.status(401).json({ error: "Credenciales invalidas" });
            }

            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ error: "Credenciales invalidas" });
            }

            if (email === "adminCoder@coder.com" && password === "adminCod3er123") {
                user.role = "admin";
            }

            res.locals.username = user.username;
            console.log("Nombre de usuario:", res.locals.username)
            req.session.username = user.username;

            res.cookie("user_id", user._id, { maxAge: 100000, httpOnly: true });

            req.session.userId = user._id;

            req.session.user = user;

            req.session.isAuthenticated = true;

            res.redirect("/chat",);

        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    getRegister: async (req, res) => {
        res.render("register");
    },

    register: async (req, res, next) => {
        const { first_name, last_name, email, age, password, username } = req.body;

        try {
            const existingUser = await userModel.findOne({ email });

            if (existingUser) {
                return res.status(400).json({ error: "El usuario ya existe" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const role = email === "adminCoder@coder.com" ? "admin" : "user";

            const newUser = new userModel({
                first_name: first_name,
                last_name: last_name,
                email: email,
                age: age,
                username: username,
                password: hashedPassword,
                role,
            });

            console.log(newUser)
            await newUser.save();

            res.cookie("user_id", newUser._id, { maxAge: 100000, httpOnly: true });

            req.session.userId = newUser._id;

            req.session.user = newUser;

            req.session.isAuthenticated = true;

            return res.redirect("/api/products");

        } catch (error) {
            console.error("Error al registrar usuario:", error);
            next(error);
        }
    },


    logOut: async (req, res) => {
        try {
            res.clearCookie("user_id");
            req.session.userId = null;
            return res.redirect("/api/users/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    getRestore: async (req, res) => {
        res.render("restore");
    },
    restore: async (req,res) =>{

        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        console.log(user);
        if (!user)
            return res
            .status(400)
            .send({ status: "error", message: "No se encuentra el user" });
        const newPass = createHash(password);

        await userModel.updateOne({ _id: user._id }, { $set: { password: newPass } });

        res.send({ status: "success", message: "Password actualizado" });
    }
}

export default userManager;