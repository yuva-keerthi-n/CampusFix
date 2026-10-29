const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { signToken } = require('../utils/jwt');
const { ApiError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 10;

// Students self-register only as 'student'. Staff/Admin accounts are seeded,
// never created through this public endpoint (see rule #17 in the spec).
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email and password are required.');
    }
    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters.');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'student' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken({ id: user.id, role: user.role, name: user.name, email: user.email });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = signToken({ id: user.id, role: user.role, name: user.name, email: user.email });

    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
