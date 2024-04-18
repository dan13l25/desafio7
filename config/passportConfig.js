import passport from "passport";
import local from "passport-local";
import userModel from "../dao/models/users.js";
import { createHash, isValidPassword } from "../utils.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true, 
        usernameField: "email"
    }, async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body;
        try {
            const user = await userModel.findOne({ email });
            if (user) {
                console.log("Usuario ya existe");
                return done(null, false);
            }
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                role: "user" // Define el rol aquí
            };
            const result = await userModel.create(newUser);
            return done(null, result);
        } catch (error) {
            return done(error);  
        }
    }));

    passport.use(
        "login",
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                try {
                    const user = await userModel.findOne({ email });
                    if (!user) return done(null, false);
                    const valid = isValidPassword(user, password);
                    if (!valid) return done(null, false);
    
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            if (!user) {
                return done(null, false); 
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    });
};

export default initializePassport;
