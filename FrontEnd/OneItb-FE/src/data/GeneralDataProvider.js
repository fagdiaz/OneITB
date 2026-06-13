export class GeneralDataProvider {
    static setToken (token) {
      localStorage.setItem('token', token);
      this.token = token;
    }
  
    static setUser (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  
    static getToken () {
      return (
        this.token ? 'Bearer ' + this.token : `Bearer ${localStorage.getItem('token') || ''}`
      );
    }
  
    static resetToken () {
      localStorage.removeItem('token');
      this.token = undefined;
    }
  
    static resetUser () {
      localStorage.removeItem('user');
    }
  }
