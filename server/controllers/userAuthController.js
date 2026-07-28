const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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

module.exports = {
  googleLogin,
};
