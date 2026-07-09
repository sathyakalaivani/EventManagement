import jwt from 'jsonwebtoken';

/**
 * Signs a JWT for the given user id and sets it as an httpOnly cookie.
 * Also returns the raw token so it can be included in the JSON body,
 * which is convenient for clients that prefer bearer-token auth.
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieExpiryDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: cookieExpiryDays * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
