import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import api from './api';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // Initialize auth state listener
  init() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            const response = await api.post('/auth/login', { firebaseToken: token });
            
            if (response.data.success) {
              this.currentUser = response.data.user;
              this.notifyListeners(this.currentUser);
            }
          } catch (error) {
            console.error('Auth initialization error:', error);
            this.currentUser = null;
            this.notifyListeners(null);
          }
        } else {
          this.currentUser = null;
          this.notifyListeners(null);
        }
        resolve(this.currentUser);
      });

      // Return unsubscribe function
      this.unsubscribe = unsubscribe;
    });
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      const response = await api.post('/auth/login', { firebaseToken: token });
      
      if (response.data.success) {
        this.currentUser = response.data.user;
        this.notifyListeners(this.currentUser);
        return this.currentUser;
      }
      
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await firebaseSignOut(auth);
      this.currentUser = null;
      this.notifyListeners(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Check user role
  hasRole(role) {
    return this.currentUser?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.currentUser?.role);
  }

  // Get user token
  async getToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        this.currentUser = { ...this.currentUser, ...response.data.user };
        this.notifyListeners(this.currentUser);
        return this.currentUser;
      }
      
      throw new Error('Profile update failed');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Add auth state listener
  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of auth state change
  notifyListeners(user) {
    this.listeners.forEach(callback => callback(user));
  }

  // Cleanup
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.listeners = [];
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;