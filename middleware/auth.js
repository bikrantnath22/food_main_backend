const auth = (req, res, next) => {
  try {
    if (req.cookies.isLoggedIn) {
      return next();
    }
    console.log(req.cookies);
    return res.status(400).json({ msg: "NOT AUTHENTICATED" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "ACCESS DENIED!" });
  }
};
const getAuthDetails = (req) => {
  if (req.cookies.isLoggedIn)
    return {
      status: true,
      user_id: req.cookies.user_id,
      role: req.cookies.role,
    };
  return false;
};

const isAdmin = (req, res, next) => {
  const authDetails = getAuthDetails(req);
  if (authDetails && authDetails.role === "admin") {
    next();
  }
  return res.status(500).json({ msg: "ACCESS DENIED!" });
};

const paymentStore = new Map();

module.exports = { auth, getAuthDetails, isAdmin, paymentStore };
