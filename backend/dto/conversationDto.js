class ConversationDto {
  _id;
  lastMessage;
  lastMessageTimestamp;

  constructor(conversation) {
    this._id = conversation._id;
    this.lastMessage = conversation.lastMessage;
    this.lastMessageTimestamp = conversation.lastMessageTimestamp;
  }
}

export default ConversationDto;
