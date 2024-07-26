class GroupMessageDto {
  _id;
  content;
  attachments;
  senderId;
  receiverIds;
  createdAt;

  constructor(message) {
    this._id = message._id;
    this.content = message.content;
    this.attachments = message.attachments;
    this.senderId = message.senderId;
    this.receiverIds = message.receiverIds;
    this.createdAt = message.createdAt;
  }
}

export default GroupMessageDto;
