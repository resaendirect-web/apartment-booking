import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schémas de validation Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['GUEST', 'OWNER']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const authController = {
  /**
   * POST /api/v1/auth/register
   * Inscription d'un nouvel utilisateur
   */
  register: async (req, res) => {
    try {
      // Validation des données
      const validatedData = registerSchema.parse(req.body);
      
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(
        validatedData.password,
        parseInt(process.env.BCRYPT_ROUNDS) || 10
      );
      
      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone,
          role: validatedData.role || 'GUEST'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
        }
      });
      
      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      res.status(201).json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }
      
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  },

  /**
   * POST /api/v1/auth/login
   * Connexion d'un utilisateur
   */
  login: async (req, res) => {
    try {
      // Validation des données
      const validatedData = loginSchema.parse(req.body);
      
      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password
      );
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Vérifier si le compte est actif
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Account is disabled'
        });
      }
      
      // Mettre à jour la date de dernière connexion
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      
      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      // Retourner les données sans le mot de passe
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }
      
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  },

  /**
   * GET /api/v1/auth/me
   * Récupérer les informations de l'utilisateur connecté
   */
  getMe: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true
        }
      });
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user information'
      });
    }
  },

  /**
   * PUT /api/v1/auth/update-profile
   * Mettre à jour le profil de l'utilisateur
   */
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, phone } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone })
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          updatedAt: true
        }
      });
      
      res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  },

  /**
   * PUT /api/v1/auth/change-password
   * Changer le mot de passe
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters'
        });
      }
      
      // Récupérer l'utilisateur avec le mot de passe
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
      
      // Vérifier le mot de passe actuel
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(
        newPassword,
        parseInt(process.env.BCRYPT_ROUNDS) || 10
      );
      
      // Mettre à jour le mot de passe
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      });
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  },

  /**
   * POST /api/v1/auth/forgot-password
   * Demande de réinitialisation de mot de passe
   */
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      // TODO: Implémenter la logique d'envoi d'email de réinitialisation
      // avec nodemailer
      
      res.json({
        success: true,
        message: 'Password reset email sent (not implemented yet)'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process password reset'
      });
    }
  },

  /**
   * POST /api/v1/auth/reset-password/:token
   * Réinitialisation du mot de passe
   */
  resetPassword: async (req, res) => {
    try {
      // TODO: Implémenter la logique de réinitialisation
      
      res.json({
        success: true,
        message: 'Password reset (not implemented yet)'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset password'
      });
    }
  },

  /**
   * POST /api/v1/auth/logout
   * Déconnexion (côté client surtout)
   */
  logout: async (req, res) => {
    try {
      // Avec JWT, la déconnexion est gérée côté client
      // On peut éventuellement ajouter le token à une blacklist
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }
};

export default authController;
