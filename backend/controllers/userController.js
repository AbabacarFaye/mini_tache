const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const sendTemporaryPasswordEmail = async ({ to, name, temporaryPassword }) => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const from = SMTP_FROM || SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Mini Tache - Votre accès employé",
    text: `Bonjour ${name},\n\nUn compte employé a été créé pour vous sur Mini Tache.\n\nEmail: ${to}\nMot de passe temporaire: ${temporaryPassword}\n\nMerci de vous connecter et de changer ce mot de passe dès que possible.`,
    html: `
      <p>Bonjour ${name},</p>
      <p>Un compte employé a été créé pour vous sur <strong>Mini Tache</strong>.</p>
      <p><strong>Email:</strong> ${to}<br /><strong>Mot de passe temporaire:</strong> ${temporaryPassword}</p>
      <p>Merci de vous connecter et de changer ce mot de passe dès que possible.</p>
    `,
  });
};

exports.getEmployees = async (req, res) => {
  const employees = await User.find({ role: "employee" });
  res.json(employees);
};

exports.addEmployeeByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.role !== "employee") {
        existingUser.role = "employee";
        await existingUser.save();
      }

      return res.status(200).json({
        message: "Utilisateur déjà existant: promu en employé",
        employee: existingUser,
      });
    }

    const generatedPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    const derivedName = normalizedEmail.split("@")[0];

    const employee = await User.create({
      name: derivedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "employee",
    });

    try {
      await sendTemporaryPasswordEmail({
        to: normalizedEmail,
        name: derivedName,
        temporaryPassword: generatedPassword,
      });
    } catch (emailErr) {
      await User.findByIdAndDelete(employee._id);
      return res.status(500).json({
        message: "Employé non créé: impossible d'envoyer l'email avec le mot de passe.",
        error: emailErr.message,
      });
    }

    return res.status(201).json({
      message: "Employé créé avec succès. Le mot de passe temporaire a été envoyé par email.",
      employee,
      temporaryPassword: generatedPassword,
    });
  } catch (err) {
    console.error("addEmployeeByEmail error:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de l'ajout de l'employé",
      error: err.message,
    });
  }
};