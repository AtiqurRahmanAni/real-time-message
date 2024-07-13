class MessageDto {
  _id;
  conversationId;
  content;
  sender;
  receiver;
  createdAt;

  constructor(message) {
    this._id = message._id;
    this.conversationId = message.conversationId;
    this.content = message.content;
    this.senderId = message.senderId;
    this.receiverId = message.receiverId;
    this.createdAt = message.createdAt;
  }
}

export default MessageDto;
