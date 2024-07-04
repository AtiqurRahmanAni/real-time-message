class LoginDto {
  _id;
  username;
  displayName;

  constructor(user) {
    this._id = user._id;
    this.username = user.username;
    this.displayName = user.displayName;
  }
}

export default LoginDto;
