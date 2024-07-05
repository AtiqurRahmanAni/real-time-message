class MessageDto {
  _id;
  conversationId;
  content;
  sender;
  receiver;

  constructor(message) {
    this._id = message._id;
    this.conversationId = message.conversationId;
    this.content = message.content;
    this.sender = message.sender;
    this.receiver = message.receiver;
  }
}

export default MessageDto;
