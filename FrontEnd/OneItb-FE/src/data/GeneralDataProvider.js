export class GeneralDataProvider {
    static setToken (token) {
      localStorage.setItem('token_type', 'Bearer ');
      localStorage.setItem('access_token', token);
      this.token = token;
    }
  
    static setUser (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  
    static getToken () {
      return (
        this.token ? 'Bearer ' + this.token : localStorage.getItem('token_type') + localStorage.getItem('access_token')
      );
    }
  
    static resetToken () {
      localStorage.removeItem('token_type');
      localStorage.removeItem('access_token');
      this.token = undefined;
    }
  
    static resetUser () {
      localStorage.removeItem('user');
    }
  }