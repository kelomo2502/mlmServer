const getLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.json(false);
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
      res.json(true);
    } else {
      res.json(false);
    }

    const marketer = await Marketer.findById(verified.id).select("-password");
    if (!marketer) {
      return res.json(false);
    }

    res.json(true);
  } catch (error) {
    res.json(false); // Token verification failed or some other error occurred
  }
});
