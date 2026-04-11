import jwt from "jsonwebtoken";

export const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(" ")[1];

   try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next()
  } catch (err) {
    return res.sendStatus(401);
  }
}

export const createJwt = (user) => jwt.sign(
    {userId: user._id, firstName:user.firstName,  lastname:user.lastName, username:user.username},
    process.env.JWT_SECRET,
    {expiresIn: "7d"}
  )