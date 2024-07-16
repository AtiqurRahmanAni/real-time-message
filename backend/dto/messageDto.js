class MessageDto {
  _id;
  conversationId;
  content;
  attachments;
  sender;
  receiver;
  createdAt;

  constructor(message) {
    this._id = message._id;
    this.conversationId = message.conversationId;
    this.content = message.content;
    this.attachments = message.attachments;
    this.senderId = message.senderId;
    this.receiverId = message.receiverId;
    this.createdAt = message.createdAt;
  }
}

export default MessageDto;
