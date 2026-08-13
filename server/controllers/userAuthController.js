const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const SastranetSsoToken = require("../models/SastranetSsoToken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    // UPDATE: Allows 9-digit @sastra.ac.in OR any @sastra.edu email
    const isAcIn = /^\d{9}@sastra\.ac\.in$/i.test(email);
    const isEdu = email.toLowerCase().endsWith("@sastra.edu");

    if (!isAcIn && !isEdu) {
      return res.status(403).json({
        message: "Only valid SASTRA email accounts are allowed",
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        name,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: "customer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Google login failed",
    });
  }
};

const isValidSastraEmail = (email) => {
  const isAcIn = /^\d{9}@sastra\.ac\.in$/i.test(email);
  const isEdu = email.toLowerCase().endsWith("@sastra.edu");
  return isAcIn || isEdu;
};

const sastranetLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (typeof token !== "string" || !token) {
      return res.status(400).json({ message: "Sastranet token is required" });
    }

    if (!process.env.SASTRANET_SSO_SECRET) {
      console.error("SASTRANET_SSO_SECRET is not configured");
      return res.status(503).json({ message: "Sastranet sign in is unavailable" });
    }

    // Verification happens only on the API server. Never expose this secret
    // to the browser or use a VITE_ environment variable for it.
    const payload = jwt.verify(token, process.env.SASTRANET_SSO_SECRET, {
      algorithms: ["HS256"],
    });
    const {
      email,
      name,
      sastranet_user_id: sastranetUserId,
      jti,
      iat,
      exp,
    } = payload;

    if (
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof sastranetUserId !== "string" ||
      typeof jti !== "string" ||
      typeof iat !== "number" ||
      typeof exp !== "number" ||
      exp - iat > 5 * 60 ||
      exp <= iat ||
      !isValidSastraEmail(email)
    ) {
      return res.status(400).json({ message: "Invalid Sastranet token payload" });
    }

    // A successful insert consumes the token. A duplicate-key error means the
    // same SSO JWT was already exchanged and must not create another session.
    try {
      await SastranetSsoToken.create({
        jti,
        expiresAt: new Date(exp * 1000),
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(401).json({ message: "Sastranet token has already been used" });
      }
      throw error;
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({
      $or: [{ email: normalizedEmail }, { sastranetUserId }],
    });

    if (user) {
      // Do not silently join two separate accounts with conflicting identities.
      if (
        (user.email !== normalizedEmail) ||
        (user.sastranetUserId && user.sastranetUserId !== sastranetUserId)
      ) {
        return res.status(409).json({ message: "Sastranet account does not match this Vela account" });
      }
      user.sastranetUserId = sastranetUserId;
      if (!user.name) user.name = name.trim();
      await user.save();
    } else {
      user = await User.create({
        email: normalizedEmail,
        name: name.trim(),
        sastranetUserId,
      });
    }

    const customerToken = jwt.sign(
      { id: user._id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({ token: customerToken, user });
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or expired Sastranet token" });
    }
    console.error("Sastranet login failed", error);
    return res.status(500).json({ message: "Sastranet login failed" });
  }
};

module.exports = {
  googleLogin,
  sastranetLogin,
};
