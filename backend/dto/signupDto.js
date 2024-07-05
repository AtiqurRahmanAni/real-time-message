class SignupDto {
  _id;
  username;
  displayName;
  conversation;

  constructor(user) {
    this._id = user._id;
    this.username = user.username;
    this.displayName = user.displayName;
    this.conversation = null;
  }
}

export default SignupDto;
